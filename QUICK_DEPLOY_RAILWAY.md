# 🚀 Quick Start: Deploy on Railway (5 Minutes)

## Prerequisites
- GitHub account (to push your code)
- Resend API key (for emails)
- That's it!

## Step 1: Push Code to GitHub ✅

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Ready for deployment"

# Add remote and push (replace YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Step 2: Create Railway Project

1. Go to **[railway.app](https://railway.app)**
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub"**
4. Authorize Railway with GitHub
5. Select your repository
6. Click **"Deploy"**

---

## Step 3: Add Services

### 3A. Add MySQL Database
1. Click **"Add Service"** in Railway
2. Select **"MySQL"**
3. Railway auto-creates database with credentials
4. **Copy these credentials** - you'll need them

### 3B. Configure Backend Service
1. In Railway, go to **Variable Panel**
2. Add environment variables:

```bash
# Copy and paste these:
PORT=5000
NODE_ENV=production
DB_HOST=          # Get from MySQL service
DB_USER=          # Get from MySQL service  
DB_PASSWORD=      # Get from MySQL service
DB_NAME=          # Get from MySQL service
RESEND_API_KEY=   # Your Resend API key
FRONTEND_URL=https://yourdomain.com  # Or Vercel URL later
```

**How to find MySQL credentials:**
- Click the MySQL service in Railway
- Click "Connect" tab
- Copy host, user, password, database name into env vars

### 3C: Configure Node.js Service
1. Select **Node.js** in Railway
2. Root Directory: `/backend`
3. Auto-detects `npm install` and `npm start`

---

## Step 4: Import Database Schema

You have 2 options:

### Option A: Using Railway Web Terminal
1. Click on MySQL service in Railway
2. Click **"Connect"** → **"Terminal"**
3. Run this command:
```bash
mysql -h <HOST> -u <USER> -p<PASSWORD> -D <DATABASE> < setup.sql
```

### Option B: Using Local MySQL
```bash
# Get your Railway MySQL host info
# Then run locally:
mysql -h your-railway-host.railway.internal \
  -u your_user \
  -p your_password \
  your_db < database/setup.sql
```

---

## Step 5: Deploy Frontend

### Option A: On Railway (Simple but slower)
1. Add another **Node.js** service
2. Root Directory: `/frontend`
3. Build Command: `npm run build`
4. Start Command: `npm run preview`

### Option B: On Vercel (Recommended - Faster)

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Root Directory: `frontend`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-railway-backend-url/api
   ```
   - Get your backend URL from Railway dashboard
6. Click **"Deploy"**

---

## Step 6: Update Backend URL

After frontend is deployed, update backend CORS:

1. Go back to **Railway Backend**
2. Update `FRONTEND_URL` environment variable
3. Restart service (automatic)

**If using Vercel Frontend:**
```
FRONTEND_URL=https://your-vercel-project.vercel.app
```

---

## Step 7: Test Everything ✅

### Test Backend Health
```bash
# Should return {"status":"ok"}
curl https://your-railway-backend.railway.app/api/health
```

### Test Frontend
1. Open your frontend URL in browser
2. Go to **"Meetings"** or **"Create Event"**
3. Try creating an event
4. Try booking a meeting

### Test Email
1. Create a booking
2. Check email (you should get confirmation)

---

## Common Issues & Fixes

### ❌ "Cannot connect to database"
**Fix:** Check MySQL credentials match in env vars
```bash
# Test locally first:
mysql -h <host> -u <user> -p<pass> -e "SELECT VERSION();"
```

### ❌ "CORS error"
**Fix:** Update `FRONTEND_URL` in Railway backend
- It must match your actual frontend domain

### ❌ "API calls timing out"
**Fix:** 
- Check backend logs in Railway
- Verify database is running
- Restart services

### ❌ "Database tables don't exist"
**Fix:** Re-run setup.sql
```bash
mysql -h <host> -u <user> -p<db> < database/setup.sql
```

---

## Your Deployed URLs

After successful deployment:

```
🌐 Frontend: https://your-vercel-project.vercel.app
🔗 Backend API: https://your-railway-backend.railway.app
📊 DB: Railway MySQL (auto-managed)
📧 Emails: Via Resend API
```

---

## Next Steps

1. ✅ Add custom domain (optional)
2. ✅ Setup monitoring
3. ✅ Celebrate! 🎉

---

## Need Help?

Run these commands to check status:

```bash
# Check Railway logs
railway logs

# Check if backend is accessible
curl https://your-railway-url/api/health

# Check if frontend can reach backend
# Open browser > DevTools > Network > Check API calls
```

