# Deployment Guide

## Prerequisites

1. **Firebase Project**
   - Create at [firebase.google.com](https://firebase.google.com)
   - Enable Firestore Database (production mode)
   - Enable Cloud Functions
   - Enable Firebase Hosting
   - Enable Authentication (Anonymous)

2. **Local Tools**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

3. **Clone/Setup Project**
   ```bash
   # Update project ID in .firebaserc
   firebase use --add
   ```

## Step 1: Configure Environment

Create `frontend/.env.local` with your Firebase credentials:

```bash
VITE_FIREBASE_API_KEY=<your_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project>
VITE_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender_id>
VITE_FIREBASE_APP_ID=<app_id>
VITE_FIREBASE_DATABASE_URL=https://<project>.firebaseio.com
```

## Step 2: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Step 3: Build and Deploy Frontend

```bash
cd frontend
npm install
npm run build
cd ..

firebase deploy --only hosting
```

## Step 4: Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
cd ..

firebase deploy --only functions
```

## Step 5: Initialize Market Seed Data

Run this once to set up initial market state (optional):

```bash
firebase functions:call initializeMarket
```

Or manually via Firebase Console:
1. Create a Firestore document at `artifacts/{YOUR_APP_ID}/public/data/market_state/main`
2. Set initial stock prices (TECH: $100, ENERGY: $80, FINANCE: $120)

## Verification

1. **Check Deployment**
   ```bash
   firebase deploy:list
   ```

2. **View Live Site**
   - Visit your Firebase Hosting URL from the console

3. **Monitor Functions**
   ```bash
   firebase functions:log
   ```

4. **Test Trading**
   - Open the app and create an account (anonymous auth)
   - If you want admin access, mark yourself as admin in Firestore

## Making Admin Account

In Firestore, update a user document:

```json
{
  "id": "your-uid",
  "role": "admin",
  "isController": false
}
```

Then refresh the app.

## Troubleshooting

### Functions Not Running?
- Check Cloud Functions quota and billing
- Ensure Firestore is in production mode (not read-locked)
- Check function logs: `firebase functions:log`

### Market Not Updating?
- Verify `marketEngine` function is deployed
- Check that a session exists with `active: true`
- Ensure controller user ID matches in market state

### Authentication Issues?
- Clear browser cache
- Verify Anonymous auth is enabled in Firebase Console
- Check browser console for specific errors

### Firestore Rules Too Strict?
- During development, you can temporarily use test rules:
  ```
  match /{document=**} {
    allow read, write: if true;
  }
  ```
- Switch back to secure rules before production

## Scaling Considerations

- **Firestore Read/Write Ops**: Each price tick writes ~3 operations
- **Expected Load**: 60 trades/min = 180 ops + market updates
- **Cost Estimate**: ~$5-15/month for modest usage (1000s of trades/day)

## Monitoring Production

1. **Set up Firebase Alerts**
   - Function error rates
   - Firestore quota usage

2. **Export Data Regularly**
   - Use admin panel to export trades & news
   - Store locally for analysis

3. **Archive Old Data**
   - The `archiveOldData` function runs daily
   - Price history older than 7 days is deleted
   - Trades are marked archived but retained

## Stopping Market Engine

To pause the market engine without stopping all functions:

1. Use Admin Panel → Pause Session
2. OR manually update market state `sessionStatus: paused`

The engine will skip ticks when session status ≠ 'active'.

## Backup & Recovery

### Backup Trades Data
```bash
firebase firestore:export gs://your-bucket/backup-$(date +%s)
```

### Restore
```bash
firebase firestore:import gs://your-bucket/backup-timestamp
```

---

For questions or issues, check the README.md or review Cloud Functions logs.
