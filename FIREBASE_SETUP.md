# Firebase Setup Instructions

Your entire platform is ready on GitHub. Now set up Firebase to make it live.

## STEP 1: Create Firebase Project

1. Go to **https://firebase.google.com**
2. Click **"Go to console"** or **"Create a project"**
3. Project name: `market-simulation`
4. Click **Continue**
5. Click **Create project** (accept all defaults)
6. Wait for it to finish (1-2 minutes)

## STEP 2: Get Firebase Credentials

1. Click the **⚙️ Settings** icon (top left)
2. Select **Project settings**
3. Go to **General** tab
4. Copy these 6 values (scroll down to "Your apps"):
   - **VITE_FIREBASE_API_KEY**
   - **VITE_FIREBASE_AUTH_DOMAIN**
   - **VITE_FIREBASE_PROJECT_ID**
   - **VITE_FIREBASE_STORAGE_BUCKET**
   - **VITE_FIREBASE_MESSAGING_SENDER_ID**
   - **VITE_FIREBASE_APP_ID**

(If not visible under "Your apps", click **Add app** → Choose **Web** → Copy the config)

## STEP 3: Enable Firestore Database

1. Left sidebar → **Build** → **Firestore Database**
2. Click **Create Database**
3. Select a region near you
4. Choose **Start in Test Mode** (for development)
5. Click **Create**
6. Wait for it to initialize

## STEP 4: Enable Authentication

1. Left sidebar → **Build** → **Authentication**
2. Click **Get Started**
3. Under "Sign-in method", click **Email/Password**
4. Enable it (toggle ON)
5. Click **Save**

## STEP 5: Deploy to Vercel

1. Go to **https://vercel.com/new**
2. Click **Import Git Repository**
3. Select: `harshatfocus-dotcom/market-simulation`
4. Click **Import**
5. Under **Environment Variables**, add all 6 Firebase values:
   - Name: `VITE_FIREBASE_API_KEY` → Paste value
   - Name: `VITE_FIREBASE_AUTH_DOMAIN` → Paste value
   - (Repeat for all 6)
6. Click **Deploy**
7. Wait ~60 seconds for deployment
8. Your frontend URL appears! (e.g., market-simulation.vercel.app)

## STEP 6: Deploy Backend Functions

In your terminal:
```bash
cd "/Users/harshbaid/Downloads/New Project"

# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy functions and rules
firebase deploy --only functions,firestore:rules

# Deployment will take 2-5 minutes
```

## STEP 7: Verify Everything Works

1. Go to your Vercel URL
2. Log in as admin (use any email in test mode)
3. Click **Claim Control**
4. Click **Start Session**
5. Watch the price chart tick! 📈

---

## FIREBASE PROJECT ID REFERENCE

You'll need your **Project ID** for deployments. Find it:
1. Firebase Console → Project Settings (⚙️)
2. Under "General" tab
3. **Project ID** is listed there

---

## Troubleshooting

**Functions not ticking?**
- Check Firebase Console → Functions
- Look for errors in function logs
- Verify Firestore rules allow access

**Vercel showing errors?**
- Check Vercel → Deployments → Logs
- Verify all 6 environment variables are set
- Redeploy if variables changed

**Firestore access denied?**
- Make sure rules are deployed: `firebase deploy --only firestore:rules`
- Rules are in `firestore.rules` file

---

Done! Your platform is now **LIVE** and ready to use! 🎉
