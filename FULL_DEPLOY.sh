#!/bin/bash

###############################################################################
# BEHAVIORAL FINANCE PLATFORM - FULL AUTOMATED DEPLOYMENT
# This script handles GitHub, Vercel, and Firebase deployment
###############################################################################

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  BEHAVIORAL FINANCE PLATFORM - AUTOMATED DEPLOYMENT              ║"
echo "║  Deploying to: GitHub → Vercel → Firebase                        ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

###############################################################################
# PHASE 1: GITHUB DEPLOYMENT
###############################################################################

echo -e "\n${YELLOW}PHASE 1: GITHUB DEPLOYMENT${NC}"
echo "─────────────────────────────────────────────────────────────────────"

# Check if git remote already exists
if git remote | grep -q origin; then
    echo -e "${GREEN}✓${NC} Git remote already configured"
    GITHUB_URL=$(git remote get-url origin)
    echo "  Remote: $GITHUB_URL"
else
    echo -e "${YELLOW}?${NC} Git remote not configured. We need your GitHub credentials."
    echo ""
    echo "You'll need:"
    echo "  1. GitHub username"
    echo "  2. Personal Access Token (PAT)"
    echo ""
    echo "To create a PAT:"
    echo "  → Go to: github.com/settings/tokens/new"
    echo "  → Scopes: repo (full control)"
    echo "  → Copy the token (you'll only see it once)"
    echo ""
    
    read -p "GitHub username: " GITHUB_USER
    read -sp "GitHub Personal Access Token: " GITHUB_TOKEN
    echo ""
    
    # Create repository via GitHub API
    echo -e "${BLUE}Creating GitHub repository...${NC}"
    
    REPO_RESPONSE=$(curl -s -X POST \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/user/repos \
      -d '{
        "name":"market-simulation",
        "description":"Real-time behavioral finance simulation platform with live market ticking and trader psychology modeling",
        "private":false,
        "auto_init":false
      }')
    
    # Check for errors
    if echo "$REPO_RESPONSE" | grep -q '"errors"'; then
        echo -e "${RED}✗ Failed to create repository${NC}"
        echo "Response: $REPO_RESPONSE"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Repository created${NC}"
    
    GITHUB_URL="https://github.com/$GITHUB_USER/market-simulation.git"
    
    # Add remote
    git remote add origin "$GITHUB_URL"
    echo -e "${GREEN}✓ Remote added${NC}"
fi

# Push code
echo -e "${BLUE}Pushing code to GitHub...${NC}"
git push -u origin main
echo -e "${GREEN}✓ Code pushed to GitHub${NC}"

GITHUB_REPO_URL="https://github.com/$(git remote get-url origin | sed 's/.*github.com\///' | sed 's/.git$//')"
echo "  Repository: $GITHUB_REPO_URL"

###############################################################################
# PHASE 2: VERCEL DEPLOYMENT
###############################################################################

echo -e "\n${YELLOW}PHASE 2: VERCEL DEPLOYMENT${NC}"
echo "─────────────────────────────────────────────────────────────────────"

echo -e "${YELLOW}?${NC} Vercel setup requires manual steps (automated API has restrictions)"
echo ""
echo "Steps to complete Vercel deployment:"
echo ""
echo "1. Go to: https://vercel.com/new"
echo "2. Click 'Import Git Repository'"
echo "3. Select your GitHub repo: market-simulation"
echo "4. Vercel auto-detects configuration (vercel.json)"
echo "5. Add Environment Variables:"
echo ""
echo "   From your Firebase project, add these variables:"
echo "   • VITE_FIREBASE_API_KEY"
echo "   • VITE_FIREBASE_AUTH_DOMAIN"
echo "   • VITE_FIREBASE_PROJECT_ID"
echo "   • VITE_FIREBASE_STORAGE_BUCKET"
echo "   • VITE_FIREBASE_MESSAGING_SENDER_ID"
echo "   • VITE_FIREBASE_APP_ID"
echo ""
echo "6. Click 'Deploy'"
echo ""
echo -e "${GREEN}After deployment, your frontend will be live at your Vercel URL!${NC}"
echo ""

read -p "Press ENTER once you've deployed to Vercel (or CTRL+C to skip): " -t 300 || true

###############################################################################
# PHASE 3: FIREBASE DEPLOYMENT
###############################################################################

echo -e "\n${YELLOW}PHASE 3: FIREBASE DEPLOYMENT${NC}"
echo "─────────────────────────────────────────────────────────────────────"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}!${NC} Firebase CLI not found. Installing..."
    npm install -g firebase-tools
    echo -e "${GREEN}✓ Firebase CLI installed${NC}"
else
    echo -e "${GREEN}✓ Firebase CLI installed${NC}"
fi

# Check if Firebase is logged in
if ! firebase auth:list &> /dev/null 2>&1; then
    echo -e "${BLUE}Logging into Firebase...${NC}"
    firebase login --no-localhost
    echo -e "${GREEN}✓ Logged in to Firebase${NC}"
fi

# Get Firebase project ID
echo ""
echo -e "${YELLOW}?${NC} What is your Firebase Project ID?"
echo "  (Find it at: https://firebase.google.com → Project settings)"
read -p "Firebase Project ID: " FIREBASE_PROJECT_ID

# Set project
firebase use "$FIREBASE_PROJECT_ID" --add default || firebase use default

# Update .firebaserc
echo -e "${BLUE}Updating Firebase configuration...${NC}"
cat > .firebaserc << EOF
{
  "projects": {
    "default": "$FIREBASE_PROJECT_ID"
  }
}
EOF
echo -e "${GREEN}✓ Firebase config updated${NC}"

# Deploy Firebase functions
echo -e "${BLUE}Deploying Firebase Cloud Functions...${NC}"
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
echo -e "${GREEN}✓ Firebase functions deployed${NC}"

# Deploy Firestore rules
echo -e "${BLUE}Deploying Firestore security rules...${NC}"
firebase deploy --only firestore:rules
echo -e "${GREEN}✓ Firestore rules deployed${NC}"

###############################################################################
# COMPLETION
###############################################################################

echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    🎉 DEPLOYMENT COMPLETE! 🎉                     ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
echo -e "${BLUE}Your platform is now live!${NC}"
echo ""
echo "📊 Frontend:"
echo "  → Check Vercel dashboard for your deployment URL"
echo ""
echo "⚙️  Backend:"
echo "  → Firebase functions deployed and ticking every second"
echo ""
echo "🗄️  Database:"
echo "  → Firestore ready at: https://console.firebase.google.com"
echo ""
echo "📈 Next Steps:"
echo "  1. Create a Firestore document in 'market_state' collection"
echo "  2. Go to your Vercel frontend URL"
echo "  3. Log in as admin"
echo "  4. Start a trading session"
echo "  5. Watch the market tick in real-time!"
echo ""
echo -e "${YELLOW}See DEPLOY_COMPLETE.md for detailed post-deployment setup.${NC}"
