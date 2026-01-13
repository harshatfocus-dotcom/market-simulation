# Behavioral Finance Simulation Platform

A real-time, multi-user synchronized market simulation that explores how information, delay, perception, and human bias move prices and influence trading decisions.

## Core Philosophy

This is NOT a price chart toy. This is a controlled behavioral economics experiment where:

- **Live market universe**: All users see the same prices and news
- **Single controller**: Only one admin runs market physics
- **Psychological realism**: Delays, overreactions, and loss aversion are built-in
- **Complete logging**: Every trade is captured for post-experiment analysis
- **Fragile by design**: Market freezes if controller disconnects (no silent recovery)

## Features

### For Traders
- Live market prices across multiple stocks
- Real-time news feed with visual prominence indicators
- Simple buy/sell orders with portfolio tracking
- Immediate feedback on filled trades
- P&L tracking

### For Admins
- **Market Control**: Start/pause/reset market sessions
- **News Injection**: Inject realistic news events with:
  - Sentiment signals (-1 to +1)
  - Visual prominence (optics)
  - News source type (breaking, analysis, rumor, etc.)
  - Target scope (individual stock, sector, or market-wide)
- **Real-time Monitoring**: Track all trades and market reactions
- **Data Export**: JSON export of all trades and news for analysis

### Market Physics Engine

Runs continuously to calculate realistic price movement:

1. **Base Drift**: Gaussian random walk (mu=0.1%, sigma=1.5%)
2. **News Impact**: 
   - Impact = sentiment × optics × visual × decay
   - Dampens over time
3. **Behavioral Modifiers**:
   - Gains dampened by 30% (loss aversion)
   - Losses amplified by 30%
   - Mean reversion after attention fades
4. **Reaction Lag**: Markets react 60% immediately, 40% delayed
5. **Hard Clamps**: No price spike >5% per tick, bounded volatility

## Architecture

```
Frontend (React + TypeScript)
├── Trader Dashboard
├── Admin Panel
└── Real-time Sync → Firebase

Firebase (Single Source of Truth)
├── Firestore
│   ├── /users - Participant data & portfolios
│   ├── /trades - All executed trades (logged)
│   ├── /news - News events with decay
│   ├── /sessions - Active market sessions
│   └── /price_history - 60-tick price history
├── Realtime Database
│   └── Market state sync
└── Cloud Functions
    ├── marketEngine - Physics tick (every 1s)
    ├── archiveOldData - Daily cleanup
    └── cleanupControllers - Session recovery

Deployment
├── Frontend → Firebase Hosting
└── Backend → Cloud Functions
```

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Firestore & Functions enabled
- Firebase CLI installed

### Installation

```bash
# Install all dependencies
npm run install-dependencies

# Create frontend environment file
cp frontend/.env.example frontend/.env.local

# Update .env.local with your Firebase credentials
```

### Firebase Configuration

1. Create a new Firebase project
2. Enable Firestore Database
3. Enable Cloud Functions
4. Create a service account for local development
5. Update environment variables in `frontend/.env.local`

### Running Locally

```bash
# Terminal 1: Start frontend dev server
npm run dev

# Terminal 2: Start Firebase emulators (optional, for local testing)
cd functions && npm run serve
```

### Deployment

```bash
# Build all packages
npm run build

# Deploy to Firebase
npm run deploy
```

## Firestore Rules

```javascript
// Only one active session per app
// Only controller can update market state
// Only user can update their own portfolio
// All trades are immutable once logged
```

## Data Schema

### Users Collection
```json
{
  "id": "uid",
  "cash": 100000,
  "portfolio": { "TECH": 10, "ENERGY": 5 },
  "totalValue": 120000,
  "role": "trader|admin",
  "isController": false,
  "createdAt": 1234567890
}
```

### Market State (Real-time)
```json
{
  "prices": {
    "TECH": {
      "symbol": "TECH",
      "price": 105.32,
      "change": 0.50,
      "changePercent": 0.48,
      "sentiment": 0.3,
      "optics": 0.8
    }
  },
  "news": [ /* active news items */ ],
  "time": 1234567890,
  "sessionStatus": "active",
  "controllerId": "admin-uid",
  "lastUpdate": 1234567890
}
```

### Trades Collection
```json
{
  "id": "uid-timestamp",
  "userId": "uid",
  "symbol": "TECH",
  "quantity": 5,
  "price": 105.00,
  "type": "buy",
  "timestamp": 1234567890,
  "sentiment": 0.3,
  "newsContext": ["news-id-1", "news-id-2"]
}
```

### News Collection
```json
{
  "id": "news-timestamp",
  "headline": "Fed Raises Rates Unexpectedly",
  "description": "Central bank moves to combat inflation...",
  "sentiment": -0.7,
  "optics": 0.9,
  "source": "breaking",
  "target": "market",
  "timestamp": 1234567890,
  "decay": 0.95,
  "injectedBy": "admin-uid"
}
```

## Extension Guidelines

If extending this system:

- ❌ Never let clients calculate prices
- ❌ Never allow multiple physics loops
- ❌ Never auto-correct human mistakes
- ❌ Never over-optimize visuals over causality
- ✅ Everything must serve behavioral observation, not gamification

## Use Cases

- **Academic Research**: Study how information flows affect trading
- **Behavioral Finance Studies**: Measure overreaction and herding
- **Trader Training**: Safe environment to practice under pressure
- **Market Microstructure**: Observe delayed reactions and momentum
- **Herd Behavior Analysis**: Track collective decision-making

## License

MIT

## Support

For issues or questions, contact the admin panel or review the data export JSON.

---

**Remember**: This system is not about making money. It's about watching humans believe information faster than they understand it.
