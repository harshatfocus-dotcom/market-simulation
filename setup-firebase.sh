#!/bin/bash
set -e

PROJECT_DIR="/Users/harshbaid/Downloads/New Project"
cd "$PROJECT_DIR"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        FIREBASE DEPLOYMENT - AUTOMATED SETUP                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Check if logged in
echo "Checking Firebase login status..."
if ! firebase auth:list &> /dev/null 2>&1; then
    echo "Logging into Firebase..."
    firebase login --no-localhost
fi

echo ""
echo "Deploying Firebase Cloud Functions..."
echo "(This may take 2-5 minutes)"
echo ""

cd functions
npm install --quiet
npm run build --quiet
cd ..

echo "Deploying functions to Firebase..."
firebase deploy --only functions

echo ""
echo "Deploying Firestore security rules..."
firebase deploy --only firestore:rules

echo ""
echo "================================================"
echo "✓ FIREBASE DEPLOYMENT COMPLETE"
echo "================================================"
echo ""
echo "Your Firebase project is now live!"
echo ""
echo "Next steps:"
echo "1. Initialize market data in Firestore"
echo "2. Create admin user"
echo "3. Test the platform"
echo ""
echo "Firebase Console: https://firebase.google.com"
echo ""
