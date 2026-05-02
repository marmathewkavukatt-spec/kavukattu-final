# 🚀 Performance Optimization Guide

## Current Score: 74/100 (Improved from 65!)

### Key Issues to Fix:

1. **Image elements missing explicit width/height** (Score: 50/100)
2. **Improve image delivery** (Score: 50/100)
3. **Avoid enormous network payloads** (Score: 50/100)
4. **Reduce unused JavaScript** (Score: 50/100)
5. **Legacy JavaScript** (Score: 50/100)
6. **Cumulative Layout Shift: 0.172** (Should be < 0.1)

---

## ⚡ IMMEDIATE FIXES

### 1. Fix Images Without Width/Height

**Problem**: Images without explicit dimensions cause layout shifts.

**Solution**: Already using Next.js Image component in most places, but some `<img>` tags need fixing.

### 2. Reduce JavaScript Bundle Size

**Problem**: Unused JavaScript and legacy code.

**Solutions**:
- Enable code splitting
- Lazy load components
- Remove unused dependencies
- Use dynamic imports

### 3. Optimize Image Delivery

**Problem**: Large images, not using modern formats efficiently.

**Solutions**:
- Use WebP/AVIF (already configured ✅)
- Implement lazy loading
- Use proper image sizes
- Add blur placeholders

---

## 🔧 CONFIGURATION UPDATES

### Update next.config.mjs

Add these optimizations:

```javascript
// Add to experimental section
experimental: {
  optimizePackageImports: ['framer-motion', 'lucide-react', 'react-dom'],
  serverComponentsExternalPackages: ["pdfkit"],
  optimizeCss: true, // Enable CSS optimization
  scrollRestoration: true,
},

// Add modularizeImports for better tree-shaking
modularizeImports: {
  'lucide-react': {
    transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
  },
},

// Add compiler optimizations
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn'],
  } : false,
},
```

---

## 📦 COMPONENT OPTIMIZATIONS

### 1. Lazy Load Heavy Components

Create `src/components/LazyComponents.tsx`:

```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
export const GalleryLightbox = dynamic(
  () => import('./GalleryLightbox'),
  { 
    loading: () => <div className="animate-pulse bg-stone-200 h-96" />,
    ssr: false // Don't render on server
  }
);

export const VirtualizedGallery = dynamic(
  () => import('./VirtualizedGallery'),
  { 
    loading: () => <div className="animate-pulse bg-stone-200 h-96" />,
  }
);

export const HeroSlider = dynamic(
  () => import('./HeroSlider'),
  { 
    loading: () => <div className="animate-pulse bg-stone-200 h-96" />,
  }
);
```

### 2. Add Image Blur Placeholders

Update Image components to include blur placeholders:

```typescript
<Image
  src={imageSrc}
  alt="Description"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Generate this
  loading="lazy"
  quality={85}
/>
```

### 3. Optimize Framer Motion

Only import what you need:

```typescript
// Instead of:
import { motion } from 'framer-motion';

// Use:
import { m, LazyMotion, domAnimation } from 'framer-motion';

// Wrap your app:
<LazyMotion features={domAnimation}>
  <m.div>...</m.div>
</LazyMotion>
```

---

## 🎨 CSS OPTIMIZATIONS

### 1. Critical CSS Inlining

Add to `src/app/layout.tsx`:

```typescript
export const metadata = {
  // ... existing metadata
  other: {
    'optimize-css': 'true',
  },
};
```

### 2. Remove Unused Tailwind Classes

Update `tailwind.config.ts`:

```typescript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Add purge options
  safelist: [],
  // Enable JIT mode optimizations
  mode: 'jit',
};
```

---

## 📊 FONT OPTIMIZATION

### Update Font Loading Strategy

In `src/app/layout.tsx`:

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
```

---

## 🔄 CACHING STRATEGY

### Update Cache Headers

Already good, but optimize HTML caching:

```javascript
// In next.config.mjs headers()
{
  // HTML pages - Short cache with stale-while-revalidate
  source: '/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=60, stale-while-revalidate=300',
    },
  ],
},
```

---

## 🚀 BUILD OPTIMIZATIONS

### 1. Enable SWC Minification

Already enabled ✅

### 2. Analyze Bundle Size

Add to `package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "analyze:server": "BUNDLE_ANALYZE=server npm run build",
    "analyze:browser": "BUNDLE_ANALYZE=browser npm run build"
  }
}
```

Install analyzer:

```bash
npm install --save-dev @next/bundle-analyzer
```

Update `next.config.mjs`:

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

---

## 📱 MOBILE OPTIMIZATIONS

### 1. Reduce Initial Load

- Defer non-critical JavaScript
- Lazy load images below the fold
- Use intersection observer for animations

### 2. Optimize Touch Interactions

Add to `globals.css`:

```css
/* Improve touch performance */
* {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Optimize scrolling */
html {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
```

---

## 🎯 PRIORITY FIXES (Do These First)

### Priority 1: Fix Layout Shifts (CLS: 0.172 → < 0.1)

1. **Add explicit dimensions to all images**
2. **Reserve space for dynamic content**
3. **Avoid inserting content above existing content**

### Priority 2: Reduce JavaScript (50/100 → 80/100)

1. **Lazy load components**
2. **Use dynamic imports**
3. **Remove unused dependencies**

### Priority 3: Optimize Images (50/100 → 90/100)

1. **Use Next.js Image component everywhere**
2. **Add blur placeholders**
3. **Implement lazy loading**
4. **Use proper image sizes**

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Quick Wins (1-2 hours)
- [ ] Add lazy loading to heavy components
- [ ] Fix images without width/height
- [ ] Enable CSS optimization
- [ ] Add font preloading

### Phase 2: Medium Impact (2-4 hours)
- [ ] Implement blur placeholders
- [ ] Optimize Framer Motion imports
- [ ] Add bundle analyzer
- [ ] Remove unused dependencies

### Phase 3: Advanced (4-8 hours)
- [ ] Implement virtual scrolling for long lists
- [ ] Add service worker for offline support
- [ ] Implement progressive image loading
- [ ] Optimize database queries

---

## 🧪 TESTING

### Test Performance After Each Change

```bash
# Local testing
npm run build
npm start

# Then test with:
# - Lighthouse (Chrome DevTools)
# - PageSpeed Insights
# - WebPageTest
```

### Monitor Metrics

Key metrics to track:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTI** (Time to Interactive): < 3.8s

---

## 🎯 TARGET SCORES

| Metric | Current | Target |
|--------|---------|--------|
| Performance | 74 | 90+ |
| LCP | 3.4s | < 2.5s |
| CLS | 0.172 | < 0.1 |
| Speed Index | 12.7s | < 4s |

---

## 📞 NEXT STEPS

1. **Immediate**: Implement Priority 1 fixes
2. **This Week**: Complete Phase 1 & 2
3. **This Month**: Finish Phase 3
4. **Ongoing**: Monitor and optimize

---

**Expected Result**: Performance score 85-95/100 🎉
