# 🚀 Complete Deployment Guide - Market Simulation Platform

## Overview

This guide covers deploying the Market Simulation Platform to:
- ✅ **GitHub** (code repository)
- ✅ **Vercel** (frontend hosting)
- ✅ **Firebase** (backend + database)

**Total time to production: ~30 minutes**

---

## Phase 1: GitHub Setup (5 minutes)

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **+ New Repository**
3. **Repository name**: `market-simulation`
4. **Description**: "Real-time behavioral finance simulation platform"
5. **Public/Private**: Your choice
6. Click **Create repository**

### Step 2: Push Code to GitHub

```bash
cd "/Users/harshbaid/Downloads/New Project"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/market-simulation.git

# Rename branch if needed
git branch -M main

# Push code
git push -u origin main
```

### Step 3: Verify

Visit `https://github.com/YOUR_USERNAME/market-simulation`

You should see:
- ✅ All 45 files committed
- ✅ README showing properly
- ✅ `.github/workflows/deploy.yml` in place

---

## Phase 2: Firebase Setup (10 minutes)

### Step 1: Create Firebase Project

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click **Get started**
3. **Project name**: `market-simulation`
4. Accept terms → **Create project**

### Step 2: Get Firebase Credentials

1. In Firebase Console:
   - Go to **Settings** → **Project Settings**
   - Scroll to **Your apps**
   - Click **Create app** (web icon)
   - Register as `market-simulation-web`
   - Copy the configuration object

2. Your config will look like:
```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "market-simulation-xxx.firebaseapp.com",
  projectId: "market-simulation-xxx",
  storageBucket: "market-simulation-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
  databaseURL: "https://market-simulation-xxx.firebaseio.com"
}
```

### Step 3: Enable Required Services

In Firebase Console:

1. **Firestore Database**
   - Click **Firestore Database** in sidebar
   - Click **Create Database**
   - Choose **Production mode**
   - Choose region (us-central1 recommended)
   - Click **Create**

2. **Cloud Functions**
   - Click **Functions** in sidebar
   - Note the region (us-central1)

3. **Authentication**
   - Click **Authentication** in sidebar
   - Click **Get started**
   - Enable **Anonymous** sign-in
   - Click **Save**

### Step 4: Deploy Firestore Rules

```bash
cd "/Users/harshbaid/Downloads/New Project"

# Install Firebase CLI if needed
npm install -g firebase-tools

# Login
firebase login

# Configure
firebase use --add
# Select your Firebase project

# Deploy rules
firebase deploy --only firestore:rules
```

### Step 5: Deploy Cloud Functions

```bash
# Build functions
cd functions
npm install
npm run build
cd ..

# Deploy
firebase deploy --only functions
```

Watch for success message like:
```
✔  Deploy complete!
Functions deployed
```

---

## Phase 3: Vercel Setup (10 minutes)

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign up**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub account

### Step 2: Create Project

1. Click **New Project**
2. Select your `market-simulation` repository
3. Click **Import**

### Step 3: Configure

**Root Directory**: (leave empty - Vercel auto-detects)

**Build & Output Settings** - Should auto-populate:
- **Framework**: Vite
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`

**Environment Variables** - Click **Add**

Paste your Firebase credentials:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=your_database_url
```

### Step 4: Deploy

Click **Deploy**

Wait for build to complete (~3-5 minutes)

You'll see:
```
✔ Production
  Domains: https://market-simulation-[random].vercel.app
```

### Step 5: Set Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **Add**
3. Enter your domain
4. Follow DNS instructions

---

## Phase 4: GitHub Actions Setup (5 minutes)

### Step 1: Get Vercel Tokens

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Name: `GitHub_Deploy`
4. Copy the token

### Step 2: Add GitHub Secrets

1. Go to your GitHub repo
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

| Name | Value |
|------|-------|
| `VERCEL_TOKEN` | (paste from Step 1) |
| `VERCEL_ORG_ID` | Your Vercel team ID (Settings → General) |
| `VERCEL_PROJECT_ID` | From Vercel project settings |

### Step 3: Verify CI/CD

Push a commit:
```bash
git push origin main
```

Watch GitHub Actions:
1. Go to your repo → **Actions** tab
2. You should see workflow running
3. After ~5 min, it completes and auto-deploys to Vercel

---

## Phase 5: Initialize Market (5 minutes)

### Step 1: Create First User

