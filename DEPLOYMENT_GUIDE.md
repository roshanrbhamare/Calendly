# 🚀 Deployment Guide

## Quick Decision Matrix

| Platform | Backend | Frontend | Database | Cost | Ease |
|----------|---------|----------|----------|------|------|
| **Railway** ⭐ | ✅ | ✅ | ✅ Included | $5/mo | ⭐⭐⭐ |
| **Render + Vercel** | ✅ | ✅ | PlanetScale | Free-$7 | ⭐⭐⭐ |
| **All Vercel** | ⚠️ | ✅ | Managed | Free-$15 | ⭐⭐ |
| **AWS** | ✅ | ✅ | RDS | $20+/mo | ⭐ |

---

## Option 1: Railway (Recommended) ⭐

### Why Railway?
- ✅ Node.js backend support (perfect for Express)
- ✅ MySQL database included
- ✅ Simple deployment
- ✅ Free tier with $5 monthly credit
- ✅ Easy environment variables

### Step 1: Prepare Your Code

```bash
# Make sure you have a start script
cat backend/package.json  # Verify "start": "node server.js" exists
```

### Step 2: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project

### Step 3: Deploy Backend
1. **In Railway Dashboard:**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your repository
   - Connect your GitHub account

2. **Configure Backend Service:**
   - Add "Node.js" service
   - Point to `/backend` directory

3. **Add Environment Variables:**
   - Go to Variables tab
   - Add all from `.env.example`:
   ```
   PORT=5000
   NODE_ENV=production
   DB_HOST=<railway-mysql-host>
   DB_USER=<railway-mysql-user>
   DB_PASSWORD=<railway-mysql-password>
   DB_NAME=<railway-mysql-db>
   RESEND_API_KEY=<your-resend-key>
   FRONTEND_URL=<your-frontend-url>
   ```

4. **Add MySQL Database:**
   - In Railway: Click "Add" → "Database" → "MySQL"
   - Fill in auto-generated credentials to env vars

### Step 4: Setup Database Schema
```bash
# After Railway MySQL is running:
# Option 1: Run SQL from setup.sql in Railway dashboard
# Option 2: Use MySQL client:
mysql -h <railway-host> -u <user> -p <db_name> < database/setup.sql
```

### Step 5: Deploy Frontend
1. **Option A: Also on Railway**
   - Add Node.js service in Railway
   - Set build command: `cd frontend && npm run build`
   - Set start command: `cd frontend && npm run preview`

