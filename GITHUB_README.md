# Market Simulation Platform 📊

[![Vercel Deployment](https://img.shields.io/badge/deployed%20on-vercel-000000?style=for-the-badge&logo=vercel)](https://market-simulation.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/github-market--simulation-181717?style=for-the-badge&logo=github)](https://github.com/harshbaid/market-simulation)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-18.2-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/firebase-10.7-ffca28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

A real-time, multi-user behavioral finance simulation where traders compete in a market driven by information, delay, perception, and human bias.

> **"This system is not about making money. It is about watching humans believe information faster than they understand it."**

---

## 🎯 Core Purpose

Build a shared market universe where:

- ✅ All users see the same prices, same news, same clock
- ✅ Only one controller drives the market physics
- ✅ Participants trade with simulated money
- ✅ Every action is logged for post-experiment analysis
- ✅ Admins can inject information shocks and observe reactions

The system feels **live**, **fragile**, **slightly delayed**, and **psychologically realistic**.

---

## 🚀 Quick Start

### Deploy to Vercel (Recommended)

1. **Fork this repository**
2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Select "New Project"
   - Import your GitHub repository
   - Vercel auto-detects configuration

3. **Add Environment Variables**
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   VITE_FIREBASE_DATABASE_URL
   ```

4. **Deploy**
   - Push to main → Auto-deploys to Vercel
   - View live at `https://your-project.vercel.app`

### Run Locally

```bash
# Install dependencies
npm run install-dependencies

# Copy environment template
cp frontend/.env.example frontend/.env.local
# Add your Firebase credentials

# Start dev server
npm run dev

# Open http://localhost:3000
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [INDEX.md](INDEX.md) | Navigation guide |
| [QUICKSTART.md](QUICKSTART.md) | 5-minute local setup |
| [DEPLOY_GITHUB_VERCEL.md](DEPLOY_GITHUB_VERCEL.md) | Vercel + GitHub deployment |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Firebase + production guide |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design deep dive |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Code navigation |

---

## ✨ Features

### 🎯 For Traders
- **Live Prices** - Real-time market data with 1-second updates
- **News Feed** - Live news with decay and visual prominence
- **Trading Interface** - Simple buy/sell orders
- **Portfolio Tracking** - Real-time P&L
- **Price Charts** - 60-tick historical view

### 🔧 For Admins
- **Market Control** - Start/pause/reset sessions
- **News Injection** - Inject realistic events with sentiment, optics, target
- **Session Management** - Controller authority claim
- **Data Export** - Complete JSON export for analysis

### 🧠 Market Physics
- **Base Drift** - 0.1% + Gaussian random walk (σ=1.5%)
- **News Impact** - sentiment × optics × decay
- **Behavioral Modifiers**:
  - Losses amplified 30% (loss aversion)
  - Gains dampened 30% (risk aversion)
  - Mean reversion after attention fades
- **Reaction Lag** - 60% immediate, 40% delayed
- **Hard Clamps** - ±5% max per tick

### 📊 Data & Logging
- **Immutable Trades** - Write-once, never modified
- **Complete Audit Trail** - Every decision captured
- **News Decay Tracking** - Exponential decay (half-life 2 min)
- **Price History** - 60-tick rolling window

---

## 🏗️ Architecture

```
Frontend (React 18 + TypeScript)
    ↓ Real-time sync
Firebase Firestore
    ↓ Scheduled
Cloud Functions (Node.js)
    ↓ Market Physics Engine
Prices Updated Every 1 Second
    ↓ Broadcast
All Clients See Live Update
```

**Technology Stack:**
- Frontend: React 18, TypeScript, Tailwind CSS, Recharts
- Backend: Firebase Cloud Functions, Node.js
- Database: Firestore + Realtime Database
- Auth: Firebase Anonymous + Role-based
- Deployment: Vercel (frontend) + Firebase (backend)

---

## 📊 Project Stats

- **43 Files**: Frontend (21) + Backend (2) + Config (8) + Docs (9) + Tools (3)
- **~2,000 Lines of Code**
- **10 Components**: Fully reusable
- **4 Cloud Functions**: Market engine, archiving, cleanup
- **6 Firestore Collections**: Complete schema
- **$5-15/month** typical cost
- **Supports 1000s** concurrent traders

---

## 🔒 Security

- ✅ Firestore security rules (role-based access)
- ✅ Anonymous authentication
- ✅ Controller lock mechanism (one person at a time)
- ✅ Immutable trade logs
- ✅ No direct client price calculation

---

## 🎓 Use Cases

- **Academic Research** - Study behavioral finance
- **Trading Psychology** - Understand human decision-making
- **Market Microstructure** - Observe delayed reactions
- **Herd Behavior** - Detect clustering effects
- **Information Flow** - Measure reaction lag
- **Trader Training** - Safe practice environment

---

## 📈 How It Works

### User Flow
1. Opens app → Anonymous auth
2. Sees live prices (synced from Firestore)
3. Reads news feed (with decay indicators)
4. Places trade (buy/sell)
5. Trade logged immutably
6. Portfolio updates in real-time

### Market Tick (Every 1 Second)
```
1. Get active session + news with decay > 0
2. For each stock:
   a) Base drift = 0.1% + Gaussian(σ=1.5%)
   b) News impact = Σ(sentiment × optics × decay)
   c) Behavioral mod: gains *0.7, losses *1.3
   d) Lag dampened = impact * 0.6
   e) Price delta = clamp(drift + lag, ±5%)
   f) New price = old price × (1 + delta)
