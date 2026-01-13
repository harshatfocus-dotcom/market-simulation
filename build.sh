#!/bin/bash

# Vercel build script
echo "🔨 Building Market Simulation Frontend..."

cd frontend

# Install dependencies
npm install

# Build with Vite
npm run build

echo "✅ Build complete!"
