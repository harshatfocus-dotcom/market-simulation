# Deployment Guide

## GitHub Repository

This project is hosted on GitHub:
- **Repository**: https://github.com/your-username/market-simulation
- **Main Branch**: `main`

Clone with:
```bash
git clone https://github.com/your-username/market-simulation.git
```

## Vercel Deployment

### Frontend Deployment

The frontend is automatically deployed to Vercel:
- **Live URL**: https://market-simulation.vercel.app
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`

### Setting Up Vercel

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Vercel auto-detects the configuration

2. **Add Environment Variables**
   In Vercel Project Settings → Environment Variables:
   ```
   VITE_FIREBASE_API_KEY=your_value
   VITE_FIREBASE_AUTH_DOMAIN=your_value
   VITE_FIREBASE_PROJECT_ID=your_value
   VITE_FIREBASE_STORAGE_BUCKET=your_value
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
   VITE_FIREBASE_APP_ID=your_value
   VITE_FIREBASE_DATABASE_URL=your_value
   ```

3. **Deploy**
   - Push to main branch
   - Vercel automatically deploys
   - View logs and preview at vercel.com

### Vercel CLI Deployment (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Follow prompts to link project and set environment variables
```

## Firebase Deployment

Backend Cloud Functions deploy to Firebase:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy functions
firebase deploy --only functions
```

## GitHub Actions (Optional CI/CD)

Create `.github/workflows/deploy.yml` to auto-deploy on push:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm run install-dependencies
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Deployment Status

| Service | Status | Link |
|---------|--------|------|
| GitHub | ✅ Live | https://github.com/your-username/market-simulation |
| Vercel (Frontend) | ✅ Live | https://market-simulation.vercel.app |
| Firebase (Backend) | 🚀 Ready | Configure in firebase.json |

## First-Time Setup

1. Clone repo
2. Create Firebase project
3. Set up Vercel project
4. Add environment variables to Vercel
5. Push to main branch → Auto-deploys!

## Monitoring

- **Vercel Logs**: https://vercel.com/dashboard
- **Firebase Logs**: `firebase functions:log`
- **GitHub Status**: https://github.com/your-username/market-simulation

---

See QUICKSTART.md for local development setup.
