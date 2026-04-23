# 🚀 Performance Optimization Deployment Checklist

## Pre-Deployment

### 1. Code Changes ✅
- [x] Database connection pooling (`src/lib/db.ts`)
- [x] API optimizer module (`src/lib/api-optimizer.ts`)
- [x] Response cache module (`src/lib/response-cache.ts`)
- [x] Updated Next.js config (`next.config.mjs`)
- [x] Optimized API routes (announcements, slider)

### 2. Environment Variables
Update your production `.env`:

```bash
# CRITICAL: Set these for production
NODE_ENV=production
LOG_LEVEL=error

# Disable heavy monitoring
ENABLE_SECURITY_MONITORING=false
ENABLE_AUDIT_LOGGING=false
ENABLE_PERFORMANCE_MONITORING=false

# Relaxed rate limiting for high traffic
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=50000
RATE_LIMIT_WINDOW_MS=900000
```

### 3. Build & Test Locally
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm start

# Run performance analysis
node scripts/apply-performance-optimizations.js
```

### 4. Database Optimization
```sql
-- Check current connection limit
SHOW VARIABLES LIKE 'max_connections';

-- Check current connections
SHOW STATUS LIKE 'Threads_connected';

-- Verify indexes exist
SHOW INDEX FROM announcement;
SHOW INDEX FROM gallery;
SHOW INDEX FROM slider;
```

---

## Deployment Steps

### Step 1: Backup
```bash
# Backup database
mysqldump -u user -p database > backup_$(date +%Y%m%d).sql

# Backup current code
git tag pre-performance-optimization
git push --tags
```

### Step 2: Deploy Code
```bash
# Commit changes
git add .
git commit -m "feat: implement performance optimizations for 300+ concurrent users"

# Push to production
git push origin main
```

### Step 3: Update Environment Variables
On your hosting provider (Hostinger):
1. Go to hosting control panel
2. Update environment variables
3. Restart Node.js application

### Step 4: Clear Caches
```bash
# Clear application cache
# (This happens automatically on restart)

# If using CDN, purge cache
# Cloudflare: Purge Everything
# Other CDN: Follow their docs
```

---

## Post-Deployment Testing

### 1. Smoke Test (2 minutes)
```bash
# Test homepage
curl -I https://marmathewkavukatt.org

# Test API endpoints
curl https://marmathewkavukatt.org/api/announcements
curl https://marmathewkavukatt.org/api/slider
curl https://marmathewkavukatt.org/api/gallery/categories
```

### 2. Load Test (10 minutes)
```bash
# Light load
autocannon -c 10 -d 30 https://marmathewkavukatt.org

# Medium load
autocannon -c 50 -d 30 https://marmathewkavukatt.org

# Heavy load
autocannon -c 100 -d 30 https://marmathewkavukatt.org

# Stress test
autocannon -c 200 -d 30 https://marmathewkavukatt.org
```

### 3. Verify Caching
```bash
# First request (cache MISS)
curl -I https://marmathewkavukatt.org/api/announcements
# Look for: X-Cache: MISS

