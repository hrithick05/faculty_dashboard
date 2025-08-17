# Deploy to Render - Complete Guide

## Overview
This guide will help you deploy your full-stack application (React + Node.js + Supabase) to Render.

## Prerequisites
- GitHub repository with your code
- Render account
- Supabase project with API keys

## Step 1: Deploy Backend API

### 1.1 Create Web Service
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

### 1.2 Configure Backend Service
- **Name**: `t-dashboard-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm run backend:start`
- **Root Directory**: Leave empty

### 1.3 Set Environment Variables
```
NODE_ENV=production
PORT=10000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 1.4 Deploy
Click "Create Web Service" and wait for deployment to complete.

## Step 2: Deploy Frontend

### 2.1 Create Static Site
1. Click "New +" → "Static Site"
2. Connect your GitHub repository

### 2.2 Configure Frontend Service
- **Name**: `t-dashboard-frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Root Directory**: Leave empty

### 2.3 Set Environment Variables
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://t-dashboard-backend.onrender.com
```

### 2.4 Deploy
Click "Create Static Site" and wait for deployment to complete.

## Step 3: Update CORS Configuration

After deploying, update your backend CORS settings in `server/server.js`:

```javascript
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? [
        'https://t-dashboard-frontend.onrender.com',
        // Add other domains as needed
      ]
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true
}));
```

## Step 4: Test Your Deployment

1. **Backend Health Check**: Visit `https://t-dashboard-backend.onrender.com/api/health`
2. **Frontend**: Visit `https://t-dashboard-frontend.onrender.com`

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=10000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://t-dashboard-backend.onrender.com
```

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check build logs for missing dependencies
2. **CORS Errors**: Ensure frontend URL is in backend CORS configuration
3. **Environment Variables**: Verify all required variables are set
4. **Port Issues**: Render automatically sets PORT environment variable

### Useful Commands:
- Check backend logs: Render dashboard → Backend service → Logs
- Check frontend build logs: Render dashboard → Frontend service → Builds

## Alternative: Deploy Only Backend on Render

If you prefer to deploy only the backend on Render and use Vercel/Netlify for the frontend:

1. Deploy backend following Step 1
2. Deploy frontend to Vercel/Netlify
3. Update `VITE_API_URL` to point to your Render backend
4. Add your frontend domain to backend CORS configuration

## Cost Considerations

- **Free Tier**: Both services available on free tier
- **Limitations**: Free tier has cold starts and limited bandwidth
- **Upgrade**: Consider paid plans for production use

## Security Notes

- Never commit `.env` files to your repository
- Use Render's environment variable system
- Keep Supabase keys secure
- Enable HTTPS (automatic on Render)
