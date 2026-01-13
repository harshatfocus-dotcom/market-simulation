#!/bin/bash
set -e

PROJECT_DIR="/Users/harshbaid/Downloads/New Project"
cd "$PROJECT_DIR"

# Token is already configured - use gh CLI or git credentials
GITHUB_USER="harshatfocus-dotcom"

echo "🚀 Starting automated deployment..."
echo "================================================"

# Step 1: Repository already exists on GitHub
echo ""
echo "Step 1: Repository already created on GitHub"
echo "✓ Ready for deployment"

# Step 2: Configure git remote (credentials via git config)
echo ""
echo "Step 2: Verifying git remote..."
if git remote | grep -q origin; then
  echo "✓ Remote already configured"
else
  git remote add origin "https://github.com/${GITHUB_USER}/market-simulation.git"
  echo "✓ Remote configured"
fi

# Step 3: Push to GitHub
echo ""
echo "Step 3: Pushing code to GitHub..."
git push -u origin main
echo "✓ Code pushed successfully!"

# Step 4: Show results
echo ""
echo "================================================"
echo "✅ GITHUB DEPLOYMENT COMPLETE"
echo "================================================"
echo ""
echo "Your repository: https://github.com/$GITHUB_USER/market-simulation"
echo ""
echo "Next steps:"
echo "1. Go to: https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Add these Firebase environment variables:"
echo "   - VITE_FIREBASE_API_KEY"
echo "   - VITE_FIREBASE_AUTH_DOMAIN"
echo "   - VITE_FIREBASE_PROJECT_ID"
echo "   - VITE_FIREBASE_STORAGE_BUCKET"
echo "   - VITE_FIREBASE_MESSAGING_SENDER_ID"
echo "   - VITE_FIREBASE_APP_ID"
echo "4. Click Deploy"
echo ""
echo "Then deploy Firebase functions:"
echo "   firebase deploy --only functions"
echo ""
