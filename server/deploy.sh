#!/bin/bash

echo "🚀 Faculty Dashboard Deployment Script"
echo "====================================="

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Installing..."
    npm install -g pm2
else
    echo "✅ PM2 is already installed"
fi

# Build frontend
echo "🌐 Building frontend..."
npm run deploy:frontend

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Deploy backend
echo "🔧 Deploying backend..."
npm run deploy:backend

if [ $? -eq 0 ]; then
    echo "✅ Backend deployed successfully"
else
    echo "❌ Backend deployment failed"
    exit 1
fi

# Show status
echo "📊 Deployment Status:"
pm2 status

echo ""
echo "🎉 Deployment completed!"
echo "📱 Frontend: Build ready in 'dist' folder"
echo "🔧 Backend: Running with PM2"
echo ""
echo "📋 Next steps:"
echo "1. Deploy frontend to Vercel/Netlify"
echo "2. Set environment variables in production"
echo "3. Update CORS origins in server.js"
echo "4. Test production endpoints"

