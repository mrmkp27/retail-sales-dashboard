# Deployment Guide for Render

This guide will help you deploy the Retail Sales Management System on Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. A MongoDB database (MongoDB Atlas recommended - free tier available)
3. Your MongoDB connection string

## Step 1: Deploy Backend Service

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. In Render dashboard, click "New" → "Blueprint"
3. Connect your repository
4. Render will automatically detect the `render.yaml` file
5. Configure the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `FRONTEND_URL`: Your frontend URL (e.g., `https://your-frontend.onrender.com`)
   - `NODE_ENV`: `production`
   - `PORT`: Will be automatically set by Render

### Option B: Manual Setup

1. In Render dashboard, click "New" → "Web Service"
2. Connect your repository
3. Configure the service:
   - **Name**: `truestate-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (or set to `backend` if deploying from subdirectory)

4. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `FRONTEND_URL`: Your frontend URL
   - `NODE_ENV`: `production`
   - `PORT`: Will be auto-set by Render

5. Click "Create Web Service"

## Step 2: Deploy Frontend Service

1. In Render dashboard, click "New" → "Static Site"
2. Connect your repository
3. Configure:
   - **Name**: `truestate-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. Add Environment Variable:
   - `VITE_API_URL`: Your backend URL (e.g., `https://truestate-backend.onrender.com/api/sales`)

5. Click "Create Static Site"

## Step 3: Update Environment Variables

After both services are deployed:

1. **Backend Service**:
   - Update `FRONTEND_URL` to your frontend URL
   - Ensure `MONGODB_URI` is set correctly

2. **Frontend Service**:
   - Update `VITE_API_URL` to your backend URL (should end with `/api/sales`)

## Step 4: Import Data (Optional)

If you need to import the sales data:

1. You can run the seeder locally pointing to your production MongoDB:
   ```bash
   cd backend
   MONGODB_URI=your_production_mongodb_uri node seeder.js
   ```

2. Or use Render's Shell feature:
   - Go to your backend service
   - Click "Shell"
   - Run: `npm run data:import`

## Troubleshooting

### Backend Issues

- **"Cannot find module 'cors'"**: Make sure the build command is `cd backend && npm install`
- **Port binding errors**: The server is configured to listen on `0.0.0.0` which should work on Render
- **MongoDB connection errors**: Verify your `MONGODB_URI` is correct and the database is accessible

### Frontend Issues

- **API connection errors**: Verify `VITE_API_URL` is set correctly
- **CORS errors**: Make sure `FRONTEND_URL` in backend matches your frontend URL

### Common Render Issues

- **Build fails**: Check the build logs, ensure all dependencies are in `package.json`
- **Service crashes**: Check the logs for errors, verify environment variables are set
- **Slow first request**: This is normal on free tier (cold starts)

## Environment Variables Summary

### Backend
- `MONGODB_URI` (required): MongoDB connection string
- `FRONTEND_URL` (required): Frontend URL for CORS
- `NODE_ENV`: `production`
- `PORT`: Auto-set by Render

### Frontend
- `VITE_API_URL` (required): Backend API URL (e.g., `https://your-backend.onrender.com/api/sales`)

## Notes

- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid tier for always-on services
- MongoDB Atlas free tier is sufficient for development/testing

