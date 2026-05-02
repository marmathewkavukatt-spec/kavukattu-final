# 🚀 Performance Action Plan

## Current Status
- **Score**: 74/100 (Mobile)
- **Improved from**: 65/100 (+9 points! 🎉)
- **Target**: 90+/100

---

## 🎯 Priority Issues to Fix

### 1. Cumulative Layout Shift (CLS): 0.172
**Target**: < 0.1
**Impact**: HIGH

**Causes**:
- Images without explicit width/height
- Dynamic content insertion
- Web fonts loading

**Fixes**:
- ✅ Add width/height to all images
- ✅ Use Next.js Image component everywhere
- ✅ Add font-display: swap
- ✅ Reserve space for dynamic content

### 2. Speed Index: 12.7s
**Target**: < 4s
**Impact**: HIGH

**Causes**:
- Large JavaScript bundles
- Render-blocking resources
- Unoptimized images

**Fixes**:
- ✅ Lazy load components
- ✅ Code splitting
- ✅ Optimize images
- ✅ Defer non-critical JS

### 3. Largest Contentful Paint (LCP): 3.4s
**Target**: < 2.5s
**Impact**: MEDIUM

**Causes**:
- Large images
- Slow server response
- Render-blocking resources

**Fixes**:
- ✅ Optimize hero images
- ✅ Use CDN for images
- ✅ Preload critical resources
- ✅ Improve server response time

---

## ⚡ QUICK WINS (Do These First)

### 1. Update next.config.mjs ✅ DONE
- Added CSS optimization
- Added modular imports
- Added console removal
- Updated cache headers

### 2. Create Lazy Loading Components ✅ DONE
- Created `src/components/LazyComponents.tsx`
- Lazy load heavy components
- Reduce initial bundle size

### 3. Run Performance Analyzer
```bash
npm run perf:optimize
```

This will show you:
- Images without dimensions
- Heavy components not lazy-loaded
- Missing optimizations

---

## 📋 IMPLEMENTATION STEPS

### Step 1: Fix Layout Shifts (30 minutes)

**Replace `<img>` with `<Image>`**:

```typescript
// Before:
<img src="/path/to/image.jpg" alt="Description" />

// After:
import Image from 'next/image';

<Image 
  src="/path/to/image.jpg" 
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  quality={85}
/>
```

**Files to update**:
- `src/components/HomeHistorySection.tsx`
- `src/components/AboutContent.tsx`
- `src/components/HomeGallerySection.tsx`
- `src/components/FilteredAnnouncements.tsx`
- `src/components/HomeAnnouncementsSection.tsx`

### Step 2: Implement Lazy Loading (20 minutes)

**Update pages to use lazy components**:

```typescript
// Before:
import SpiritualLegacyContent from '@/components/SpiritualLegacyContent';

// After:
import { SpiritualLegacyContent } from '@/components/LazyComponents';
```

**Files to update**:
- `src/app/(site)/spiritual-legacy/page.tsx`
- `src/app/(site)/page.tsx` (for HomeGallerySection, HomeAnnouncementsSection)
- `src/app/(site)/gallery/page.tsx`
- `src/app/(site)/testimony/page.tsx`

### Step 3: Optimize Fonts (10 minutes)

**Update `src/app/layout.tsx`**:

```typescript
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["Georgia", "serif"],
  preload: true, // Add this
  adjustFontFallback: true, // Add this
});

// Same for dmSans and manjari
```

### Step 4: Build and Test (10 minutes)

```bash
# Build
npm run build

# Start
npm start

# Test in browser
# Open: http://localhost:3000
# Run Lighthouse audit
```

---

## 🔧 DETAILED FIXES

### Fix 1: Replace img tags in HomeHistorySection.tsx

```typescript
// Find this:
<img
  src={priestImageSrc}
  alt={priestName}
  className="w-full h-auto rounded-lg shadow-md"
/>

// Replace with:
<Image
  src={priestImageSrc}
  alt={priestName}
  width={384}
  height={512}
  className="w-full h-auto rounded-lg shadow-md"
  loading="lazy"
  quality={85}
/>
```

