# 🚨 HOSTINGER AUTO-DEPLOY FIX - 404 Errors

## THE REAL PROBLEM

Since Hostinger auto-deploys from Git:
1. Git pulls latest code ✅
2. `.next` folder is **NOT** in Git (correctly in `.gitignore`) ✅
3. **Build must run on server** after Git pull ❌ ← THIS IS THE ISSUE
4. If build doesn't run or fails, old/missing `.next` causes 404 errors

---

## ⚡ IMMEDIATE FIX

### Option 1: Force Rebuild on Hostinger (FASTEST)

1. **Login to Hostinger Dashboard**

2. **Go to your Node.js Application**

3. **Find the deployment/build settings**

4. **Ensure these settings are correct**:
   - **Build Command**: `npm run build` or `npm install && npm run build`
   - **Start Command**: `npm start` or `next start`
   - **Node Version**: 18.x or higher

5. **Trigger Manual Deployment**:
   - Look for "Deploy" or "Rebuild" button
   - Click it to force a fresh build

6. **Check Build Logs**:
   - Look for any errors during build
   - Verify build completes successfully

---

### Option 2: SSH to Server and Rebuild

```bash
# Connect to server
ssh your-username@your-server.hostinger.com

# Navigate to project
cd /domains/marmathewkavukatt.org/public_html

# Pull latest code
git pull origin main

# Install dependencies (in case anything changed)
npm install

# CRITICAL: Run build
npm run build

# Check if .next was created
ls -la .next/

# Restart application
pm2 restart all
# OR
npm start
```

---

## 🔍 ROOT CAUSE ANALYSIS

### Why This Happens with Auto-Deploy:

1. **Git pulls code** → ✅ Works
2. **npm install runs** → ✅ Works
3. **npm run build SHOULD run** → ❌ Might not be configured
4. **Application restarts** → ✅ Works
5. **But .next is missing/old** → ❌ 404 errors

### The Missing Link:

Hostinger needs to be configured to run `npm run build` after every Git pull.

---

## ✅ PERMANENT FIX - Configure Hostinger Properly

### Step 1: Check Hostinger Build Configuration

In Hostinger Dashboard, find your Node.js app settings and verify:

```
Build Command: npm install && npm run build
Start Command: npm start
Node Version: 18.x or higher
Auto Deploy: Enabled (from Git)
Branch: main (or your deployment branch)
```

### Step 2: Add Build Hook (If Supported)

Some Hostinger plans support build hooks. Check if you can add:

**Post-deployment script**:
```bash
#!/bin/bash
npm install
npm run build
pm2 restart all
```

### Step 3: Verify Environment Variables

Make sure these are set in Hostinger:
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`
- Any other variables from your `.env`

---

## 🔧 CREATE A DEPLOYMENT SCRIPT

Since Hostinger might not run build automatically, let's create a post-deployment hook:

### Create `.hostinger-deploy.sh` in your project root:

```bash
#!/bin/bash

echo "🚀 Starting Hostinger deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build Next.js application
echo "🏗️  Building Next.js application..."
npm run build

# Check if build succeeded
if [ -d ".next" ]; then
  echo "✅ Build successful - .next folder created"
else
  echo "❌ Build failed - .next folder not found"
  exit 1
fi

# Restart application
echo "🔄 Restarting application..."
pm2 restart all || npm start

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x .hostinger-deploy.sh
```

Then configure Hostinger to run this script after Git pull.

---

## 🎯 ALTERNATIVE: Use GitHub Actions

If Hostinger doesn't support build hooks well, use GitHub Actions to trigger builds:

### Create `.github/workflows/deploy-hostinger.yml`:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy via SSH
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOSTINGER_HOST }}
        username: ${{ secrets.HOSTINGER_USERNAME }}
        password: ${{ secrets.HOSTINGER_PASSWORD }}
        script: |
          cd /domains/marmathewkavukatt.org/public_html
          git pull origin main
          npm install
          npm run build
          pm2 restart all
```

Add these secrets to your GitHub repo:
- `HOSTINGER_HOST`
- `HOSTINGER_USERNAME`
- `HOSTINGER_PASSWORD`

