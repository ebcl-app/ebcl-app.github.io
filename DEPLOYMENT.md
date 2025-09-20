# Cricket Scoring App - GitHub Pages Deployment Guide

## 🚀 Deployment Setup

This guide will help you deploy the Cricket Scoring App to GitHub Pages so it's accessible at `https://yourusername.github.io/cricket-scoring-app`.

### 📋 Prerequisites

1. A GitHub account
2. Node.js installed locally
3. Git installed locally

### 🔧 Configuration Complete

The following files have been configured for GitHub Pages deployment:

#### 1. **package.json** - Updated with:
- `homepage` field pointing to your GitHub Pages URL
- `predeploy` and `deploy` scripts for gh-pages
- `gh-pages` dev dependency

#### 2. **GitHub Actions Workflow** - `.github/workflows/deploy.yml`:
- Automated deployment on push to main/master branch
- Builds and deploys to GitHub Pages
- Supports both GitHub Actions Pages deployment and gh-pages package

#### 3. **React Router Configuration** - `src/App.js`:
- Added basename support for GitHub Pages subdirectory
- Uses `PUBLIC_URL` environment variable

#### 4. **SPA Support** - Public folder files:
- `404.html` - Handles client-side routing
- `index.html` - Updated with SPA redirect script
- `_redirects` - Netlify-style redirects (backup)

## 🚀 Deployment Methods

### Method 1: Automatic Deployment (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Enable GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Source: Select "GitHub Actions"
   - The workflow will automatically deploy your app

3. **Access your app:**
   - URL: `https://yourusername.github.io/cricket-scoring-app`

### Method 2: Manual Deployment

1. **Update homepage in package.json:**
   ```json
   "homepage": "https://yourusername.github.io/your-repo-name"
   ```

2. **Deploy manually:**
   ```bash
   npm run deploy
   ```

## 🛠️ Setup Steps for New Repository

### 1. **Create GitHub Repository:**
```bash
# Initialize git if not already done
git init

# Add remote origin
git remote add origin https://github.com/yourusername/cricket-scoring-app.git

# Add all files
git add .

# Commit
git commit -m "Initial commit with GitHub Pages setup"

# Push to main branch
git push -u origin main
```

### 2. **Update package.json homepage:**
Replace `yourusername` and repository name in package.json:
```json
"homepage": "https://yourusername.github.io/cricket-scoring-app"
```

### 3. **Enable GitHub Pages:**
1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: Select "GitHub Actions"
4. Save settings

### 4. **Verify Deployment:**
- Check the Actions tab for deployment status
- Visit your GitHub Pages URL once deployment completes

## 🔍 Troubleshooting

### Common Issues:

1. **404 Error on page refresh:**
   - ✅ Already fixed with SPA redirect scripts

2. **Assets not loading:**
   - Ensure `homepage` in package.json matches your GitHub Pages URL
   - Check that `PUBLIC_URL` is being used correctly

3. **GitHub Actions failing:**
   - Check that Pages is enabled in repository settings
   - Verify workflow permissions in repository settings

4. **Build errors:**
   ```bash
   # Test build locally
   npm run build
   
   # Check for any console errors
   npm start
   ```

### Debugging Commands:

```bash
# Check current configuration
npm run build
npx serve -s build

# Test deployment locally
npm run predeploy
npm run deploy
```

## 📱 Features Deployed

Your Cricket Scoring App includes:

- 🏏 **Team Management** - Create and manage cricket teams
- 👥 **Player Registration** - Add players to your club
- 📊 **Match Setup** - Configure matches and scoring
- 🎯 **Real-time Scoring** - Track live match progress
- 📈 **Statistics Dashboard** - View club and team stats
- 📱 **Responsive Design** - Works on all devices

## 🔗 Useful Links

- **Live App:** `https://yourusername.github.io/cricket-scoring-app`
- **Repository:** `https://github.com/yourusername/cricket-scoring-app`
- **GitHub Pages Guide:** https://pages.github.com/
- **React Deployment Guide:** https://create-react-app.dev/docs/deployment/

## 🚀 Next Steps

1. **Custom Domain (Optional):**
   - Add CNAME file with your domain
   - Configure DNS settings

2. **Environment Variables:**
   - Set up production environment variables if needed

3. **Analytics:**
   - Add Google Analytics or other tracking

4. **SEO Optimization:**
   - Update meta tags and add sitemap

## 💡 Tips

- Always test builds locally before deploying
- Keep the `homepage` field updated if you change repository names
- Monitor GitHub Actions for deployment status
- Use the Issues tab for bug tracking and feature requests

---

**Happy Deploying! 🎉**

Your Cricket Scoring App is now ready for the world to see!