#!/bin/bash

# Cloudflare Pages Deployment Script
# This script builds and deploys the frontend to Cloudflare Pages

echo "🚀 Cloudflare Pages Deployment Script"
echo "======================================"
echo ""

# Check if wrangler is installed
echo "1️⃣ Checking Wrangler CLI..."
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler CLI not found. Installing..."
    npm install -g wrangler
    echo "✅ Wrangler installed"
else
    echo "✅ Wrangler CLI found"
fi
echo ""

# Navigate to client directory
echo "2️⃣ Navigating to client directory..."
cd "$(dirname "$0")/client" || exit 1
echo "✅ In client directory"
echo ""

# Install dependencies
echo "3️⃣ Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Build the project
echo "4️⃣ Building Next.js project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully"
echo ""

# Check if out directory exists
if [ ! -d "out" ]; then
    echo "❌ Error: 'out' directory not found!"
    echo "Make sure next.config.js has: output: 'export'"
    exit 1
fi

echo "✅ Output directory found"
echo ""

# Deploy to Cloudflare Pages
echo "5️⃣ Deploying to Cloudflare Pages..."
echo ""

read -p "Enter your Cloudflare Pages project name (default: saha-platform): " projectName
projectName=${projectName:-saha-platform}

echo ""
echo "Deploying to project: $projectName"
echo ""

wrangler pages deploy out --project-name="$projectName"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Troubleshooting:"
    echo "1. Make sure you're logged in: wrangler login"
    echo "2. Check if the project exists in Cloudflare Dashboard"
    echo "3. Try creating the project first via Dashboard"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Visit Cloudflare Dashboard to see your deployment"
echo "2. Configure environment variables if needed"
echo "3. Set up custom domain (optional)"
echo ""
echo "Your site should be live at:"
echo "https://$projectName.pages.dev"
echo ""
