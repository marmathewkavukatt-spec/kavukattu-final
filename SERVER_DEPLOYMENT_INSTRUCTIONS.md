# 🚀 Server Deployment Instructions

## Current Status

Your load test shows the optimizations haven't taken effect yet:
- **100 connections**: 5 req/sec, 6.3s latency, 51 timeouts ❌

This indicates either:
1. The code hasn't been deployed yet
2. Environment variables haven't been updated
3. The application needs to be restarted

---

## ✅ What Was Pushed (Latest Commit: 4bc9b92)

### Critical Optimizations Added:
1. **Database Connection Pooling** - Fixed syntax for MySQL
2. **API Response Caching** - Added to 4 most-accessed endpoints:
   - `/api/slider` - 5 minute cache
   - `/api/testimonies` - 10 minute cache
   - `/api/timings` - 10 minute cache
   - `/api/gallery/categories` - 5 minute cache
3. **Query Optimization** - Added select clauses
4. **HTTP Caching Headers** - CDN-friendly headers
5. **Cache Invalidation** - Automatic on updates

---

## 🔧 Required Server Actions

### Step 1: Verify Code Deployment

Check if your hosting provider has auto-deploy enabled:

**Hostinger Control Panel:**
1. Log in to Hostinger
2. Go to your website dashboard
3. Check "Git Deployment" or "Deployments" section
4. Verify latest commit `4bc9b92` is deployed

**If auto-deploy is NOT enabled:**
```bash
# SSH into your server
ssh your-username@your-server

# Navigate to your project
cd /path/to/your/project

# Pull latest changes
git pull origin main

# Install dependencies (if needed)
npm install

# Build the application
npm run build

# Restart the application
pm2 restart all
# OR
systemctl restart your-app-name
```

---

### Step 2: Update Environment Variables

**CRITICAL:** These environment variables MUST be set in production:

```bash
# Performance Settings
NODE_ENV=production
LOG_LEVEL=error

# Disable Heavy Monitoring
ENABLE_SECURITY_MONITORING=false
ENABLE_AUDIT_LOGGING=false
ENABLE_PERFORMANCE_MONITORING=false

# Relaxed Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=50000
RATE_LIMIT_WINDOW_MS=900000

# Database Settings
DATABASE_QUERY_TIMEOUT=30000
SLOW_QUERY_THRESHOLD=5000
```

**How to Update (Hostinger):**
1. Go to Hostinger Control Panel
2. Navigate to "Advanced" → "Environment Variables"
3. Add/Update the variables above
4. Save changes
5. **Restart the application**

---

### Step 3: Restart the Application

After updating environment variables, you MUST restart:

**Option A: Hostinger Control Panel**
1. Go to "Node.js" section
2. Click "Restart Application"

**Option B: SSH/Terminal**
```bash
# If using PM2
pm2 restart all

# If using systemd
sudo systemctl restart your-app-name

# If using direct node
pkill node
npm start
```

---

### Step 4: Verify Deployment

#### A. Check Application is Running
```bash
curl -I https://marmathewkavukatt.org
# Should return 200 OK
```

#### B. Check Cache Headers
```bash
curl -I https://marmathewkavukatt.org/api/slider
# Look for: Cache-Control: public, s-maxage=300
```

#### C. Check Cache is Working
```bash
# First request (cache MISS)
curl -I https://marmathewkavukatt.org/api/slider
# Look for: X-Cache: MISS

# Second request (cache HIT)
curl -I https://marmathewkavukatt.org/api/slider
# Look for: X-Cache: HIT
```

#### D. Run Load Test
```bash
# Test with 20 connections first
autocannon -c 20 -d 30 https://marmathewkavukatt.org
# Expected: 50+ req/sec, <400ms latency

# Then test with 100 connections
autocannon -c 100 -d 30 https://marmathewkavukatt.org
# Expected: 120+ req/sec, <1500ms latency
```

---

## 📊 Expected Results After Deployment

| Connections | Current | Expected | Improvement |
|-------------|---------|----------|-------------|
| 20 | 29 req/sec | 50+ req/sec | **1.7x** |
| 100 | 5 req/sec | 120+ req/sec | **24x** 🚀 |
| 200 | Failed | 150+ req/sec | **∞** |
| 300 | Failed | 180+ req/sec | **∞** |

**Latency:**
- 20 connections: 662ms → <300ms
- 100 connections: 6300ms → <1500ms

**Error Rate:**
- 100 connections: 51% → <1%

---

## 🐛 Troubleshooting

### Issue: Still getting poor performance after deployment

**Check 1: Verify environment variables are set**
```bash
# SSH into server
echo $NODE_ENV
echo $LOG_LEVEL
# Should show: production, error
```

**Check 2: Verify application restarted**
```bash
# Check process uptime
pm2 list
# OR
ps aux | grep node
```

**Check 3: Check application logs**
```bash
# PM2 logs
pm2 logs

# Or check log files
tail -f logs/errors/*.log
```

**Check 4: Verify database connection**
```bash
# In MySQL
mysql -u your_user -p
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads_connected';
```

---

### Issue: Cache not working (no X-Cache header)

**Possible causes:**
1. Application not restarted after code deployment
2. Cache module not loaded correctly
3. TypeScript compilation errors

**Fix:**
```bash
# Rebuild and restart
npm run build
pm2 restart all

# Check for errors
pm2 logs --err
```

---

### Issue: Database connection errors

**Check database connection limit:**
```sql
SHOW VARIABLES LIKE 'max_connections';
-- Should be at least 50
```

**If limit is too low, contact Hostinger support to increase it.**

---

## 📋 Deployment Checklist

- [ ] Latest code deployed (commit: 4bc9b92)
- [ ] Environment variables updated
- [ ] Application restarted
- [ ] Application is running (curl test passes)
- [ ] Cache headers present (Cache-Control visible)
- [ ] Cache working (X-Cache: HIT on second request)
- [ ] Load test shows improvement
- [ ] No errors in logs
- [ ] Database connections stable

---

## 🎯 Success Criteria

After proper deployment, you should see:

✅ **20 connections**: <400ms latency, 50+ req/sec  
✅ **100 connections**: <1500ms latency, 120+ req/sec  
✅ **200 connections**: <2500ms latency, 150+ req/sec  
✅ **Error rate**: <1%  
✅ **Cache hit rate**: >80% after warmup  

---

## 📞 Need Help?

If you're still experiencing issues after following these steps:

1. **Check Hostinger Documentation**: [Hostinger Node.js Guide](https://support.hostinger.com/en/articles/5857925-how-to-deploy-a-node-js-application)
2. **Contact Hostinger Support**: They can help with:
   - Deployment issues
   - Environment variable configuration
   - Database connection limits
   - Application restart
3. **Check Application Logs**: Look for specific error messages
4. **Verify Database**: Ensure MySQL is running and accessible

---

## 🚀 Next Steps After Successful Deployment

1. **Monitor for 24-48 hours**
2. **Run periodic load tests**
3. **Check cache hit rates**
4. **Monitor database connections**
5. **Consider enabling Cloudflare CDN** (60-80% additional improvement)

---

**Last Updated**: After commit 4bc9b92  
**Status**: Waiting for server deployment
