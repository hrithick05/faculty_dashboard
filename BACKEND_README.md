# 🚀 Achievement System Backend

This backend provides a complete API for the achievement management system, automatically setting up the database and storage, then running with nodemon for development.

## 🎯 Features

- **Automatic Setup**: Creates storage bucket and database table on startup
- **PDF Upload Management**: Handles achievement PDF submissions
- **HOD Review System**: Approve/reject faculty submissions
- **Real-time Updates**: Nodemon automatically restarts on file changes
- **Complete API**: All CRUD operations for achievements

## 🚀 Quick Start

### 1. Add Service Role Key
Add your Supabase service role key to `.env`:
```env
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Start Everything at Once
```bash
npm run start:achievements
```

This will:
- ✅ Set up the achievement system automatically
- ✅ Create storage bucket for PDFs
- ✅ Create database table with constraints
- ✅ Start backend server with nodemon
- ✅ Watch for changes and auto-restart

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start:achievements` | **MAIN SCRIPT** - Sets up everything and starts backend |
| `npm run backend` | Start backend with nodemon (after setup) |
| `npm run backend:start` | Start backend without nodemon |
| `npm run dev:full` | Start both frontend and backend simultaneously |

## 🔧 Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/init-achievements` | POST | Initialize achievement system |
| `/api/faculty` | GET | Get all faculty members |
| `/api/achievements/submit` | POST | Submit new achievement |
| `/api/achievements/faculty/:id` | GET | Get submissions for specific faculty |
| `/api/achievements/all` | GET | Get all submissions (for HODs) |
| `/api/achievements/:id/review` | PUT | Review submission (approve/reject) |
| `/api/achievements/summary` | GET | Get achievement summary |

## 🎮 How It Works

1. **Startup**: `start-achievement-system.js` runs first
2. **Setup**: Automatically creates storage bucket and database table
3. **Backend**: Starts Express server with nodemon
4. **Watching**: Nodemon monitors files and auto-restarts on changes
5. **API Ready**: Full achievement system accessible via REST API

## 🔄 Auto-Restart

Nodemon automatically restarts the backend when you:
- Modify `server.js`
- Change components in `src/components/`
- Update pages in `src/pages/`
- Modify scripts in `scripts/`

## 🚨 Troubleshooting

### Missing Service Role Key
```
❌ Missing environment variables
You need to add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file
```
**Solution**: Get your service role key from Supabase Dashboard > Project Settings > API

### Table Creation Fails
If automatic table creation fails, the script will show you the SQL to run manually in Supabase SQL Editor.

### Port Already in Use
Change the port in `server.js`:
```javascript
const PORT = process.env.PORT || 5001; // Change from 5000 to 5001
```

## 🎉 Success Message

When everything works, you'll see:
```
🎯 ACHIEVEMENT SYSTEM SETUP COMPLETE!
=======================================
✅ Storage bucket: achievement-pdfs
✅ Database table: achievement_submissions
✅ Faculty table: accessible
✅ Achievement categories: 6 types ready
✅ Status tracking: pending → approved/rejected
✅ PDF upload: enabled
✅ HOD approval: required for count increase

🎉 Setup completed successfully!
🚀 Starting backend server...
```

## 🌐 Access Your Backend

- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Frontend**: http://localhost:5173 (Vite dev server)

Your achievement system is now fully automated and running! 🎯
