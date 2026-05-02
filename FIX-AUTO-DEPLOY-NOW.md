# 🚨 FIX AUTO-DEPLOY 404 ERRORS - ACTION PLAN

## THE PROBLEM

You're using **Hostinger auto-deploy from Git**, which means:
1. ✅ Git pulls latest code automatically
2. ❌ **Build is NOT running** on server (or failing)
3. ❌ `.next` folder is missing/outdated
4. ❌ Browser gets 404 errors for CSS/JS files

---

## ⚡ IMMEDIATE FIX (5 MINUTES)

### SSH to Server and Build Manually

```bash
# 1. Connect to your server
ssh your-username@your-server.hostinger.com

# 2. Navigate to your project
cd /domains/marmathewkavukatt.org/public_html

# 3. Build the application
npm run build

# 4. Restart
pm2 restart all

# 5. Verify .next was created
ls -la .next/
```

**This will fix it immediately!** ✅

---

## 🔧 PERMANENT FIX (Choose One)

### Option 1: Configure Hostinger Build Command (RECOMMENDED)

1. **Login to Hostinger Dashboard**

2. **Go to your Node.js Application Settings**

3. **Set these configurations**:
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   Node Version: 18.x or higher
   Auto Deploy: Enabled
   Branch: main
   ```

4. **Save and trigger a deployment**

5. **Check deployment logs** to verify build runs

---

### Option 2: Use GitHub Actions (AUTOMATED)

I've created a GitHub Actions workflow for you!

#### Step 1: Add Secrets to GitHub

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:
- `HOSTINGER_HOST` - Your server hostname (e.g., `srv123.hostinger.com`)
- `HOSTINGER_USERNAME` - Your SSH username
- `HOSTINGER_PASSWORD` - Your SSH password
- `HOSTINGER_PORT` - SSH port (usually `22`)

#### Step 2: Commit and Push

The workflow file is already created: `.github/workflows/deploy-hostinger.yml`

```bash
git add .github/workflows/deploy-hostinger.yml
git add .hostinger-deploy.sh
git commit -m "Add automated deployment workflow"
git push origin main
```

#### Step 3: Test

- Push any change to `main` branch
- Go to GitHub → Actions tab
- Watch the deployment run
- Check if it succeeds

**Now every push will automatically build on the server!** 🎉

---

### Option 3: Manual Deployment Script

Use the deployment script I created:

```bash
# On your server
cd /domains/marmathewkavukatt.org/public_html

# Make script executable
chmod +x .hostinger-deploy.sh

# Run it
./.hostinger-deploy.sh
```

**Run this script after every Git pull.**

---

## 🎯 RECOMMENDED APPROACH

**Best Solution**: Use **GitHub Actions** (Option 2)

**Why?**
- ✅ Fully automated
- ✅ Runs build on every push
- ✅ You can see deployment logs
- ✅ No manual intervention needed
- ✅ Works even if Hostinger doesn't support build commands

**Setup Time**: 10 minutes
**Maintenance**: Zero

---

## 📋 STEP-BY-STEP: GitHub Actions Setup

### 1. Get Your Hostinger SSH Details

You need:
- **Host**: Usually `srv###.hostinger.com` (check Hostinger dashboard)
- **Username**: Your SSH username (check Hostinger → SSH Access)
- **Password**: Your SSH password
- **Port**: Usually `22`

### 2. Add Secrets to GitHub

```
GitHub Repo → Settings → Secrets and variables → Actions → New repository secret
```

Add each secret:
- Name: `HOSTINGER_HOST`, Value: `srv123.hostinger.com`
- Name: `HOSTINGER_USERNAME`, Value: `your-username`
- Name: `HOSTINGER_PASSWORD`, Value: `your-password`
- Name: `HOSTINGER_PORT`, Value: `22`

### 3. Commit the Workflow

