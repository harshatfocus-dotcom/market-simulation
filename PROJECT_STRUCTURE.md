# Project Structure & File Guide

## Overview

```
market-simulation/
├── frontend/                    # React TypeScript application
├── functions/                   # Firebase Cloud Functions
├── README.md                    # Main documentation
├── QUICKSTART.md               # 5-minute setup guide
├── DEPLOYMENT.md               # Production deployment
├── ARCHITECTURE.md             # System design deep dive
├── firebase.json               # Firebase config
├── .firebaserc                 # Firebase project ID
├── firestore.rules             # Firestore security rules
├── package.json                # Root workspace config
├── analyze-trades.js           # Data analysis tool
├── setup.sh                    # Setup script
└── .gitignore                  # Git ignore rules
```

## Frontend Structure

```
frontend/
├── public/
│   └── index.html             # Main HTML (with fonts)
├── src/
│   ├── main.tsx               # Entry point
│   ├── index.css              # Tailwind styles
│   ├── lib/
│   │   ├── firebase.ts        # Firebase init & config
│   │   ├── store.ts           # Zustand state management
│   │   │   └── Types:
│   │   │       - Stock (price data)
│   │   │       - News (news items)
│   │   │       - Trade (trade logs)
│   │   │       - User (portfolio)
│   │   │       - MarketState (shared state)
│   │   └── api.ts             # Firebase API calls
│   │       └── Functions:
│   │           - authenticateUser()
│   │           - getUserData()
│   │           - submitTrade()
│   │           - claimController()
│   ├── components/
│   │   ├── PriceTicker.tsx     # Stock price display
│   │   ├── NewsCard.tsx        # News item display
│   │   ├── TradeForm.tsx       # Buy/sell form
│   │   ├── PriceChart.tsx      # Recharts line chart
│   │   ├── Portfolio.tsx       # Portfolio display
│   │   ├── AdminControls.tsx   # Admin session controls
│   │   └── NewsInjection.tsx   # News injection form
│   └── pages/
│       ├── App.tsx             # Main router & init
│       ├── Dashboard.tsx       # Trader dashboard
│       └── AdminDashboard.tsx  # Admin panel
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite bundler config
├── tailwind.config.js         # Tailwind CSS config
├── postcss.config.js          # PostCSS config
├── .env.example               # Environment template
└── index.html                 # HTML template
```

## Backend Functions Structure

```
functions/
├── src/
│   └── index.ts              # Main functions file
│       ├── Types:
│       │   - Stock
│       │   - MarketState
│       │   - NewsImpact
│       └── Functions:
│           - gaussianRandom()         # Random walk generator
│           - calculatePriceImpact()   # News impact calc
│           - applyReactionLag()       # Lag simulator
│           - tickMarket()             # Main engine
│           - marketEngine()           # Scheduled trigger (1s)
│           - manualTick()             # HTTP trigger
│           - archiveOldData()         # Daily cleanup
│           - cleanupControllers()     # Session recovery
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── .eslintrc.json           # ESLint config
```

## Database Schema (Firestore)

### Collections

```
users/
├── {uid}
│   ├── id: string
│   ├── cash: number
│   ├── portfolio: Record<symbol, quantity>
│   ├── totalValue: number
│   ├── role: "trader" | "admin"
│   ├── isController: boolean
│   └── createdAt: number

trades/
├── {tradeId}
│   ├── id: string
│   ├── userId: string
│   ├── symbol: string
│   ├── quantity: number
│   ├── price: number
│   ├── type: "buy" | "sell"
│   ├── timestamp: number
│   ├── sentiment: number (-1 to 1)
│   └── newsContext: string[]

news/
├── {newsId}
│   ├── id: string
│   ├── headline: string
│   ├── description: string
│   ├── sentiment: number (-1 to 1)
│   ├── optics: number (0 to 1)
│   ├── visual: number
│   ├── source: string
│   ├── target: string
│   ├── timestamp: number
│   ├── decay: number (0 to 1)
│   ├── injectedBy: string
│   └── archived: boolean

sessions/
├── {sessionId}
│   ├── id: string
│   ├── controllerId: string
│   ├── active: boolean
│   ├── status: string
│   ├── startTime: number
│   └── lastHeartbeat: number

price_history/
├── {docId}
│   ├── symbol: string
│   ├── price: number
│   ├── timestamp: number
│   └── sentiment: number

artifacts/{appId}/public/data/market_state/
├── main
│   ├── prices: Record<symbol, Stock>
│   ├── news: News[]
│   ├── time: number
│   ├── sessionStatus: "idle" | "active" | "paused" | "ended"
│   ├── controllerId: string | null
│   └── lastUpdate: number
```

## Key Components Explained

### PriceTicker.tsx
- Displays individual stock with price, change%, sentiment indicator
- Clickable to select for trading

### TradeForm.tsx
- Input for quantity
- Select buy/sell
- Calculates total cost
- Validates cash available
- Submits trade to Firestore

