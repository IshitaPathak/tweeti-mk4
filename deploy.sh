#!/bin/bash

echo "🚀 Deploying Tweeti Cron Server to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration before deploying"
    echo "   Required: TARGET_SERVER_URL"
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "📊 Your cron server is now running on Vercel"
echo "⏰ Cron job will run every 12 hours automatically"
echo "🔧 Don't forget to set TARGET_SERVER_URL in Vercel dashboard" 