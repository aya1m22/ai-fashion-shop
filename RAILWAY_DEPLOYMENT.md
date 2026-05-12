# 🚀 Backend API Deployment to Railway

## Step 1: Create Railway Account
Go to https://railway.app and sign up/login

## Step 2: Deploy from GitHub
1. Click "New Project" → "Deploy from GitHub repo"
2. Connect your GitHub account and select `aya1m22/ai-fashion-shop`
3. Set the **Root Directory** to: `backend`
4. Click "Deploy"

## Step 3: Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
DATABASE_URL=postgresql://postgres.kijcetovxxvqnrrlneaa:aya182808baraa@aws-0-Romania.pooler.supabase.com:6543/postgres
VITE_SUPABASE_URL=https://kijcetovxxvqnrrlneaa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpamNldG92eHh2cW5ycmxuZWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDMxNzEsImV4cCI6MjA5NDAxOTE3MX0.NF1QsIUjmnsEEkTLqJpamq7RPhHyUQ-bioPXXEWwiXM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpamNldG92eHh2cW5ycmxuZWFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ0MzE3MSwiZXhwIjoyMDk0MDE5MTcxfQ.VuSgK5aVVymSTPC_svC72CO0aVVrcgQOMg6c5eNOLqw
JWT_SECRET=fashion-shop-secret-key-123
OAUTH_SERVER_URL=http://localhost:5000
OWNER_OPEN_ID=aya12m34@gmail.com
NODE_ENV=production
```

## Step 4: Get Your Backend URL
After deployment, Railway will give you a URL like: `https://your-project-name.up.railway.app`

## Step 5: Update Frontend Environment
In your GitHub Pages deployment, add this environment variable:
```
VITE_API_URL=https://your-project-name.up.railway.app
```

## Step 6: Redeploy Frontend
Run: `npm run deploy` from the frontend directory to update the API URL.

---

## 🎯 Result
Your full-stack app will be live with:
- Frontend: https://aya1m22.github.io/ai-fashion-shop/
- Backend: https://your-project-name.up.railway.app

All features (products, cart, auth, AI stylist) will work!