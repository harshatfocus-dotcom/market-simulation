#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          VERCEL DEPLOYMENT - SEMI-AUTOMATED SETUP             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "Logging into Vercel..."
vercel login

echo ""
echo "Creating Vercel project..."
cd "/Users/harshbaid/Downloads/New Project"

# Link to existing project or create new one
vercel link --cwd=/Users/harshbaid/Downloads/New\ Project

echo ""
echo "================================================"
echo "✓ Vercel project linked"
echo ""
echo "You need to add these environment variables in Vercel:"
echo ""
echo "Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
echo ""
echo "Add these variables (get values from Firebase Console):"
echo "  • VITE_FIREBASE_API_KEY"
echo "  • VITE_FIREBASE_AUTH_DOMAIN"  
echo "  • VITE_FIREBASE_PROJECT_ID"
echo "  • VITE_FIREBASE_STORAGE_BUCKET"
echo "  • VITE_FIREBASE_MESSAGING_SENDER_ID"
echo "  • VITE_FIREBASE_APP_ID"
echo ""
echo "After adding variables, deploy with:"
echo "  vercel --prod"
echo ""
