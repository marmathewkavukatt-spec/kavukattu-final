#!/usr/bin/env node

/**
 * Performance Optimization Script
 * Analyzes and provides recommendations for improving site performance
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 PERFORMANCE OPTIMIZATION ANALYZER\n');
console.log('=' .repeat(60));

const issues = [];
const recommendations = [];

// Check 1: Analyze Image Usage
console.log('\n1. Analyzing image usage...');
const srcDir = path.join(process.cwd(), 'src');

function findFiles(dir, ext, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findFiles(fullPath, ext, files);
    } else if (item.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

const tsxFiles = findFiles(srcDir, '.tsx');
let imgTagCount = 0;
let imageComponentCount = 0;
let imagesWithoutDimensions = 0;

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Count <img> tags
  const imgMatches = content.match(/<img[^>]*>/g) || [];
  imgTagCount += imgMatches.length;
  
  // Count <Image> components
  const imageMatches = content.match(/<Image[^>]*>/g) || [];
  imageComponentCount += imageMatches.length;
  
  // Check for images without width/height
  for (const match of [...imgMatches, ...imageMatches]) {
    if (!match.includes('width=') || !match.includes('height=')) {
      if (!match.includes('fill')) {
        imagesWithoutDimensions++;
      }
    }
  }
}

console.log(`   Found ${imgTagCount} <img> tags`);
console.log(`   Found ${imageComponentCount} <Image> components`);
console.log(`   Found ${imagesWithoutDimensions} images without explicit dimensions`);

if (imgTagCount > 0) {
  issues.push(`${imgTagCount} <img> tags should be replaced with Next.js <Image> component`);
  recommendations.push('Replace <img> tags with <Image> from next/image for automatic optimization');
}

if (imagesWithoutDimensions > 0) {
  issues.push(`${imagesWithoutDimensions} images missing width/height (causes layout shift)`);
  recommendations.push('Add explicit width and height to all images to prevent CLS');
}

// Check 2: Analyze Component Imports
console.log('\n2. Analyzing component imports...');
let heavyImports = 0;
let dynamicImports = 0;

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for heavy component imports
  if (content.includes("import { motion }") || content.includes("import { m }")) {
    heavyImports++;
  }
  
  // Check for dynamic imports
  if (content.includes('dynamic(')) {
    dynamicImports++;
  }
}

console.log(`   Found ${heavyImports} files using Framer Motion`);
console.log(`   Found ${dynamicImports} files using dynamic imports`);

if (heavyImports > 5 && dynamicImports < 5) {
  issues.push('Heavy components not using lazy loading');
  recommendations.push('Use dynamic imports for heavy components (Framer Motion, galleries, etc.)');
}

// Check 3: Analyze Bundle Size
console.log('\n3. Checking build configuration...');
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  const hasOptimizeCss = nextConfig.includes('optimizeCss');
  const hasModularizeImports = nextConfig.includes('modularizeImports');
  const hasRemoveConsole = nextConfig.includes('removeConsole');
  
  console.log(`   CSS optimization: ${hasOptimizeCss ? '✅' : '❌'}`);
  console.log(`   Modular imports: ${hasModularizeImports ? '✅' : '❌'}`);
  console.log(`   Console removal: ${hasRemoveConsole ? '✅' : '❌'}`);
  
  if (!hasOptimizeCss) {
    issues.push('CSS optimization not enabled');
    recommendations.push('Enable optimizeCss in next.config.mjs experimental options');
  }
  
  if (!hasModularizeImports) {
    issues.push('Modular imports not configured');
    recommendations.push('Add modularizeImports for better tree-shaking');
  }
  
  if (!hasRemoveConsole) {
    issues.push('Console statements not removed in production');
    recommendations.push('Add compiler.removeConsole to remove console logs in production');
  }
}

// Check 4: Analyze Font Loading
console.log('\n4. Checking font configuration...');
const layoutPath = path.join(srcDir, 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layout = fs.readFileSync(layoutPath, 'utf8');
  
  const hasPreload = layout.includes('preload: true');
  const hasAdjustFontFallback = layout.includes('adjustFontFallback');
  
  console.log(`   Font preload: ${hasPreload ? '✅' : '❌'}`);
  console.log(`   Font fallback adjustment: ${hasAdjustFontFallback ? '✅' : '❌'}`);
  
  if (!hasPreload) {
    recommendations.push('Add preload: true to font configurations');
  }
  
  if (!hasAdjustFontFallback) {
    recommendations.push('Add adjustFontFallback: true to reduce layout shift');
  }
}

// Check 5: Analyze CSS
console.log('\n5. Checking CSS optimization...');
const globalsCssPath = path.join(srcDir, 'app', 'globals.css');
if (fs.existsSync(globalsCssPath)) {
  const css = fs.readFileSync(globalsCssPath, 'utf8');
  const cssSize = Buffer.byteLength(css, 'utf8');
  
  console.log(`   Global CSS size: ${(cssSize / 1024).toFixed(2)} KB`);
  
  if (cssSize > 50000) {
    issues.push('Large global CSS file');
    recommendations.push('Consider splitting CSS or using CSS modules');
  }
}

// Check 6: Package.json dependencies
console.log('\n6. Analyzing dependencies...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = Object.keys(packageJson.dependencies || {});
  
  console.log(`   Total dependencies: ${deps.length}`);
  
  // Check for heavy dependencies
  const heavyDeps = ['moment', 'lodash', 'jquery'];
  const foundHeavy = deps.filter(d => heavyDeps.includes(d));
  
  if (foundHeavy.length > 0) {
    issues.push(`Heavy dependencies found: ${foundHeavy.join(', ')}`);
    recommendations.push('Replace heavy dependencies with lighter alternatives');
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 ANALYSIS SUMMARY\n');

if (issues.length === 0) {
  console.log('✅ No major issues found!');
  console.log('Your site is well-optimized.');
} else {
  console.log(`⚠️  Found ${issues.length} issue(s):\n`);
  issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
}

if (recommendations.length > 0) {
  console.log('\n💡 RECOMMENDATIONS:\n');
  recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('\n📚 NEXT STEPS:\n');
console.log('1. Read: PERFORMANCE-OPTIMIZATION-GUIDE.md');
console.log('2. Implement Priority 1 fixes (layout shifts)');
console.log('3. Add lazy loading for heavy components');
console.log('4. Test with: npm run build && npm start');
console.log('5. Measure with: Lighthouse or PageSpeed Insights');
console.log('\n🎯 Target: Performance score 90+\n');

console.log('=' .repeat(60) + '\n');
