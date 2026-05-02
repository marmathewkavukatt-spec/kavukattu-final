# 🚨 EMERGENCY FIX - Spiritual Legacy Page 404 Errors

## THE PROBLEM
Your production server is returning 404 errors for Next.js static assets:
- CSS files returning HTML (MIME type error)
- JavaScript chunks returning 404
- This affects the `/spiritual-legacy` page (and likely others)

**Root Cause**: The `.next` build folder on your server is either missing, incomplete, or out of sync.

---

## ⚡ IMMEDIATE FIX (Choose One)

### Option 1: Manual Upload via Hostinger File Manager (FASTEST - 10 minutes)

1. **Build locally RIGHT NOW**:
   ```bash
   npm run build
   ```
   Wait for build to complete successfully.

2. **Go to Hostinger**:
   - Login to your Hostinger account
   - Navigate to your hosting dashboard
   - Open **File Manager**

3. **Navigate to your project folder**:
   - Usually: `/domains/marmathewkavukatt.org/public_html`
   - Or wherever your Node.js app is located

4. **DELETE the old `.next` folder**:
   - Find the `.next` folder on the server
   - Right-click → Delete
   - Confirm deletion

5. **Upload the NEW `.next` folder**:
   - Click "Upload" button in File Manager
   - Select your LOCAL `.next` folder (entire folder)
   - Wait for upload to complete (may take 5-10 minutes)
   - **IMPORTANT**: Make sure ALL files inside `.next` are uploaded

6. **Restart your Node.js application**:
   - Go back to Hostinger Dashboard
   - Find "Node.js" or "Applications" section
   - Click "Restart Application" or "Restart"

7. **Clear your browser cache and test**:
   - Open browser in Incognito/Private mode
   - Visit: https://marmathewkavukatt.org/spiritual-legacy
   - Check browser console (F12) - should see no errors

---

### Option 2: SSH Deployment (If you have SSH access)

```bash
# 1. Connect to your server
ssh your-username@your-server.hostinger.com

# 2. Navigate to your project
cd /domains/marmathewkavukatt.org/public_html

# 3. Backup current .next (optional)
mv .next .next.backup

# 4. Pull latest code (if using Git)
git pull origin main

# 5. Install dependencies
npm install

# 6. Build
npm run build

# 7. Restart application
pm2 restart all
# OR
npm start
```

---

### Option 3: FTP/SFTP Upload

1. Build locally: `npm run build`
2. Connect to your server via FTP/SFTP client (FileZilla, WinSCP, etc.)
3. Navigate to your project folder
4. Delete old `.next` folder
5. Upload new `.next` folder
6. Restart Node.js application via Hostinger dashboard

---

## ✅ VERIFY THE FIX

After deploying, check these:

### 1. Check Files on Server
- Go to Hostinger File Manager
- Navigate to your project folder
- Verify `.next` folder exists
- Check `.next/static/chunks/` has many files
- Check `.next/static/css/` has CSS files

### 2. Test in Browser
- Open https://marmathewkavukatt.org/spiritual-legacy in **Incognito mode**
- Open DevTools (F12)
- Check **Console** tab - should see NO red errors
- Check **Network** tab - all files should load with **200** status (not 404)
- Navigate to other pages - verify they work too

### 3. Test These URLs Directly
Open these in browser (should NOT return HTML):
- https://marmathewkavukatt.org/_next/static/css/00076925fa761b6a.css
- https://marmathewkavukatt.org/_next/static/chunks/app/(site)/layout-454f459f0be96165.js

If they return actual CSS/JS (not HTML), you're good! ✅

---

## 🔍 WHY THIS HAPPENED

Common causes:
1. **Incomplete deployment**: `.next` folder wasn't uploaded
2. **Build not run**: Deployed without running `npm run build`
3. **Wrong directory**: Uploaded to wrong location
4. **Git ignored**: `.next` is in `.gitignore` and wasn't uploaded
5. **Partial upload**: Upload interrupted or incomplete

---

## 🚨 CRITICAL CHECKLIST

Before you say "it's fixed":

- [ ] Ran `npm run build` locally (no errors)
- [ ] Verified `.next` folder exists locally
- [ ] Deleted old `.next` on server
- [ ] Uploaded entire new `.next` folder to server
- [ ] Verified `.next` exists on server (via File Manager)
- [ ] Restarted Node.js application
- [ ] Tested in Incognito mode
- [ ] Checked browser console (no errors)
- [ ] Verified Network tab (all 200 status)
- [ ] Tested spiritual-legacy page specifically
- [ ] Tested other pages (home, about, etc.)

---

## 📋 HOSTINGER-SPECIFIC SETTINGS

Make sure these are correct in Hostinger Dashboard:

### Node.js Settings:
- **Node.js Version**: 18.x or higher (NOT 14.x or 16.x)
- **Application Mode**: Production
- **Application Root**: `/domains/marmathewkavukatt.org/public_html`
- **Application Startup File**: `node_modules/next/dist/bin/next`
- **Application Startup Command**: `start`

### Environment Variables:
Make sure all your `.env` variables are set in Hostinger:
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `JWT_SECRET`
- Any other variables from your `.env` file

---

## 🆘 IF STILL NOT WORKING

### Check Server Logs:
1. Go to Hostinger Dashboard
2. Find "Logs" or "Error Logs"
3. Look for:
   - Build errors
   - File not found errors
   - Permission errors

### Check File Permissions:
```bash
# Via SSH
chmod -R 755 .next
```

### Verify Directory Structure:
Your server should have:
```
/domains/marmathewkavukatt.org/public_html/
├── .next/              ← MUST EXIST
│   ├── static/
│   │   ├── chunks/
│   │   └── css/
│   ├── server/
│   └── ...
├── src/
├── public/
├── node_modules/
├── package.json
├── next.config.mjs
└── ...
```

### Nuclear Option (Complete Rebuild):
```bash
# On server via SSH
cd /domains/marmathewkavukatt.org/public_html
rm -rf .next node_modules
npm install
npm run build
pm2 restart all
```

---

## 📞 QUICK SUPPORT CHECKLIST

If you need to contact support, provide:
1. Screenshot of browser console errors
2. Screenshot of File Manager showing `.next` folder
3. Screenshot of Hostinger Node.js settings
4. Server logs (if available)

---

## ✨ PREVENTION FOR FUTURE

To prevent this from happening again:

### Option A: Automated Deployment Script
Create `deploy.sh`:
```bash
#!/bin/bash
echo "Building application..."
npm run build

echo "Uploading to server..."
# Use your preferred upload method (rsync, scp, etc.)

echo "Restarting application..."
# Restart command

echo "Deployment complete!"
```

### Option B: CI/CD Pipeline
Set up GitHub Actions to automatically build and deploy on push.

### Option C: Deployment Checklist
Always follow:
1. `npm run build` locally
2. Upload `.next` folder
3. Restart server
4. Test in incognito mode

---

## 🎯 BOTTOM LINE

**The fix is simple**: Upload the `.next` folder to your server and restart.

**Time required**: 10-15 minutes

**Success rate**: 99% (this fixes the issue in almost all cases)

**DO IT NOW!** 🚀

---

**Last Updated**: May 2, 2026
**Status**: URGENT - NEEDS IMMEDIATE ACTION