### Fix 2: Replace img tags in HomeGallerySection.tsx

```typescript
// Find this:
<img
  src={category.coverImage}
  alt={translatedTitles[index] || category.title}
  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
/>

// Replace with:
<Image
  src={category.coverImage}
  alt={translatedTitles[index] || category.title}
  fill
  className="object-cover transition-transform duration-500 group-hover:scale-110"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  loading="lazy"
  quality={85}
/>
```

### Fix 3: Lazy load SpiritualLegacyContent

**In `src/app/(site)/spiritual-legacy/page.tsx`**:

```typescript
// Before:
import SpiritualLegacyContent from "@/components/SpiritualLegacyContent";

export default function SpiritualLegacyPage() {
  return <SpiritualLegacyContent />;
}

// After:
import { SpiritualLegacyContent } from "@/components/LazyComponents";

export default function SpiritualLegacyPage() {
  return <SpiritualLegacyContent />;
}
```

---

## 📊 EXPECTED RESULTS

After implementing all fixes:

| Metric | Current | Target | Expected |
|--------|---------|--------|----------|
| Performance Score | 74 | 90+ | 88-92 |
| LCP | 3.4s | < 2.5s | 2.0-2.3s |
| CLS | 0.172 | < 0.1 | 0.05-0.08 |
| Speed Index | 12.7s | < 4s | 3.5-4.5s |
| FCP | 1.6s | < 1.8s | 1.2-1.5s |

---

## 🧪 TESTING CHECKLIST

After each change:

- [ ] Run `npm run build` (no errors)
- [ ] Run `npm start`
- [ ] Test in browser (visual check)
- [ ] Run Lighthouse audit
- [ ] Check Console for errors
- [ ] Test on mobile device
- [ ] Verify images load correctly
- [ ] Check layout doesn't shift

---

## 🚀 DEPLOYMENT

After testing locally:

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "Performance optimizations: lazy loading, image optimization, cache improvements"
   git push origin main
   ```

2. **Wait for auto-deploy** (if using GitHub Actions)

3. **Or SSH and build**:
   ```bash
   ssh to server
   cd project
   npm run build
   pm2 restart all
   ```

4. **Test production**:
   - Open: https://marmathewkavukatt.org
   - Run PageSpeed Insights
   - Verify score improved

---

## 📈 MONITORING

### Track Performance Over Time

Use these tools:
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Lighthouse**: Chrome DevTools
- **WebPageTest**: https://www.webpagetest.org/

### Set Up Monitoring

Consider adding:
- Google Analytics (Core Web Vitals)
- Vercel Analytics (if using Vercel)
- Custom performance monitoring

---

## 🎯 NEXT OPTIMIZATIONS (Future)

After reaching 90+:

1. **Implement Service Worker** (offline support)
2. **Add Progressive Web App features**
3. **Optimize database queries**
4. **Implement edge caching**
5. **Add image CDN** (Cloudinary, Imgix)
6. **Implement HTTP/3**
7. **Add resource hints** (preconnect, prefetch)

---

## 📞 NEED HELP?

### Commands:
```bash
npm run perf:optimize      # Analyze performance issues
npm run build              # Build for production
npm start                  # Start production server
```

### Documentation:
- PERFORMANCE-OPTIMIZATION-GUIDE.md (detailed guide)
- PERFORMANCE-ACTION-PLAN.md (this file)

### Resources:
- Next.js Performance: https://nextjs.org/docs/advanced-features/measuring-performance
- Web.dev Performance: https://web.dev/performance/
- Core Web Vitals: https://web.dev/vitals/

---

**Status**: READY TO IMPLEMENT
**Time Required**: 1-2 hours
**Expected Improvement**: +15-20 points
**Target Score**: 90+/100 🎯