1. Visit your Vercel URL: `https://market-simulation-xxx.vercel.app`
2. App auto-signs you in anonymously
3. Get your User ID from browser console:
   ```javascript
   firebase.auth().currentUser.uid
   ```

### Step 2: Create Admin User

In Firebase Console → Firestore:

1. Create collection `users` (if not exists)
2. Create document with ID = your UID
3. Add fields:
   ```json
   {
     "id": "your-uid",
     "cash": 100000,
     "portfolio": {},
     "totalValue": 100000,
     "role": "admin",
     "isController": false,
     "createdAt": 1704067200000
   }
   ```

### Step 3: Create Market State

1. Create document at path: `artifacts/your-uid/public/data/market_state/main`
2. Add data:
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

### Step 4: Test

1. Refresh your app
2. You should see Admin Panel
3. Click **Claim Market Control**
4. Click **Start Session**
5. Watch prices update live! ✅

---

## Phase 6: Verification Checklist

### GitHub
- [ ] Repository created
- [ ] Code pushed (`git push -u origin main`)
- [ ] Visible at `github.com/YOUR_USERNAME/market-simulation`
- [ ] All 45 files present
- [ ] README displays properly

### Firebase
- [ ] Project created
- [ ] Firestore enabled (production mode)
- [ ] Cloud Functions deployed
- [ ] Authentication enabled
- [ ] Security rules deployed
- [ ] Test collections created

### Vercel
- [ ] Project created from GitHub repo
- [ ] Environment variables added (7 Firebase vars)
- [ ] Build successful
- [ ] Live at custom URL
- [ ] Can access app without errors

### Application
- [ ] App loads at Vercel URL
- [ ] Anonymous auth works
- [ ] Admin panel appears after setup
- [ ] Market engine ticking (prices update)
- [ ] Can place trades
- [ ] Portfolio updates

---

## Monitoring & Maintenance

### View Logs

```bash
# Firebase Functions logs
firebase functions:log --follow

# Or in Firebase Console
# → Functions → Logs tab
```

### Check Firestore Usage

Firebase Console → Firestore Database → Usage tab

### Monitor Vercel Deployments

Vercel Dashboard → Deployments tab

### GitHub Actions Status

GitHub Repo → Actions tab

---

## Troubleshooting

### "App won't load at Vercel URL"
- Check environment variables in Vercel settings
- Verify all 7 Firebase env vars are present
- Check Vercel build logs for errors

### "Market prices not updating"
- Verify Cloud Functions deployed: `firebase deploy --only functions`
- Check function logs: `firebase functions:log`
- Ensure market state document exists in Firestore
- Verify `controllerId` matches admin user ID

### "Can't claim controller"
- Verify your user document has `role: "admin"`
- Check Firestore security rules deployed
- Look at browser console for specific error

### "Trades not saving"
- Check Firestore quota not exceeded
- Verify user has sufficient cash in portfolio
- Check browser console for validation errors
- Ensure market session is "active"

---

## Production Checklist

Before going live:

- [ ] Domain configured (optional)
- [ ] Environment variables secure (not in repo)
- [ ] Firebase rules deployed and tested
- [ ] Cloud Functions tested and monitored
- [ ] GitHub CI/CD working (auto-deploy on push)
- [ ] Admin account created and verified
- [ ] Initial market state created
- [ ] First market session tested
- [ ] Trading verified end-to-end
- [ ] Data export tested

---

## Next Steps

### For Local Development
```bash
# Make changes locally
npm run dev

# Test at localhost:3000
# Push to GitHub
git push origin main

# Automatically deploys to Vercel!
```

### For Data Analysis
```bash
# Export data from Admin Panel
# Then analyze
node analyze-trades.js market-data-*.json
```

### For Extensions
- Add more stocks: Update initial prices
- Add AI bot: Create trading Cloud Function
- Add leverage: Modify TradeForm + rules
- Real news: Integrate news API

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **React Docs**: https://react.dev
- **GitHub Actions**: https://docs.github.com/actions

---

## 🎉 You're Live!

Your market is now:
- 📊 Live on Vercel
- 💾 Backed by Firebase
- 🔄 Auto-deploying from GitHub
- 🧠 Running behavioral simulation in real-time

Visit: `https://market-simulation-xxx.vercel.app`

> Watch humans believe information faster than they understand it. 📊

---

**Questions?** Check [DEPLOY_GITHUB_VERCEL.md](DEPLOY_GITHUB_VERCEL.md) or your platform docs.
