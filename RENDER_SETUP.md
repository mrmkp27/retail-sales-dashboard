# Quick Render Setup Guide

## Immediate Fixes Applied

✅ Fixed root `package.json` - removed conflicting dependencies
✅ Updated CORS configuration - now supports production URLs
✅ Updated server binding - listens on `0.0.0.0` for Render
✅ Created `render.yaml` - deployment configuration file

## Quick Deployment Steps

### 1. Backend Service Setup

When creating the web service in Render:

**Build Command:**
```
cd backend && npm install
```

**Start Command:**
```
cd backend && npm start
```

**Environment Variables to Add:**
- `MONGODB_URI` = Your MongoDB connection string
- `FRONTEND_URL` = Your frontend URL (e.g., `https://your-frontend.onrender.com`)
- `NODE_ENV` = `production`

### 2. Frontend Service Setup

**Build Command:**
```
cd frontend && npm install && npm run build
```

**Publish Directory:**
```
frontend/dist
```

**Environment Variable:**
- `VITE_API_URL` = Your backend URL (e.g., `https://your-backend.onrender.com/api/sales`)

## Important Notes

1. **Root Directory**: If Render asks for root directory, leave it empty or set to the repository root
2. **Port**: Render automatically sets the PORT variable - don't override it
3. **CORS**: The backend now accepts requests from your FRONTEND_URL
4. **MongoDB**: Make sure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) or add Render's IPs

## Testing After Deployment

1. Check backend health: `https://your-backend.onrender.com/`
2. Should return: `{"message":"Retail Sales Management System Backend is running!","environment":"production"}`
3. Test API: `https://your-backend.onrender.com/api/sales`
4. Frontend should connect automatically if `VITE_API_URL` is set correctly

## Troubleshooting

If you still see "Cannot find module 'cors'":
1. Make sure Build Command is: `cd backend && npm install`
2. Check the build logs to see if npm install completed successfully
3. Verify you're deploying from the repository root, not the backend folder