### Dashboard.tsx
- Main trader view
- Fetches market state + user data
- Subscribes to live price updates
- Displays price tickers, news feed, portfolio
- Handles trade submission

### AdminDashboard.tsx
- Admin-only route
- Claims controller authority
- Start/pause/reset market session
- News injection interface
- Data export button

### Market Engine (functions/src/index.ts)
**Core algorithm** running every 1 second:

```typescript
1. Get active session + prices
2. Fetch news with decay > 0
3. For each stock:
   a) drift = 0.1% + gaussianRandom(0, 1.5%)
   b) newsImpact = sum(news sentiment * optics * decay)
   c) laggedImpact = newsImpact * 0.6 (40% delayed)
   d) total = drift + laggedImpact
   e) if total > 0: total *= 0.7 (dampened gains)
      if total < 0: total *= 1.3 (amplified losses)
   f) total = clamp(total, -5%, +5%)
   g) newPrice = price * (1 + total)
4. Update Firestore with new prices
5. Decay all news: decay *= 0.99
```

## Security Rules Summary

| Collection | Read | Write | Notes |
|------------|------|-------|-------|
| users/{uid} | User only | User only | Personal data |
| trades/{id} | All authenticated | Write-once | Immutable log |
| news/{id} | All authenticated | Controller only | Public + decaying |
| sessions/{id} | All authenticated | Controller + Functions | Session mgmt |
| price_history/{id} | All authenticated | Functions only | Auto-logged |
| market_state/{id} | All authenticated | Controller + Functions | Shared state |

## Authentication Flow

```
User opens app
    ↓
signInAnonymously() via Firebase Auth
    ↓
If first time: create /users/{uid} document
    ↓
Load user data + market state
    ↓
If role === "admin": show AdminDashboard
   Else: show Dashboard
```

## Real-time Sync Flow

```
Frontend subscribes to:
  - /artifacts/{uid}/public/data/market_state/main
  - /users/{uid}
  - /news (query: where decay > 0)
    ↓
Firestore listener triggers on change
    ↓
Updates Zustand store
    ↓
React re-renders UI
    ↓
User sees live prices & news
```

## Data Export Format

Admin can export all data as JSON:

```json
{
  "exportDate": "2024-01-13T...",
  "trades": [
    {
      "id": "uid-timestamp",
      "userId": "uid",
      "symbol": "TECH",
      ...
    }
  ],
  "news": [
    {
      "id": "news-timestamp",
      "headline": "...",
      ...
    }
  ],
  "metadata": {
    "totalTrades": 1234,
    "totalNewsItems": 56
  }
}
```

Then analyze with: `node analyze-trades.js export.json`

## Development Commands

```bash
# Install everything
npm run install-dependencies

# Frontend dev server
npm run dev

# Build everything
npm run build

# Deploy to Firebase
npm run deploy

# Setup script
bash setup.sh

# Analyze exported data
node analyze-trades.js market-data-*.json

# Build frontend only
cd frontend && npm run build

# Build functions only
cd functions && npm run build

# Run functions locally
cd functions && npm run serve
```

## Deployment Checklist

- [ ] Update .firebaserc with your project ID
- [ ] Create frontend/.env.local with Firebase credentials
- [ ] Enable Firestore, Functions, Hosting in Firebase Console
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Build and deploy frontend: `firebase deploy --only hosting`
- [ ] Build and deploy functions: `firebase deploy --only functions`
- [ ] Initialize market state in Firestore
- [ ] Create admin user document
- [ ] Test login and admin controls
- [ ] Verify market engine running in Cloud Functions logs

## Performance Metrics

- **Market tick time**: ~50-100ms (Firestore writes)
- **UI update latency**: ~100-200ms (listener propagation)
- **Trade submission**: ~200-500ms (validation + log)
- **Firestore cost**: ~$5-15/month (modest usage)
- **Functions cost**: ~$0.50-2/month

## Troubleshooting Guide

| Issue | Cause | Fix |
|-------|-------|-----|
| App won't load | Firebase config missing | Set .env.local |
| No real-time updates | Market state doc doesn't exist | Create manually in Firestore |
| Can't trade | Session not active | Admin must start session |
| Market prices frozen | Controller disconnected | New admin claims control |
| Functions not running | Not deployed | Run `firebase deploy --only functions` |
| Slow prices | Firestore quota hit | Wait or upgrade plan |

## Next Development Steps

1. **Add more assets**: Create new stock symbols
2. **Add leverage**: Update TradeForm to accept margin
3. **Add AI trader**: Create bot Cloud Function
4. **Add WebSocket**: Use Realtime Database instead of Firestore
5. **Add mobile app**: React Native version
6. **Add voice trades**: Speech-to-text integration
7. **Add sentiment API**: Real news feed integration

---

This structure keeps everything organized and scalable. Each module has a single responsibility and clear interfaces. Good luck with your market simulation! 📊