3. Update all prices atomically
4. Decay all news: decay *= 0.99
5. Broadcast to all clients
```

---

## 🚀 Deployment

### Vercel (Frontend)
```bash
# Auto-deployed on push to main
# View at https://market-simulation.vercel.app
```

### Firebase (Backend)
```bash
# Deploy functions
firebase deploy --only functions

# View logs
firebase functions:log
```

### GitHub Actions
Auto-deploy on push via `.github/workflows/deploy.yml`

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- Firebase CLI (for backend)
- Vercel account (for frontend)
- GitHub account

### Local Setup
```bash
# Clone repo
git clone https://github.com/your-username/market-simulation.git
cd market-simulation

# Install dependencies
npm run install-dependencies

# Configure
cp frontend/.env.example frontend/.env.local
# Add Firebase credentials

# Run
npm run dev

# Visit http://localhost:3000
```

### Production Deployment
See [DEPLOY_GITHUB_VERCEL.md](DEPLOY_GITHUB_VERCEL.md) for full instructions.

---

## 🛠️ Development

### Build
```bash
npm run build          # Build all
cd frontend && npm run build  # Frontend only
cd functions && npm run build # Backend only
```

### Test Locally
```bash
npm run dev            # Frontend dev server
cd functions && npm run serve  # Firebase emulator
```

### Deploy
```bash
firebase deploy        # Deploy functions
vercel                 # Deploy frontend
```

---

## 📊 Data Analysis

Export market data from admin panel, then analyze:

```bash
node analyze-trades.js market-data-*.json
```

Generates:
- Trade statistics
- Behavioral metrics (sentiment bias, overreaction, herding)
- News impact analysis
- Trader behavior patterns
- Win rates and gains

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 💡 Philosophy

This system prioritizes **behavioral observation** over profit maximization:

- No hidden recovery - market freezes when controller disconnects
- No auto-correction - human mistakes are captured
- No over-optimization - visuals serve causality, not gamification
- Complete logging - every trade, every price, every decision
- Delayed reactions - cognitive lag is intentional

---

## 📞 Support

- **Getting Started**: [QUICKSTART.md](QUICKSTART.md)
- **Deployment Issues**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **System Design**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Code Navigation**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **GitHub Issues**: [Create an issue](https://github.com/your-username/market-simulation/issues)

---

## 🎉 Get Started

1. **Fork** this repository
2. **Connect** to Vercel
3. **Add** Firebase credentials
4. **Deploy** → Live in minutes!

Watch humans believe information faster than they understand it. 📊

---

**Built with React, Firebase, and a healthy respect for human irrationality.**
