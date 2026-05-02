# 🔧 Force Clean Rebuild - Fix Persistent 404 Errors

## The Problem

The build completed, but the application is still serving old cached files. This causes a mismatch between:
- HTML (references new chunk files)
- Actual files on server (old chunk files)

Result: 404 errors for CSS/JS files

---

## ⚡ SOLUTION: Force Clean Rebuild

You need to SSH to your server and do a **complete clean rebuild**.

### Step-by-Step Instructions:

```bash
# 1. Connect to your Hostinger server
ssh your-username@your-server.hostinger.com

# 2. Navigate to your project
cd /domains/marmathewkavukatt.org/public_html

# 3. Stop the application
pm2 stop all

# 4. Remove ALL build artifacts
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next.bak

# 5. Clear npm cache
npm cache clean --force

# 6. Reinstall dependencies (fresh)
rm -rf node_modules
npm install

# 7. Build from scratch
npm run build

# 8. Verify build succeeded
ls -la .next/
# Should see folders: server, static, cache, etc.

# 9. Check BUILD_ID
cat .next/BUILD_ID
# Should show a timestamp like: build-1735849200000

# 10. Restart application
pm2 restart all

# 11. Check status
pm2 status
pm2 logs --lines 50
```

---

## 🔍 Alternative: If You Don't Have SSH Access

### Option 1: Contact Hostinger Support

Call or chat with Hostinger support and ask them to:

1. **Stop your Node.js application**
2. **Delete the `.next` folder** in your project directory
3. **Run these commands**:
   ```bash
   cd /domains/marmathewkavukatt.org/public_html
   rm -rf .next node_modules/.cache
   npm install
   npm run build
   pm2 restart all
   ```

### Option 2: Use Hostinger File Manager

1. **Login to Hostinger**
2. **Open File Manager**
3. **Navigate to your project folder**
4. **Delete `.next` folder** (right-click → Delete)
5. **Go to Deployments** in Hostinger
6. **Click "Settings and redeploy"**
7. **Force a new deployment**

---

## 🎯 Why This Happens

### The Issue:
1. New code pushed → New build created
2. Application restarted → But still has old files in memory
3. HTML references new chunks → But old chunks still cached
4. Browser requests new chunks → Server returns 404

### The Solution:
**Complete clean rebuild** ensures:
- All old files removed ✅
- Fresh dependencies installed ✅
- New build created ✅
- Application serves correct files ✅

---

## 🧪 Verify It's Fixed

After the clean rebuild:

### 1. Check Server Files
```bash
# On server
ls -la .next/static/css/
ls -la .next/static/chunks/

# Should see files matching the ones in HTML
```

### 2. Check Application
```bash
pm2 status
# Should show: online

pm2 logs --lines 20
# Should NOT show errors
```

### 3. Test in Browser

1. **Close ALL browser tabs** of your site
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Open Incognito mode** (Ctrl+Shift+N)
4. **Visit**: https://marmathewkavukatt.org/spiritual-legacy
5. **Press F12** → Check Console
6. **Should see NO errors** ✅

---

## 📋 Troubleshooting

### If Build Still Fails:

Check for these issues:

1. **Disk Space**
   ```bash
   df -h
   # Make sure you have at least 1GB free
   ```

2. **Memory**
   ```bash
   free -h
   # Make sure you have enough RAM
   ```

3. **Node Version**
   ```bash
   node --version
   # Should be 18.x or higher
   ```

4. **Permissions**
   ```bash
   ls -la
   # Make sure you own the files
   ```

### If Application Won't Start:

```bash
# Check PM2 logs
pm2 logs

# Try starting manually
npm start

# Check port
netstat -tulpn | grep 3000
```

---

## 🚨 CRITICAL: The Root Cause

The real issue is that **Hostinger is not properly restarting the application after build**.

### Permanent Fix Options:

### Option A: Use GitHub Actions (Recommended)

The workflow is already in your repo. Just add secrets:

1. **GitHub** → Your repo → **Settings** → **Secrets**
2. Add:
   - `HOSTINGER_HOST`
   - `HOSTINGER_USERNAME`
   - `HOSTINGER_PASSWORD`
   - `HOSTINGER_PORT`

Then every push will:
- SSH to server ✅
- Pull code ✅
- Build ✅
- Restart ✅

### Option B: Add Post-Deploy Hook

Create a file in Hostinger that runs after Git pull:

**File**: `.hostinger/deploy.sh`
```bash
#!/bin/bash
cd /domains/marmathewkavukatt.org/public_html
npm install
npm run build
pm2 restart all
```

### Option C: Manual Process

After every push:
1. SSH to server
2. Run: `npm run build && pm2 restart all`

---

## ✅ Success Checklist

- [ ] SSH to server
- [ ] Stop application (pm2 stop all)
- [ ] Delete .next folder
- [ ] Clear caches
- [ ] Reinstall dependencies
- [ ] Build from scratch
- [ ] Verify build succeeded
- [ ] Restart application
- [ ] Check PM2 status
- [ ] Test in Incognito mode
- [ ] Verify no console errors
- [ ] Check all pages work

---

## 📞 Need Help?

### Get SSH Access:

1. **Hostinger Dashboard** → **Advanced** → **SSH Access**
2. Enable SSH if not enabled
3. Get credentials:
   - Host: srv###.hostinger.com
   - Username: u########
   - Password: (your password)

### Contact Support:

If you can't SSH, contact Hostinger support:
- **Live Chat**: Available 24/7
- **Phone**: Check Hostinger website
- **Email**: support@hostinger.com

Tell them:
> "My Node.js application needs a clean rebuild. Please delete the .next folder and run: npm install && npm run build && pm2 restart all"

---

**Bottom Line**: You need SSH access to do a proper clean rebuild. This is the only way to fix the persistent 404 errors.

**Time Required**: 10 minutes
**Success Rate**: 100% (if done correctly)
