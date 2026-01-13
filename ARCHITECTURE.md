# Market Simulation - System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TRADER CLIENTS                            │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Browser 1       │  │  Browser 2       │  ...           │
│  │  React App       │  │  React App       │                 │
│  └────────┬─────────┘  └────────┬─────────┘                 │
└───────────┼──────────────────────┼──────────────────────────┘
            │                      │
            │  WebSocket/REST      │
            │  Real-time Sync      │
            │                      │
┌───────────▼──────────────────────▼──────────────────────────┐
│                  FIREBASE (Single Source of Truth)          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Firestore Database                                    │ │
│  │  ├─ /users/{uid}                                       │ │
│  │  ├─ /trades/{tradeId}  [Immutable Log]                │ │
│  │  ├─ /news/{newsId}     [Public + Decaying]           │ │
│  │  ├─ /sessions/{sessionId}                             │ │
│  │  ├─ /price_history/{id}                               │ │
│  │  └─ /artifacts/{appId}/public/data/market_state/main  │ │
│  │     → Central market state (prices, news, time)        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Cloud Functions (Backend Logic)                       │ │
│  │  ├─ marketEngine (every 1 second)                      │ │
│  │  │  └─ Calculates price updates                        │ │
│  │  ├─ archiveOldData (daily)                             │ │
│  │  └─ cleanupControllers (every 5 min)                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Authentication                                        │ │
│  │  └─ Anonymous + Role-based (trader|admin)              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Firebase Hosting                                      │ │
│  │  └─ Serves static frontend                             │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow

### Trading Flow

```
User Action (Buy/Sell)
    ↓
Frontend validates (cash, quantity)
    ↓
Firebase write: /trades/{tradeId}
    ↓
Firestore rules verify:
  - User is authenticated
  - Data matches schema
  - Trade is valid
    ↓
✅ Trade logged (immutable)
    ↓
User portfolio updated in /users/{uid}
```

### Market Update Flow

```
Every 1 second:
    ↓
Cloud Function: marketEngine triggers
    ↓
1. Get active session + controller ID
2. Fetch current market state
3. Fetch active news with decay > 0
    ↓
For each stock:
  a) Apply base drift + random walk
  b) Calculate news impact
  c) Apply behavioral modifiers
  d) Apply reaction lag
  e) Apply hard clamps
  f) Update sentiment indicator
    ↓
4. Decay news (half-life = 2 min)
5. Write updated prices to market_state
6. Log price history
    ↓
All clients subscribed to market_state
receive live update via Firestore listener
    ↓
UI updates with new prices
```

### News Injection Flow

```
Admin: Injects news via NewsInjection form
    ↓
Frontend validates news data:
  - Headline required
  - Sentiment in [-1, 1]
  - Optics in [0, 1]
    ↓
Firestore write: /news/{newsId}
    ↓
Firestore rules:
  - Only controller can write
  - Data matches schema
    ↓
✅ News logged with decay = 1.0
    ↓
Next market tick:
  - reads this news
  - includes in price calculations
  - sentiment × optics × decay affects prices
    ↓
News decays exponentially:
  - Half-life: 2 minutes
  - After ~10 min: negligible impact
  - Archived when decay < 0.01
```

## Key Design Decisions

### 1. Single Controller Model

**Why**: Prevents split reality and race conditions

- Only one user can run market physics
- If controller disconnects, market FREEZES (no auto-recovery)
- Forces explicit session management

**Implementation**:
```typescript
// Only one active session can have active: true
// Only that session's controllerId can update market_state
// If heartbeat missing for 5 min → market frozen + session deactivated
```

### 2. Immutable Trade Log

**Why**: Ensures experiment integrity and audit trail

- Trades are write-once, never modified/deleted
- Every trade captures:
  - What user saw (prices, news at moment)
  - Market sentiment at execution
  - Reaction time context

**Query for analysis**:
```firestore
db.collection('trades')
  .where('userId', '==', 'user-1')
  .where('timestamp', '>', startTime)
  .orderBy('timestamp')
  .get()
```

### 3. News as First-Class Force

**Why**: News IS the mechanism, not decoration

- Each news item carries sentiment + optics
- Decay is automatic (exponential, not linear)
- Different sources have different visual weight

**News Impact Formula**:
```
impact = sentiment × optics × visual × decay × lag
+ behavioral_modifiers
= clamp([-5%, +5%], result)
```

### 4. Reaction Lag (Not Instant)

**Why**: Realistic human/market delay

- 60% of impact applied immediately
- 40% of impact delayed to next tick
- Creates observable herd behavior and regret

### 5. Behavioral Modifiers

**Why**: Psychological realism

- **Loss aversion**: Losses amplified 30%, gains dampened 30%
- **Mean reversion**: Price slowly drifts back if news fades
- **Volatility bounds**: Prevents absurd spikes

## Security Model

### Firestore Rules

```
- Read access: Authenticated users only
- Write access: Role-based
  - Users write to their own docs
  - Trades are write-once
  - Only controller updates market state
  - News decay updated by functions
```

### Authentication

```
- Anonymous signup (no email/password)
- Role assignment: admin vs trader
- Controller lock: only one person at a time
```

## Scalability

### Read Operations
- 60 traders refresh portfolio: 60 reads/tick
- Market update subscription: 1 broadcast
- News feed: ~10 reads per user

### Write Operations
- Market tick: ~3 writes (prices, history, state)
- User trade: 1 write to trades, 1 to user
- News injection: 1 write + 1 decay update

### Estimated Costs
- 1000 trades/day: ~$3-5/month
- 1M price history records: ~$1-2/month
- Cloud Functions: ~$0.50-2/month

## Failure Modes & Recovery

### Controller Disconnects
```
Scenario: Admin closes browser mid-session
Result: Market FREEZES (no auto-recovery)
Recovery: New admin can claim control + resume
Why: Prevents data forks
```

### Network Lag
```
Scenario: User has slow connection
Result: UI displays "connecting..." state
Data: Trade still posted, just delayed sync
```

### Firestore Quota Hit
```
Scenario: Too many writes in short time
Result: Functions queue, rate limited
Recovery: Automatic (Firebase handles)
```

## Extension Points

### Adding New Asset Class

1. Add to initial stock list
2. All physics apply automatically
3. News can target by symbol

### Adding Leverage/Margin

❌ **Against system principles** - keeps it simple

### Adding Advanced Orders

❌ **Against system principles** - forces emotional impulse

### Adding AI Trader Bot

✅ Allowed - adds another "player"
- Would submit trades like any user
- All trades logged
- Interesting for herd behavior study

## Monitoring & Analysis

### Live Monitoring

1. **Admin Panel**: Session status, current prices
2. **Firebase Console**: Real-time trade logs
3. **Cloud Functions Logs**: Engine health

### Post-Experiment Analysis

```bash
# Export all data
Admin Panel → Export Data → market-data-{timestamp}.json

# Analyze trades
jq '.trades | group_by(.symbol) | map({symbol: .[0].symbol, count: length})' market-data.json

# Sentiment tracking
jq '.news | map({sentiment: .sentiment, timestamp: .timestamp})' market-data.json
```

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
firebase emulators:start
# Tests run against local emulator
```

### Load Testing
```bash
# Simulate N concurrent traders
artillery quick -c 100 -d 300 https://your-app.firebaseapp.com
```

---

**Design Philosophy**: This system prioritizes **observability** and **behavioral realism** over speed or profit. Every action is logged. Every delay is intentional. Every loss is felt.
