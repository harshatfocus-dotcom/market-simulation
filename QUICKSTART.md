# Quick Start Guide

## 5-Minute Setup

### Step 1: Get Firebase Credentials

1. Go to [firebase.google.com](https://firebase.google.com)
2. Create a new project
3. Go to **Settings** → **Project Settings**
4. Copy your Web API credentials

### Step 2: Configure Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` and paste your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project
VITE_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
VITE_FIREBASE_DATABASE_URL=https://my-project.firebaseio.com
```

### Step 3: Install & Run Locally

```bash
npm install
npm run install-dependencies
npm run dev
```

This starts the frontend dev server on `http://localhost:3000`

### Step 4: Initialize Market State (First Time Only)

Open your browser to the app. You'll be auto-authenticated. Then:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Open Firestore Database
3. Create a new document at: `artifacts/[YOUR_UID]/public/data/market_state/main`
   - Get YOUR_UID from the browser console: `firebase.auth().currentUser.uid`
4. Add this data:

```json
{
  "prices": {
    "TECH": {
      "symbol": "TECH",
      "price": 100,
      "change": 0,
      "changePercent": 0,
      "sentiment": 0,
      "optics": 0
    },
    "ENERGY": {
      "symbol": "ENERGY",
      "price": 80,
      "change": 0,
      "changePercent": 0,
      "sentiment": 0,
      "optics": 0
    },
    "FINANCE": {
      "symbol": "FINANCE",
      "price": 120,
      "change": 0,
      "changePercent": 0,
      "sentiment": 0,
      "optics": 0
    }
  },
  "news": [],
  "time": 1704067200000,
  "sessionStatus": "idle",
  "controllerId": null,
  "lastUpdate": 1704067200000
}
```

### Step 5: Make Yourself Admin

In Firestore, find your user document at `/users/[YOUR_UID]` and update:

```json
{
  "role": "admin"
}
```

Refresh the app. You now have admin powers!

### Step 6: Deploy Cloud Functions

First, enable these in Firebase Console:
- ✅ Cloud Functions
- ✅ Firestore Database
- ✅ Firebase Hosting

Then:

```bash
firebase deploy --only functions
```

Your market engine is now running! Every second, it calculates new prices.

### Step 7: Start a Market Session

1. Refresh your app
2. Click **"Claim Market Control"** in the Admin Panel
3. Click **"Start Session"**
4. Market prices should now update every second

You're done! 🎉

---

## Using the Platform

### As a Trader

1. Select a stock from the price tickers
2. Enter quantity to buy/sell
3. Click "Execute Trade"
4. Monitor your portfolio

### As an Admin

1. **Start/Pause Market**: Use Admin Controls
2. **Inject News**: Use News Injection panel
   - Set sentiment (-1 = bearish, +1 = bullish)
   - Set optics (0 = buried, 1 = front page)
3. **Export Data**: Click Export Data button

---

## Troubleshooting

### App shows "Initializing Market..."?
- Check Firebase Console - is Firestore available?
- Check browser console for errors
- Verify `.env.local` has correct Firebase config

### Can't execute trades?
- Ensure you have cash (default $100k)
- Check quantity and price are valid
- Verify market session is "active" (Admin Panel)

### Market prices not updating?
- Check Cloud Functions are deployed: `firebase deploy --only functions`
- Check function logs: `firebase functions:log`
- Verify session `controllerId` matches your UID

### No admin panel showing?
- Ensure your user role is "admin" in Firestore
- Refresh the page
- Check browser console for errors

---

## What's Happening Under the Hood

### Every Second
1. Cloud Function `marketEngine` triggers
2. Gets all active stocks
3. Calculates price changes:
   - Base drift (0.1% + random)
   - News impact (sentiment × optics × decay)
   - Behavioral mods (loss aversion, mean reversion)
   - Reaction lag (40% delayed)
4. Hard clamps changes to ±5%
5. Writes new prices to Firestore
6. All clients get real-time update

### When You Trade
1. Frontend validates (cash, quantity)
2. Submits to Firestore `/trades` collection
3. Security rules verify authenticity
4. Trade is permanently logged
5. Your portfolio updates

### When Admin Injects News
1. Injects news with sentiment + optics
2. Stored in `/news` collection with decay=1.0
3. Next market tick reads this news
4. News impact = sentiment × optics × decay
5. Every tick, decay *= 0.99 (half-life ~2 min)
6. Eventually archived

---

## Next Steps

### Study the Code
- Frontend: `frontend/src/pages` (React components)
- Backend: `functions/src/index.ts` (Market engine)
- Store: `frontend/src/lib/store.ts` (State management)

### Extend the System
- Add more stocks: Update initial prices in market state
- Add more news sources: Edit NewsInjection component
- Add AI bot: Create trading Cloud Function

### Deploy to Production
See [DEPLOYMENT.md](DEPLOYMENT.md)

### Analyze Results
Export data from Admin Panel, then:
```bash
node analyze-trades.js market-data-*.json
```

---

## Architecture TL;DR

```
You (Browser) → React App
                   ↓
                Firebase
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
  Cloud Functions        Firestore DB
   (market engine)        (all data)
   (every 1 sec)
```

- **Frontend**: React + TypeScript
- **Backend**: Firebase Cloud Functions + Firestore
- **Auth**: Anonymous (no email needed)
- **Real-time**: Firebase listeners push updates
- **Logging**: Every trade, every price, immutable

---

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/pages/App.tsx` | Main entry point, routing |
| `frontend/src/pages/Dashboard.tsx` | Trader UI |
| `frontend/src/pages/AdminDashboard.tsx` | Admin UI |
| `functions/src/index.ts` | Market physics engine |
| `firebase.json` | Firebase deployment config |
| `.firebaserc` | Firebase project ID |
| `firestore.rules` | Security rules |
| `README.md` | Overview (you are here!) |
| `ARCHITECTURE.md` | Deep dive into design |
| `DEPLOYMENT.md` | Production deployment |

---

Enjoy watching humans believe information faster than they understand it. 📊
