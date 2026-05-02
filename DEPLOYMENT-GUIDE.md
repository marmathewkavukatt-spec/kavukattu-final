# Deployment Guide - Fixing Chunk Loading Errors

## 🚨 Problem
Users seeing "Application error: a client-side exception has occurred" with chunk loading errors after deployment.

## ✅ Solution Implemented

### 1. Automatic Recovery Mechanisms
The application now includes three layers of protection:

- **ChunkErrorHandler**: Automatically reloads the page once when chunk errors are detected
- **ServiceWorkerManager**: Clears old service workers and caches on page load
- **Error Boundaries**: Provides user-friendly error pages with reload options

### 2. Build Configuration
- Unique build IDs generated for each deployment
- Aggressive cache control headers
- No caching for HTML pages (always fresh chunk references)
- Long-term caching for static assets (with immutable flag)

## 📋 Deployment Steps

### Before Deployment

1. **Clean build**:
   ```bash
   npm run fix:chunks
   ```
   Or manually:
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Verify build**:
   - Check that `.next` directory is created
   - Verify no build errors in console

### During Deployment

1. **Upload files**:
   - Upload the ENTIRE `.next` directory
   - Ensure all files in `.next/static/` are accessible
   - Upload all other project files

2. **Server configuration**:
   - Ensure `/_next/static/*` is served correctly
   - Enable gzip/brotli compression
   - Set proper cache headers (already configured in next.config.mjs)

3. **Restart server**:
   ```bash
   # Stop the current process
   pm2 stop all  # or your process manager
   
   # Start fresh
   pm2 start npm --name "church" -- start
   # or
   npm start
   ```

### After Deployment

1. **Verify deployment**:
   ```bash
   npm run verify:deployment
   ```

2. **Test in browser**:
   - Open the site in incognito/private mode
   - Check browser console for errors
   - Navigate to different pages
   - Verify no chunk loading errors

3. **Monitor**:
   - Check server logs for errors
   - Monitor user reports

## 🔧 Troubleshooting

### If users still see errors:

1. **Immediate fix** (automatic):
   - The app will auto-reload once
   - This fixes most cases

2. **Manual fix** (if needed):
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Clear browser cache
   - Close and reopen browser

### If errors persist:

1. **Check server**:
   ```bash
   # Verify .next directory exists
   ls -la .next/
   
   # Check static files
   ls -la .next/static/chunks/
   
   # Verify server is running
   pm2 status
   ```

2. **Check file permissions**:
   ```bash
   # Ensure files are readable
   chmod -R 755 .next/
   ```

3. **Check server logs**:
   ```bash
   pm2 logs
   # or
   tail -f logs/errors/*.log
   ```

4. **Rebuild and redeploy**:
   ```bash
   npm run fix:chunks
   # Then upload and restart
   ```

## 🎯 Prevention

To prevent chunk errors in future deployments:

1. **Always clean build**:
   - Delete `.next` before building
   - Use `npm run fix:chunks`

2. **Upload complete build**:
   - Never upload partial `.next` directory
   - Ensure all static files are uploaded

3. **Restart server**:
   - Always restart after deployment
   - Clear any server-side caches

4. **Test before announcing**:
   - Test in incognito mode
   - Check multiple pages
   - Verify in different browsers

## 📊 Monitoring

Watch for these indicators:

- Browser console errors mentioning "chunk"
- 404 errors for `/_next/static/chunks/*`
- Users reporting blank pages or errors
- High bounce rates after deployment

## 🆘 Emergency Rollback

If issues are severe:

1. **Restore previous build**:
   ```bash
   # If you have backup
   rm -rf .next
   cp -r .next.backup .next
   pm2 restart all
   ```

2. **Or rebuild from previous commit**:
   ```bash
   git checkout <previous-commit>
   npm run build
   pm2 restart all
   ```

## ✨ Built-in Features

The application now handles chunk errors gracefully:

- **Auto-reload**: Happens once automatically
- **User-friendly errors**: Clear instructions for users
- **Cache clearing**: Old caches are automatically cleared
- **Error tracking**: Errors are logged to console

## 📞 Support

If issues persist after following this guide:

1. Check server logs: `pm2 logs` or `tail -f logs/errors/*.log`
2. Verify build: `ls -la .next/static/chunks/`
3. Test locally: `npm run build && npm start`
4. Check browser console for specific error messages

---

**Last Updated**: May 2, 2026
**Version**: 1.0.0