2. **Option B: On Vercel (Better)**
   - See [Option 2: Render + Vercel](#option-2-render--vercel)

### Step 6: Update Configuration
- Backend gets auto-assigned URL from Railway
- Update frontend `.env` with backend URL:
  ```
  VITE_API_URL=https://your-railway-backend.railway.app/api
  ```

---

## Option 2: Render + Vercel (Also Great)

### Why This Combo?
- ✅ Render: Better for Node.js servers
- ✅ Vercel: Best for React/Vite frontend
- ✅ PlanetScale: Free MySQL alternative
- ✅ Both have generous free tiers

### Backend Deployment (Render)

#### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Create new "Web Service"

#### Step 2: Deploy Backend
1. Select "Deploy an existing image" → GitHub
2. Choose your repository
3. Configure:
   - **Name**: `scheduling-backend`
   - **Environment**: Node
   - **Region**: Choose nearest
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` (if using monorepo)

#### Step 3: Add Environment Variables (Render)
```
PORT=5000
NODE_ENV=production
DB_HOST=<planetscale-host>
DB_USER=<planetscale-user>
DB_PASSWORD=<planetscale-password>
DB_NAME=<planetscale-db>
RESEND_API_KEY=<your-key>
FRONTEND_URL=<vercel-frontend-url>
```

### Database Setup (PlanetScale)

#### Step 1: Create PlanetScale Account
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up (free account)
3. Create new database

#### Step 2: Get Connection String
1. In PlanetScale dashboard → Connect
2. Copy "Node.js" connection details
3. Extract: host, user, password, database

#### Step 3: Import Schema
```bash
# Connect to PlanetScale
mysql -h <host> -u <user> -p <database> < database/setup.sql

# Or run in PlanetScale web console
```

### Frontend Deployment (Vercel)

#### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import project

#### Step 2: Configure Project
1. **Project Name**: `scheduling-frontend`
2. **Framework**: Vite
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`

#### Step 3: Add Environment Variables
```
VITE_API_URL=https://scheduling-backend.onrender.com/api
```

#### Step 4: Deploy
- Click "Deploy"
- Get your Vercel URL (https://scheduling-frontend.vercel.app)

#### Step 5: Update Backend CORS
- Go back to Render backend
- Update environment variable:
  ```
  FRONTEND_URL=https://scheduling-frontend.vercel.app
  ```

---

## Option 3: All on Vercel (Node.js Serverless)

### ⚠️ Considerations
- Requires serverless function refactoring
- Connection pooling is limited
- May have cold starts
- Better for API-first architecture

### Setup Steps
1. Create `vercel.json` with serverless config
2. Refactor Express app for serverless
3. Use Vercel Postgres or PlanetScale
4. Deploy both frontend and backend as functions

**Not recommended for this project** - stick with Option 1 or 2.

---

## Deployment Checklist

### Pre-Deployment
- [ ] Update `.env.example` with all required variables ✅
- [ ] Add `start` script to `package.json` ✅
- [ ] Update CORS configuration ✅
- [ ] Update frontend API configuration ✅
- [ ] Test locally with production env vars:
  ```bash
  # Backend
  NODE_ENV=production npm start
  
  # Frontend
  VITE_API_URL=http://localhost:5000/api npm run build
  ```

### Post-Deployment
- [ ] Test all API endpoints
- [ ] Test booking flow end-to-end
- [ ] Verify email notifications with Resend
- [ ] Check timezone display on booking page
- [ ] Verify database operations
- [ ] Monitor logs for errors
- [ ] Setup monitoring/alerts

---

## Environment Variables Reference

### Backend (Required)
```
# Database
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=

# Server
PORT=5000
NODE_ENV=production

# Email
RESEND_API_KEY=

# CORS
FRONTEND_URL=https://yourdomain.com
```

### Frontend (Required)
```
VITE_API_URL=https://your-backend-api.com/api
```

---

## Troubleshooting

### "Cannot connect to database"
```
✓ Check DB credentials in environment variables
✓ Check database firewall/security groups
✓ Verify database is running
✓ Test connection string locally
```

### "CORS error" in browser
```
✓ Update FRONTEND_URL in backend env vars
✓ Redeploy backend after changing FRONTEND_URL
✓ Check browser console for exact error
```

### "API calls failing"
```
✓ Verify VITE_API_URL in frontend
✓ Check backend logs
✓ Test endpoint with curl:
  curl https://your-backend.com/api/health
```

### "Database schema missing"
```
✓ Run setup.sql on database:
  mysql -h <host> -u <user> -p <db> < database/setup.sql
```

---

## Monitoring & Maintenance

### Recommended Tools
- **Render/Railway Logs**: Built-in dashboard
- **Sentry** (Free): Error tracking
- **Uptime Robot** (Free): Monitoring
- **PlanetScale/MySQL**: Query logs and monitoring

### Health Checks
```bash
# Test backend is running
curl https://your-backend.com/api/health

# Should return:
# {"status":"ok","timestamp":"2024-01-01T..."}
```

---

## Domain Setup (Optional)

Once deployed and working, you can add a custom domain:

### For Vercel Frontend
1. Go to Vercel Project Settings → Domains
2. Add your domain
3. Follow DNS configuration
4. Update `FRONTEND_URL` in backend

### For Render Backend
1. Go to Render Service Settings → Custom Domain
2. Add your domain
3. Follow DNS configuration

---

## Next Steps

**Choose your deployment option:**
1. **Railway** (Easiest) - See [Option 1](#option-1-railway-recommended)
2. **Render + Vercel** (Most Flexible) - See [Option 2](#option-2-render--vercel)
3. **Need Help?** - Let me know which platform you choose!

