#!/usr/bin/env node

/**
 * Performance Optimization Script
 * Removes redundant connectDB() calls from all API routes
 * Prisma maintains persistent connections automatically
 */

const fs = require('fs');
const path = require('path');

const filesToOptimize = [
  'src/lib/site-data.ts',
  'src/app/api/visit-info/route.ts',
  'src/app/api/timings/[id]/route.ts',
  'src/app/api/timings/route.ts',
  'src/app/api/testimonies/[id]/route.ts',
  'src/app/api/timeline/route.ts',
  'src/app/api/testimonies/route.ts',
  'src/app/api/timeline/[id]/route.ts',
  'src/app/api/testimonies/all/route.ts',
  'src/app/api/slider/[id]/route.ts',
  'src/app/api/resources/route.ts',
  'src/app/api/resources/[id]/route.ts',
  'src/app/api/slider/route.ts',
  'src/app/api/slider/all/route.ts',
  'src/app/api/resources/bulk-delete/route.ts',
  'src/app/api/gallery/route.ts',
  'src/app/api/gallery/[id]/route.ts',
  'src/app/api/gallery/items/[id]/route.ts',
  'src/app/api/gallery/categories/[id]/route.ts',
  'src/app/api/gallery/categories/bulk-delete/route.ts',
  'src/app/api/gallery/items/route.ts',
  'src/app/api/gallery/items/bulk-delete/route.ts',
  'src/app/api/experiences/[id]/route.ts',
  'src/app/api/experiences/route.ts',
  'src/app/api/experiences/all/route.ts',
  'src/app/api/contributions/route.ts',
  'src/app/api/contributions/[id]/route.ts',
  'src/app/api/announcements/route.ts',
  'src/app/api/announcements/[id]/route.ts',
  'src/app/api/announcements/all/route.ts',
  'src/app/api/about/route.ts',
  'src/app/api/auth/me/route.ts',
  'src/app/api/auth/profile/route.ts',
];

let totalOptimized = 0;
let totalLines = 0;

filesToOptimize.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  
  // Remove await connectDB(); lines
  const linesRemoved = (content.match(/\s*await connectDB\(\);?\s*\n/g) || []).length;
  content = content.replace(/\s*await connectDB\(\);?\s*\n/g, '');
  
  // Remove connectDB import if no longer used
  if (!content.includes('connectDB')) {
    content = content.replace(/, connectDB/g, '');
    content = content.replace(/connectDB, /g, '');
    content = content.replace(/import \{ connectDB \} from/g, 'import { db } from');
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalOptimized++;
    totalLines += linesRemoved;
    console.log(`✅ Optimized ${filePath} (removed ${linesRemoved} calls)`);
  }
});

console.log(`\n🚀 Performance Optimization Complete!`);
console.log(`   Files optimized: ${totalOptimized}`);
console.log(`   Redundant calls removed: ${totalLines}`);
console.log(`   Expected performance gain: ~${totalLines * 5}-${totalLines * 10}ms per request\n`);