---

## 🆘 IMMEDIATE WORKAROUND

Until you fix the auto-deploy configuration:

### Manual Rebuild After Each Push:

1. Push code to Git
2. SSH to server:
   ```bash
   ssh your-username@your-server.hostinger.com
   cd /domains/marmathewkavukatt.org/public_html
   npm run build
   pm2 restart all
   ```

### Or Create an Alias:

Add to your local `.bashrc` or `.zshrc`:
```bash
alias deploy-hostinger='ssh your-username@your-server.hostinger.com "cd /domains/marmathewkavukatt.org/public_html && git pull && npm install && npm run build && pm2 restart all"'
```

Then just run:
```bash
deploy-hostinger
```

---

## 🔍 DEBUGGING STEPS

### 1. Check if Build Runs on Server

SSH to server and check logs:
```bash
# Check PM2 logs
pm2 logs

# Check if .next exists
ls -la .next/

# Check .next contents
ls -la .next/static/chunks/

# Check build timestamp
stat .next/BUILD_ID
```

### 2. Check Hostinger Deployment Logs

In Hostinger Dashboard:
- Go to your application
- Find "Logs" or "Deployment History"
- Check if build command runs
- Look for build errors

### 3. Test Build Manually

SSH to server:
```bash
cd /domains/marmathewkavukatt.org/public_html

# Remove old build
rm -rf .next

# Try building
npm run build

# Check for errors
echo $?  # Should be 0 if successful
```

---

## 📋 CHECKLIST FOR HOSTINGER AUTO-DEPLOY

- [ ] Git auto-deploy is enabled
- [ ] Build command is configured: `npm install && npm run build`
- [ ] Start command is configured: `npm start`
- [ ] Node version is 18.x or higher
- [ ] Environment variables are set
- [ ] Build runs after each Git push
- [ ] .next folder is created on server
- [ ] Application restarts after build

---

## 🎯 MOST LIKELY SOLUTION

**The issue**: Hostinger is pulling code but **NOT running build**.

**The fix**: Configure Hostinger to run `npm run build` after Git pull.

**How**:
1. Check Hostinger Node.js app settings
2. Set Build Command to: `npm install && npm run build`
3. Or manually run build via SSH after each push
4. Or use GitHub Actions to trigger build

---

## 💡 WHY .next IS IN .gitignore (And Should Stay There)

✅ **Correct**: `.next` in `.gitignore`
- Build artifacts shouldn't be in Git
- Different environments may need different builds
- Keeps repo clean and small

❌ **Wrong**: Committing `.next` to Git
- Bloats repository
- Can cause conflicts
- Not best practice

**Solution**: Build on server after deployment (which Hostinger needs to do)

---

## 🚀 QUICK ACTION PLAN

**Right Now** (5 minutes):
```bash
# SSH to server
ssh your-username@your-server.hostinger.com

# Go to project
cd /domains/marmathewkavukatt.org/public_html

# Build
npm run build

# Restart
pm2 restart all
```

**For Future** (30 minutes):
1. Configure Hostinger build command
2. Or set up GitHub Actions
3. Or create deployment script
4. Test by pushing a small change

---

## 📞 NEED HELP?

### Check These:

1. **Hostinger Documentation**:
   - Search: "Node.js auto deploy build command"
   - Look for: "Post-deployment hooks"

2. **Contact Hostinger Support**:
   - Ask: "How to run npm run build after Git auto-deploy?"
   - Request: "Enable build command for Node.js app"

3. **Check Your Hostinger Plan**:
   - Some plans may not support build commands
   - May need to upgrade or use GitHub Actions

---

## ✅ VERIFICATION

After fixing, verify:

1. **Push a small change to Git**
2. **Wait for auto-deploy**
3. **SSH to server and check**:
   ```bash
   ls -la .next/
   cat .next/BUILD_ID
   ```
4. **Test in browser**:
   - Open spiritual-legacy page
   - Check console (F12)
   - Should see no 404 errors

---

**Last Updated**: May 2, 2026
**Status**: REQUIRES HOSTINGER BUILD CONFIGURATION