```bash
git add .github/workflows/deploy-hostinger.yml
git add .hostinger-deploy.sh
git commit -m "Add GitHub Actions deployment"
git push origin main
```

### 4. Watch It Deploy

- Go to GitHub → Your Repo → Actions tab
- You'll see "Deploy to Hostinger" workflow running
- Click on it to see logs
- Wait for it to complete (green checkmark)

### 5. Test Your Site

- Open: https://marmathewkavukatt.org/spiritual-legacy
- Press F12 → Check Console
- Should see NO errors! ✅

---

## 🔍 TROUBLESHOOTING

### If GitHub Actions Fails:

**Check SSH Connection**:
```bash
# Test SSH locally
ssh your-username@srv123.hostinger.com

# If it works, your credentials are correct
```

**Check Project Path**:
The workflow assumes your project is at:
```
/domains/marmathewkavukatt.org/public_html
```

If it's different, edit `.github/workflows/deploy-hostinger.yml` line 18.

**Check Logs**:
- GitHub → Actions → Click on failed workflow
- Read the error message
- Fix the issue and push again

---

### If Build Fails on Server:

**Check Node Version**:
```bash
node --version  # Should be 18.x or higher
```

**Check Dependencies**:
```bash
npm install
```

**Check Environment Variables**:
Make sure these are set in Hostinger:
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`

**Check Build Manually**:
```bash
npm run build
# Look for errors
```

---

## ✅ VERIFICATION CHECKLIST

After setting up automated deployment:

- [ ] GitHub Actions workflow is added
- [ ] Secrets are configured in GitHub
- [ ] Deployment script is committed
- [ ] Push triggers automatic deployment
- [ ] Build runs successfully on server
- [ ] .next folder is created
- [ ] Application restarts
- [ ] Site loads without 404 errors
- [ ] Console shows no errors
- [ ] All pages work correctly

---

## 🚀 QUICK COMMANDS

### Test Deployment Locally:
```bash
# Simulate what happens on server
npm install
npm run build
npm start
```

### Check Server Status:
```bash
ssh your-username@your-server.hostinger.com "cd /domains/marmathewkavukatt.org/public_html && ls -la .next/ && pm2 status"
```

### Force Rebuild on Server:
```bash
ssh your-username@your-server.hostinger.com "cd /domains/marmathewkavukatt.org/public_html && npm run build && pm2 restart all"
```

### Create Deployment Alias:
Add to your `~/.bashrc` or `~/.zshrc`:
```bash
alias deploy='ssh your-username@your-server.hostinger.com "cd /domains/marmathewkavukatt.org/public_html && git pull && npm install && npm run build && pm2 restart all"'
```

Then just run: `deploy`

---

## 📊 WHAT I CREATED FOR YOU

### Files:
1. ✅ `.github/workflows/deploy-hostinger.yml` - GitHub Actions workflow
2. ✅ `.hostinger-deploy.sh` - Deployment script
3. ✅ `HOSTINGER-AUTO-DEPLOY-FIX.md` - Detailed documentation
4. ✅ `FIX-AUTO-DEPLOY-NOW.md` - This action plan

### Scripts:
- All previous diagnostic scripts still work
- Use `npm run diagnose:deployment` to check local build

---

## 🎯 BOTTOM LINE

**Problem**: Hostinger pulls code but doesn't build
**Solution**: Use GitHub Actions to trigger build on every push
**Time**: 10 minutes setup
**Result**: Fully automated deployments

---

## 🚀 DO THIS NOW

### Immediate (5 min):
```bash
ssh your-username@your-server.hostinger.com
cd /domains/marmathewkavukatt.org/public_html
npm run build
pm2 restart all
```

### Permanent (10 min):
1. Add GitHub secrets (HOSTINGER_HOST, etc.)
2. Commit workflow files
3. Push to main
4. Watch it deploy automatically

**That's it!** 🎉

---

**Last Updated**: May 2, 2026
**Status**: READY TO IMPLEMENT
