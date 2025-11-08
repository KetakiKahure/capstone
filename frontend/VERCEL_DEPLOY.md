# 🚀 Deploying FocusWave Frontend to Vercel

This guide will help you deploy the FocusWave frontend to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Backend URL**: Your backend should be deployed and accessible (or use your production backend URL)

## 🎯 Step 1: Prepare Your Code

### 1.1 Environment Variables

The frontend uses environment variables for API configuration. Create a `.env.production` file in the `frontend/` directory:

```env
VITE_API_URL=https://your-backend-url.com/api
```

**Note**: Replace `https://your-backend-url.com/api` with your actual backend API URL.

### 1.2 Verify Build

Test the build locally:

```bash
cd frontend
npm install
npm run build
```

This should create a `dist/` folder with the production build.

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in or create an account

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your Git repository
   - Select the repository containing your FocusWave project

3. **Configure Project**
   - **Root Directory**: Set to `frontend`
   - **Framework Preset**: Vite (should be auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`
   - Select environments: Production, Preview, Development

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your site will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

4. **Deploy**
   ```bash
   vercel
   ```

5. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_URL
   # Enter your backend URL: https://your-backend-url.com/api
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## ⚙️ Step 3: Configure Backend CORS

Make sure your backend allows requests from your Vercel domain:

1. **Update Backend CORS Settings**
   - In your backend `.env` file, add:
   ```env
   CORS_ORIGIN=https://your-project.vercel.app,http://localhost:3000
   ```

2. **Restart Backend**
   - Restart your backend server to apply CORS changes

## 🔧 Step 4: Update API Configuration (if needed)

If your backend URL changes, update the environment variable in Vercel:

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Update `VITE_API_URL` with the new backend URL
5. Redeploy the project

## 📝 Step 5: Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update CORS**
   - Add your custom domain to backend CORS settings
   - Update `VITE_API_URL` if needed

## 🐛 Troubleshooting

### Build Fails

1. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on the failed deployment
   - Check the build logs for errors

2. **Common Issues**
   - Missing dependencies: Ensure all dependencies are in `package.json`
   - Build errors: Fix any TypeScript/ESLint errors
   - Environment variables: Ensure all required variables are set

### API Connection Issues

1. **Check Backend URL**
   - Verify `VITE_API_URL` is correct in Vercel environment variables
   - Ensure backend is deployed and accessible

2. **Check CORS**
   - Verify backend CORS allows your Vercel domain
   - Check browser console for CORS errors

3. **Check Network**
   - Verify backend is running and accessible
   - Check if backend requires authentication

### 404 Errors on Routes

1. **Verify Rewrite Rules**
   - Check `vercel.json` is in the `frontend/` directory
   - Ensure rewrite rules are configured correctly

2. **Check Router Configuration**
   - Verify React Router is configured for client-side routing
   - Ensure all routes are properly defined

## ✅ Verification Checklist

- [ ] Frontend builds successfully locally
- [ ] Environment variables are set in Vercel
- [ ] Backend CORS allows Vercel domain
- [ ] Backend is deployed and accessible
- [ ] Frontend can connect to backend API
- [ ] All routes work correctly
- [ ] Authentication works
- [ ] All features function properly

## 🎉 Success!

Once deployed, your FocusWave frontend will be live on Vercel!

**Your URLs:**
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend-url.com`
- **ML Service**: `https://your-ml-service-url.com` (if deployed)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/start/overview)

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

1. **Connect Git Repository**
   - Link your GitHub/GitLab/Bitbucket repository
   - Vercel will watch for changes

2. **Automatic Deployments**
   - Push to `main` branch → Production deployment
   - Push to other branches → Preview deployment
   - Pull requests → Preview deployment

3. **Custom Domain**
   - Set up custom domain in Vercel Dashboard
   - Configure DNS settings
   - SSL certificates are automatically handled

---

**Need Help?** Check the [Vercel Support](https://vercel.com/support) or create an issue in your repository.

