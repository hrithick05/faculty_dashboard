# 🚀 Faculty Dashboard Deployment Guide

## 📋 Prerequisites
- Node.js 18+ installed
- PM2 installed globally: `npm install -g pm2`
- Supabase project configured
- Environment variables ready

---

## 🌐 FRONTEND DEPLOYMENT

### **Option 1: Vercel (Recommended - Free)**

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run deploy:frontend
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set build command: npm run build
# - Set output directory: dist
# - Set environment variables in Vercel dashboard
```

**Environment Variables in Vercel:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=https://your-backend-domain.com
```

### **Option 2: Netlify (Free)**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run deploy:frontend
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

### **Option 3: GitHub Pages**

```bash
# Add to package.json
"homepage": "https://yourusername.github.io/your-repo-name"

# Deploy
npm run deploy:frontend
npm run deploy:gh-pages
```

---

## 🔧 BACKEND DEPLOYMENT

### **Step 1: Prepare Environment**

```bash
# Create .env.production file
cp .env .env.production

# Edit .env.production with production values
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_SERVICE_KEY=your_production_service_key
NODE_ENV=production
PORT=5000
```

### **Step 2: Deploy with PM2**

```bash
# Start production server
npm run deploy:backend

# Check status
pm2 status

# View logs
npm run logs:prod

# Restart if needed
npm run restart:prod
```

### **Step 3: Alternative Deployment Options**

#### **A. Railway (Recommended - Easy)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### **B. Render (Free Tier)**
```bash
# Connect GitHub repo to Render
# Set build command: npm install && npm run deploy:backend
# Set start command: pm2 start ecosystem.config.js --env production
```

#### **C. Heroku**
```bash
# Install Heroku CLI
# Create Procfile with: web: pm2 start ecosystem.config.js --env production
# Deploy: git push heroku main
```

---

## 🌍 PRODUCTION ENVIRONMENT VARIABLES

### **Frontend (.env.production)**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=https://your-backend-domain.com
```

### **Backend (.env.production)**
```env
NODE_ENV=production
PORT=5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_KEY=your_service_role_key
```

---

## 🔒 SECURITY CHECKLIST

- [ ] Environment variables set in production
- [ ] Supabase RLS policies configured
- [ ] CORS settings updated for production domains
- [ ] Rate limiting implemented
- [ ] HTTPS enabled
- [ ] Error logging configured

---

## 📊 MONITORING & MAINTENANCE

### **PM2 Commands**
```bash
# View all processes
pm2 list

# Monitor resources
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart faculty-dashboard-backend

# Stop application
pm2 stop faculty-dashboard-backend
```

### **Health Checks**
```bash
# Backend health
curl https://your-backend-domain.com/api/health

# Frontend status
# Check Vercel/Netlify dashboard
```

---

## 🚨 TROUBLESHOOTING

### **Common Issues:**

1. **Environment Variables Not Set**
   - Check production dashboard
   - Verify variable names match code

2. **CORS Errors**
   - Update CORS settings in backend
   - Add production domain to allowed origins

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network policies

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies installed

---

## 📞 SUPPORT

- **Frontend Issues**: Check Vercel/Netlify logs
- **Backend Issues**: Check PM2 logs with `npm run logs:prod`
- **Database Issues**: Check Supabase dashboard
- **Deployment Issues**: Check build logs in deployment platform

---

## 🎯 QUICK DEPLOYMENT COMMANDS

```bash
# Frontend
npm run deploy:frontend
vercel --prod

# Backend
npm run deploy:backend
pm2 status
```

