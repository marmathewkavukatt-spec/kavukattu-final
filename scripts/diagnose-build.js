#!/usr/bin/env node

/**
 * Diagnose Build Issues Script
 * 
 * This script checks for common build and deployment issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing Build Issues...\n');

const issues = [];
const warnings = [];

// Check 1: .next directory exists
console.log('1️⃣  Checking .next directory...');
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  issues.push('.next directory does not exist - build has not been run');
} else {
  console.log('   ✅ .next directory exists');
  
  // Check for static directory
  const staticDir = path.join(nextDir, 'static');
  if (!fs.existsSync(staticDir)) {
    issues.push('.next/static directory missing - incomplete build');
  } else {
    console.log('   ✅ .next/static directory exists');
  }
  
  // Check for build manifest
  const buildManifest = path.join(nextDir, 'build-manifest.json');
  if (!fs.existsSync(buildManifest)) {
    issues.push('build-manifest.json missing - incomplete build');
  } else {
    console.log('   ✅ build-manifest.json exists');
  }
}

// Check 2: Public uploads directory
console.log('\n2️⃣  Checking public/uploads directory...');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  issues.push('public/uploads directory does not exist');
} else {
  console.log('   ✅ public/uploads directory exists');
  
  // Check for required images
  const requiredImages = [
    'mar-mathew-kavukatt-church-logo.jpg',
    'mar-mathew-kavukatt-first-archbishop-changanacherry.png',
  ];
  
  requiredImages.forEach(img => {
    const imgPath = path.join(uploadsDir, img);
    if (!fs.existsSync(imgPath)) {
      warnings.push(`Missing image: ${img}`);
    } else {
      console.log(`   ✅ ${img} exists`);
    }
  });
}

// Check 3: Environment variables
console.log('\n3️⃣  Checking environment variables...');
const envFile = path.join(process.cwd(), '.env');
if (!fs.existsSync(envFile)) {
  warnings.push('.env file does not exist');
} else {
  console.log('   ✅ .env file exists');
}

// Check 4: Node modules
console.log('\n4️⃣  Checking node_modules...');
const nodeModules = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModules)) {
  issues.push('node_modules directory does not exist - run npm install');
} else {
  console.log('   ✅ node_modules directory exists');
}

// Check 5: Package.json
console.log('\n5️⃣  Checking package.json...');
const packageJson = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJson)) {
  issues.push('package.json does not exist');
} else {
  console.log('   ✅ package.json exists');
  
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    if (!pkg.dependencies || !pkg.dependencies.next) {
      issues.push('Next.js not found in dependencies');
    } else {
      console.log(`   ✅ Next.js version: ${pkg.dependencies.next}`);
    }
  } catch (err) {
    issues.push('Failed to parse package.json');
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 DIAGNOSIS SUMMARY\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ No issues found!\n');
  console.log('If you\'re still experiencing errors:');
  console.log('1. Run: npm run fix:chunks (to clear caches)');
  console.log('2. Rebuild: npm run build');
  console.log('3. Clear browser cache on mobile devices');
} else {
  if (issues.length > 0) {
    console.log('❌ CRITICAL ISSUES:');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`);
    });
    console.log('');
  }
  
  console.log('🔧 RECOMMENDED ACTIONS:');
  if (issues.some(i => i.includes('node_modules'))) {
    console.log('   1. Run: npm install');
  }
  if (issues.some(i => i.includes('.next'))) {
    console.log('   2. Run: npm run build');
  }
  console.log('   3. Run: npm run fix:chunks');
  console.log('   4. Clear browser cache on mobile');
}

console.log('='.repeat(50) + '\n');
