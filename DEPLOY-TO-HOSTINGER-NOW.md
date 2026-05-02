# Deploy to Hostinger - Quick Guide

## Current Status
✅ Build completed successfully (80 pages generated)
❌ MIME type errors on deployed site
❌ Console errors on /spiritual-legacy page

## Fix Applied
Created `.htaccess` files to fix MIME type issues.

## Deploy Now (3 Steps)

### Step 1: Commit and Push

```bash
# Add the new .htaccess files
git add .htaccess public/.htaccess

# Add the fix documentation
git add FIX-MIME-TYPE-ERRORS.md DEPLOY-TO-HOSTINGER-NOW.md

# Add verification script
git add scripts/verify-hostinger-deployment.js package.json

# Commit
git commit -m "Fix MIME type errors with .htaccess configuration"

# Push to trigger auto-deploy
git push origin main
```

### Step 2: Wait for Auto-Deploy

Hostinger should automatically:
1. Pull the latest code
2. Run `npm install`
3. Generate Prisma client
4. Build Next.js app
5. Restart PM2

**Monitor the deployment:**
- Check Hostinger control panel → Git
- Or SSH and run: `pm2 logs`

### Step 3: Verify the Fix

**Option A: Run verification script**
```bash
npm run verify:hostinger
```

**Option B: Manual verification**
1. Open: https://marmathewkavukatt.org/spiritual-legacy
2. Press F12 (DevTools)
3. Check Console tab - should be NO errors
4. Check Network tab:
   - CSS files should show Type: `css`
   - JS files should show Type: `js`
   - All should be Status: `200`

**Option C: Test with curl**
```bash
# Test a CSS file
curl -I https://marmathewkavukatt.org/_next/static/css/app/layout.css

# Should show:
# Content-Type: text/css
```

## Expected Timeline

- **Push to GitHub:** Immediate
- **Hostinger pulls code:** 1-2 minutes
- **Build completes:** 3-5 minutes
- **Site updated:** 5-7 minutes total

## If Auto-Deploy Doesn't Work

### Manual Deploy via SSH:

```bash
# SSH into Hostinger
ssh your-username@your-server.hostinger.com

# Navigate to project
cd public_html

# Pull latest code
git pull origin main

# Run deployment script
bash .hostinger-deploy.sh
```

## Verification Checklist

After deployment, verify:

- [ ] No console errors on homepage
- [ ] No console errors on /spiritual-legacy
- [ ] CSS loads correctly (styles visible)
- [ ] JavaScript loads correctly (interactions work)
- [ ] Images load correctly
- [ ] Gallery works
- [ ] Admin login works
- [ ] All pages accessible

## Test These Critical Pages

1. **Homepage:** https://marmathewkavukatt.org/
2. **Spiritual Legacy:** https://marmathewkavukatt.org/spiritual-legacy
3. **Gallery:** https://marmathewkavukatt.org/gallery
4. **Announcements:** https://marmathewkavukatt.org/announcements
5. **About:** https://marmathewkavukatt.org/about
6. **Admin:** https://marmathewkavukatt.org/admin/login

## Troubleshooting

### Issue: .htaccess Not Working

```bash
# Check if file exists on server
ls -la .htaccess

# Check permissions
chmod 644 .htaccess

# View content
cat .htaccess
```

### Issue: Still Getting Errors

```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run build

# Restart PM2
pm2 restart all

# Clear browser cache
# Ctrl + Shift + Delete
```

### Issue: 404 Errors

```bash
# Check if .next folder exists
ls -la .next/

# Check BUILD_ID
cat .next/BUILD_ID

# Check if Node.js is running
pm2 list
```

## Quick Commands Reference

```bash
# Deploy
git push origin main

# Verify
npm run verify:hostinger

# Rebuild
npm run build

# Check status
pm2 list

# View logs
pm2 logs

# Restart
pm2 restart all
```

## Success Indicators

✅ **Console is clean** (no red errors)
✅ **Network tab shows 200 status** for all files
✅ **MIME types are correct:**
   - CSS: `text/css`
   - JS: `application/javascript`
   - Images: `image/webp`, `image/jpeg`, etc.
✅ **Pages render correctly**
✅ **Styles are applied**
✅ **JavaScript works**

## Next Steps After Successful Deploy

1. **Clear CDN cache** (if using Cloudflare)
2. **Test on mobile devices**
3. **Run performance audit:**
   ```bash
   npm run perf:test
   ```
4. **Monitor for 24 hours:**
   ```bash
   pm2 logs --lines 100
   ```

## Need Help?

If issues persist after following this guide:

1. Check detailed guide: `FIX-MIME-TYPE-ERRORS.md`
2. Run diagnostics: `npm run diagnose:deployment`
3. Check server logs: `pm2 logs`
4. Contact Hostinger support

---

**Ready to deploy?** Run the commands in Step 1 above! 🚀