# Second request (cache HIT)
curl -I https://marmathewkavukatt.org/api/announcements
# Look for: X-Cache: HIT
```

### 4. Monitor Logs
```bash
# Check for errors
tail -f logs/errors/*.log

# Check application logs
# (Check your hosting provider's log viewer)
```

---

## Success Metrics

### Immediate (First Hour)
- [ ] No 500 errors in logs
- [ ] Response times <500ms for 20 concurrent users
- [ ] Cache hit rate >50% after warmup
- [ ] No database connection errors

### Short-term (First 24 Hours)
- [ ] Response times <1000ms for 100 concurrent users
- [ ] Cache hit rate >80%
- [ ] Error rate <1%
- [ ] No memory leaks (stable memory usage)

### Long-term (First Week)
- [ ] Handles 200+ concurrent users
- [ ] Average response time <800ms
- [ ] 99th percentile <2000ms
- [ ] Uptime >99.9%

---

## Rollback Plan

If issues occur:

### Quick Rollback (5 minutes)
```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or use git reset (if not pushed)
git reset --hard HEAD~1
git push --force origin main
```

### Environment Variable Rollback
Revert these in hosting control panel:
```bash
LOG_LEVEL=debug
ENABLE_SECURITY_MONITORING=true
ENABLE_AUDIT_LOGGING=true
```

### Database Rollback
```bash
# Restore from backup (if needed)
mysql -u user -p database < backup_YYYYMMDD.sql
```

---

## Monitoring Setup

### 1. Application Monitoring
Set up alerts for:
- Response time >2000ms
- Error rate >5%
- Memory usage >80%
- CPU usage >80%

### 2. Database Monitoring
Monitor:
- Active connections
- Slow queries (>1s)
- Connection pool exhaustion
- Deadlocks

### 3. Cache Monitoring
Track:
- Cache hit rate
- Cache size
- Cache evictions
- Memory usage

---

## Optimization Roadmap

### Phase 1: Immediate (Completed) ✅
- Database connection pooling
- API response caching
- Query optimization
- HTTP caching headers

### Phase 2: Short-term (Next 1-2 weeks)
- [ ] Enable CDN (Cloudflare)
- [ ] Optimize remaining API routes
- [ ] Add database indexes for slow queries
- [ ] Implement image lazy loading

### Phase 3: Medium-term (Next 1-2 months)
- [ ] Redis caching (if needed)
- [ ] Database read replicas
- [ ] Advanced monitoring (New Relic, Datadog)
- [ ] Performance budgets

### Phase 4: Long-term (Next 3-6 months)
- [ ] Microservices architecture (if needed)
- [ ] GraphQL API (if needed)
- [ ] Edge computing (Cloudflare Workers)
- [ ] Advanced caching strategies

---

## Troubleshooting Guide

### Issue: High latency after deployment
**Check**:
1. Database connection pool size
2. Cache is working (check X-Cache headers)
3. No slow queries in logs
4. Server resources (CPU, memory)

**Fix**:
- Increase connection pool limit
- Verify cache TTL settings
- Add missing database indexes
- Scale server resources

### Issue: Memory usage increasing
**Check**:
1. Cache size growing unbounded
2. Memory leaks in application
3. Too many database connections

**Fix**:
- Reduce cache TTL
- Enable more aggressive cleanup
- Restart application
- Check for memory leaks with profiler

### Issue: Cache not working
**Check**:
1. `cachedQuery` imported correctly
2. Cache keys are unique
3. TTL values are set
4. No errors in cache module

**Fix**:
- Verify imports in API routes
- Check cache.getStats() output
- Review cache key generation
- Check for TypeScript errors

---

## Support Contacts

### Hosting Provider
- **Provider**: Hostinger
- **Support**: [Hostinger Support](https://www.hostinger.com/support)

### Database
- **Type**: MySQL
- **Host**: srv2146.hstgr.io
- **Port**: 3306

### CDN (if enabled)
- **Provider**: Cloudflare (recommended)
- **Dashboard**: [Cloudflare Dashboard](https://dash.cloudflare.com)

---

## Final Checklist

Before marking deployment as complete:

- [ ] All code changes deployed
- [ ] Environment variables updated
- [ ] Load tests passed
- [ ] No errors in logs
- [ ] Cache working correctly
- [ ] Database connections stable
- [ ] Monitoring set up
- [ ] Team notified
- [ ] Documentation updated
- [ ] Rollback plan tested

---

## 🎉 Deployment Complete!

Once all checks pass, your website should handle:
- **300+ concurrent users**
- **<1000ms average response time**
- **<1% error rate**
- **80%+ cache hit rate**

Monitor for 24-48 hours and fine-tune as needed.

Good luck! 🚀
