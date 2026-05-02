# Hostinger Deployment Fix - URGENT

## 🚨 THE PROBLEM

Your server is returning 404 errors for static files:
- `/_next/static/css/00076925fa761b6a.css` → 404
- `/_next/static/chunks/app/layout-a8aba3e4392cfb9d.js` → 404

**Root Cause**: The `.next` directory is NOT on the server or not accessible.

## ✅ IMMEDIATE FIX FOR HOSTINGER

### Option 1: Manual Upload via File Manager (FASTEST)

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Go to Hostinger File Manager**:
   - Login to Hostinger
   - Go to your Node.js hosting
   - Open File Manager

3. **Upload .next directory**:
   - Navigate to your project root (usually `/domains/marmathewkavukatt.org/public_html` or similar)
   - **DELETE the old .next folder** if it exists
   - **Upload the NEW .next folder** from your local machine
   - Make sure ALL files inside .next are uploaded (this may take a few minutes)

4. **Restart Node.js Application**:
   - Go to Hostinger Dashboard
   - Find "Node.js" section
   - Click "Restart Application"

### Option 2: GitHub Deployment (RECOMMENDED)

Since you're using GitHub deployment, you need to ensure the build happens on the server.

#### Step 1: Check Your Build Script

Create/update `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build Next.js
      run: npm run build
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        
    - name: Deploy to Hostinger
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        password: ${{ secrets.PASSWORD }}
        source: ".next,public,src,package.json,next.config.mjs,prisma"
        target: "/domains/marmathewkavukatt.org/public_html"
        
    - name: Restart Application
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        password: ${{ secrets.PASSWORD }}
        script: |
          cd /domains/marmathewkavukatt.org/public_html
          npm install --production
          pm2 restart all || npm start
```

#### Step 2: Add .gitignore Exception

Your `.next` folder might be gitignored. For Hostinger deployment, you have two options:

**Option A**: Build on server (recommended)
- Keep `.next/` in `.gitignore`
- Add build step to deployment process

**Option B**: Commit build files (quick fix)
- Remove `.next/` from `.gitignore` temporarily
- Commit and push the `.next` folder

### Option 3: SSH Deployment (ADVANCED)

If you have SSH access:

```bash
# 1. Connect to server
ssh your-username@your-server.hostinger.com

# 2. Navigate to project
cd /domains/marmathewkavukatt.org/public_html

# 3. Pull latest code
git pull origin main

# 4. Install dependencies
npm install

# 5. Build
npm run build

# 6. Restart
pm2 restart all
# or
npm start
```

## 🔍 VERIFY THE FIX

After deployment, check:

1. **File exists on server**:
   - Go to Hostinger File Manager
   - Navigate to your project folder
   - Verify `.next` folder exists
   - Check `.next/static/chunks/` has files

2. **Test in browser**:
   - Open https://marmathewkavukatt.org
   - Open DevTools (F12)
   - Check Console - should see no 404 errors
   - Check Network tab - all files should load with 200 status

## 🚨 COMMON HOSTINGER ISSUES

### Issue 1: .next folder not uploaded
**Solution**: Manually upload via File Manager

### Issue 2: Build not running on deployment
**Solution**: Add build step to deployment workflow

### Issue 3: Wrong directory
**Solution**: Verify you're in the correct directory (usually `/domains/yourdomain.com/public_html`)

### Issue 4: Permissions
**Solution**: Set correct permissions:
```bash
chmod -R 755 .next
```

### Issue 5: Node.js version mismatch
**Solution**: Use Node.js 18+ in Hostinger settings

## 📋 QUICK CHECKLIST

- [ ] Build locally: `npm run build`
- [ ] Verify .next folder exists locally
- [ ] Upload .next to Hostinger (via File Manager or GitHub)
- [ ] Verify .next exists on server
- [ ] Restart Node.js application in Hostinger
- [ ] Test site in browser
- [ ] Check DevTools Console for errors
- [ ] Verify no 404 errors for /_next/static/*

## 🎯 HOSTINGER-SPECIFIC SETTINGS

### In Hostinger Dashboard:

1. **Node.js Settings**:
   - Node.js Version: 18.x or higher
   - Application Mode: Production
   - Application Root: `/domains/marmathewkavukatt.org/public_html`
   - Application Startup File: `node_modules/next/dist/bin/next`
   - Application Startup Command: `start`

2. **Environment Variables**:
   - Add all your .env variables in Hostinger dashboard
   - DATABASE_URL
   - NEXT_PUBLIC_SITE_URL
   - etc.

## 🔧 EMERGENCY FIX (RIGHT NOW)

**Do this immediately**:

1. On your local machine:
   ```bash
   npm run build
   ```

2. Go to Hostinger File Manager

3. Navigate to your project folder

4. Delete old `.next` folder

5. Upload new `.next` folder (drag and drop)

6. Wait for upload to complete (may take 5-10 minutes)

7. Go to Hostinger Dashboard → Node.js → Restart Application

8. Test your site

**This should fix it immediately!**

## 📞 IF STILL NOT WORKING

Check these:

1. **Server logs** (in Hostinger dashboard):
   - Look for build errors
   - Look for file not found errors

2. **File permissions**:
   - Ensure .next folder is readable
   - Check ownership

3. **Path issues**:
   - Verify you're in the correct directory
   - Check that paths in next.config.mjs are correct

4. **Build issues**:
   - Ensure build completed successfully
   - Check for build errors in logs

---

**MOST LIKELY FIX**: Upload the `.next` folder manually via Hostinger File Manager and restart the application.
