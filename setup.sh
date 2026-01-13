#!/bin/bash

# Market Simulation Platform - Setup Script

set -e

echo "🚀 Market Simulation Platform - Setup"
echo "=================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
npm run install-dependencies

echo ""
echo "✅ Installation complete!"
echo ""

# Check for .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Frontend environment file not found."
    echo "📝 Copy frontend/.env.example to frontend/.env.local"
    echo "📝 Then update with your Firebase credentials"
    echo ""
    cp frontend/.env.example frontend/.env.local
    echo "Created frontend/.env.local - please update with your Firebase config"
else
    echo "✅ Frontend environment file exists"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Update frontend/.env.local with your Firebase credentials"
echo "2. Run: npm run dev (to start frontend locally)"
echo "3. Run: firebase deploy (to deploy to Firebase)"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
