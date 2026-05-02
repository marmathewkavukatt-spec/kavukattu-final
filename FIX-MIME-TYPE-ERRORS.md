# Fix MIME Type Errors on Hostinger

## Problem
Your Next.js site is showing console errors:
- ❌ CSS files served as `text/html` instead of `text/css`
- ❌ JavaScript files served as `text/html` instead of `application/javascript`
- ❌ 404 errors for static assets
- ❌ "Refused to execute script" errors

## Root Cause
Hostinger's Apache server is not configured to serve Next.js static files with correct MIME types.

## Solution

### Step 1: Upload .htaccess Files

Two `.htaccess` files have been created:

1. **Root `.htaccess`** - Configures MIME types and routing
2. **`public/.htaccess`** - Configures MIME types for uploads

**Upload these files to your Hostinger server:**

```bash
# Via Git (recommended)
git add .htaccess public/.htaccess
git commit -m "Add .htaccess files to fix MIME types"
git push origin main

# Or via FTP/File Manager
# Upload .htaccess to: /public_html/
# Upload public/.htaccess to: /public_html/public/
```

### Step 2: Verify Files Are Uploaded

SSH into your Hostinger server and check:

```bash
# Check root .htaccess
ls -la /home/your-username/public_html/.htaccess

# Check public .htaccess
ls -la /home/your-username/public_html/public/.htaccess

# View content
cat /home/your-username/public_html/.htaccess
```

### Step 3: Restart Apache (if needed)

Some Hostinger plans require Apache restart:

```bash
# Try one of these commands
sudo service apache2 restart
# or
sudo systemctl restart apache2
# or
# Use Hostinger control panel to restart
```

### Step 4: Clear All Caches

1. **Browser Cache:**
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Clear cache

2. **Cloudflare Cache (if using):**
   - Go to Cloudflare dashboard
   - Click "Caching" → "Purge Everything"

3. **Server Cache:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

### Step 5: Verify the Fix

Run the verification script:

```bash
npm run verify:hostinger
```

Or manually test in browser:
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page (Ctrl + F5)
4. Check CSS/JS files:
   - Status should be `200`
   - Type should be `css` or `js`
   - Content-Type header should be correct

### Step 6: Test Critical Pages

Visit these URLs and check console:
- https://marmathewkavukatt.org/
- https://marmathewkavukatt.org/spiritual-legacy
- https://marmathewkavukatt.org/gallery
- https://marmathewkavukatt.org/announcements

## Expected Results

### Before Fix:
```
❌ GET /_next/static/css/app/layout.css
   Status: 200
   Type: text/html ← WRONG!
   Error: Refused to apply style
```

### After Fix:
```
✅ GET /_next/static/css/app/layout.css
   Status: 200
   Type: text/css ← CORRECT!
   No errors
```

## Troubleshooting

### Issue: .htaccess Not Working

**Possible causes:**
1. `.htaccess` files not uploaded
2. Apache `AllowOverride` is disabled
3. Wrong file permissions

**Solutions:**

```bash
# Check if .htaccess is being read
# Add this to .htaccess temporarily:
# ErrorDocument 404 "HTACCESS WORKING"
# Then visit a 404 page

# Fix permissions
chmod 644 .htaccess
chmod 644 public/.htaccess

# Check Apache config (requires root)
grep -r "AllowOverride" /etc/apache2/
# Should be: AllowOverride All
```

### Issue: Still Getting 404 Errors

**Check if Next.js is running:**

```bash
# Check PM2 status
pm2 list

# Check if port 3000 is listening
netstat -tulpn | grep 3000

# Restart Next.js
pm2 restart all
# or
npm start
```

### Issue: MIME Types Still Wrong

**Try adding to root .htaccess:**

```apache
# Force MIME types
<IfModule mod_mime.c>
  RemoveType .js .css
  AddType application/javascript .js .mjs
  AddType text/css .css
</IfModule>
```

### Issue: Works Locally, Not on Server

**Check environment:**

```bash
# Verify Node.js version
node --version  # Should be 18+

# Check if build exists
ls -la .next/

# Check build ID
cat .next/BUILD_ID

# Rebuild on server
rm -rf .next node_modules
npm install
npm run build
```

## Alternative: Use Hostinger Control Panel

If SSH is not available:

1. **Upload via File Manager:**
   - Login to Hostinger control panel
   - Go to "File Manager"
   - Navigate to `public_html`
   - Upload `.htaccess`
   - Navigate to `public_html/public`
   - Upload `public/.htaccess`

2. **Edit .htaccess directly:**
   - Right-click `.htaccess` → Edit
   - Paste content from local `.htaccess`
   - Save

3. **Check Apache modules:**
   - Go to "Advanced" → "Apache Configuration"
   - Ensure these modules are enabled:
     - `mod_mime`
     - `mod_rewrite`
     - `mod_headers`

## Prevention

To prevent this issue in future deployments:

1. **Always include .htaccess in Git:**
   ```bash
   # Make sure .htaccess is NOT in .gitignore
   git add .htaccess public/.htaccess
   ```

2. **Add to deployment script:**
   ```bash
   # In .hostinger-deploy.sh
   echo "Checking .htaccess files..."
   if [ ! -f ".htaccess" ]; then
     echo "ERROR: .htaccess missing!"
     exit 1
   fi
   ```

3. **Use verification script:**
   ```bash
   # After each deployment
   npm run verify:hostinger
   ```

## Quick Reference

### Key Files
- `.htaccess` - Root configuration
- `public/.htaccess` - Public directory configuration
- `.next/BUILD_ID` - Current build identifier

### Key Commands
```bash
# Verify deployment
npm run verify:hostinger

# Rebuild
npm run build

# Deploy
git push origin main

# Check logs
pm2 logs
```

### Key URLs to Test
- Main: https://marmathewkavukatt.org/
- Spiritual Legacy: https://marmathewkavukatt.org/spiritual-legacy
- Static CSS: https://marmathewkavukatt.org/_next/static/css/...
- Static JS: https://marmathewkavukatt.org/_next/static/chunks/...

## Need Help?

If issues persist:

1. **Check server logs:**
   ```bash
   tail -f /var/log/apache2/error.log
   pm2 logs
   ```

2. **Contact Hostinger support:**
   - Mention: "Need to enable .htaccess for Next.js"
   - Ask: "Is AllowOverride enabled?"
   - Request: "Enable mod_mime, mod_rewrite, mod_headers"

3. **Test with curl:**
   ```bash
   curl -I https://marmathewkavukatt.org/_next/static/css/app/layout.css
   # Check Content-Type header
   ```

## Success Checklist

- [ ] `.htaccess` uploaded to root
- [ ] `public/.htaccess` uploaded to public/
- [ ] Apache restarted (if needed)
- [ ] Browser cache cleared
- [ ] CDN cache cleared (if using)
- [ ] No console errors on spiritual-legacy page
- [ ] CSS files load with `text/css` MIME type
- [ ] JS files load with `application/javascript` MIME type
- [ ] All pages render correctly
- [ ] No 404 errors in Network tab

---

**Last Updated:** May 2, 2026
**Status:** Ready to deploy
