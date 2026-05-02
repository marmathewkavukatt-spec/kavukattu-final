#!/usr/bin/env node

/**
 * Verify Images Script
 * 
 * Checks that all referenced images in the codebase actually exist
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🖼️  Verifying Image References...\n');

const publicDir = path.join(process.cwd(), 'public');
const uploadsDir = path.join(publicDir, 'uploads');

// Find all image references in the codebase
console.log('1️⃣  Scanning codebase for image references...');

let imageRefs = [];
try {
  // Search for /uploads/ references in source files
  const grepResult = execSync(
    'grep -r "/uploads/" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" || echo ""',
    { encoding: 'utf8', shell: 'bash' }
  );
  
  // Extract image paths
  const matches = grepResult.match(/\/uploads\/[^"'\s)]+/g);
  if (matches) {
    imageRefs = [...new Set(matches)]; // Remove duplicates
    console.log(`   Found ${imageRefs.length} unique image references\n`);
  }
} catch (err) {
  console.log('   ⚠️  Could not scan files (grep not available)\n');
}

// Check if images exist
console.log('2️⃣  Checking if images exist...\n');

const missing = [];
const found = [];

imageRefs.forEach(ref => {
  // Remove leading slash and convert to file path
  const relativePath = ref.startsWith('/') ? ref.slice(1) : ref;
  const filePath = path.join(process.cwd(), 'public', relativePath);
  
  if (fs.existsSync(filePath)) {
    found.push(ref);
    console.log(`   ✅ ${ref}`);
  } else {
    missing.push(ref);
    console.log(`   ❌ ${ref} - NOT FOUND`);
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY\n');

console.log(`✅ Found: ${found.length} images`);
console.log(`❌ Missing: ${missing.length} images\n`);

if (missing.length > 0) {
  console.log('⚠️  MISSING IMAGES:');
  missing.forEach((img, i) => {
    console.log(`   ${i + 1}. ${img}`);
  });
  console.log('\n🔧 RECOMMENDED ACTIONS:');
  console.log('   1. Check if images were uploaded correctly');
  console.log('   2. Verify file names match exactly (case-sensitive)');
  console.log('   3. Ensure images are in public/uploads/ directory');
  console.log('   4. Update code references if file names changed\n');
} else {
  console.log('✅ All referenced images exist!\n');
}

// Check for unused images
console.log('3️⃣  Checking for unused images...\n');

if (fs.existsSync(uploadsDir)) {
  const allImages = [];
  
  function scanDir(dir, baseDir = uploadsDir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath, baseDir);
      } else if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(item)) {
        const relativePath = '/' + path.relative(publicDir, fullPath).replace(/\\/g, '/');
        allImages.push(relativePath);
      }
    });
  }
  
  scanDir(uploadsDir);
  
  const unused = allImages.filter(img => !imageRefs.includes(img));
  
  if (unused.length > 0) {
    console.log(`   ⚠️  Found ${unused.length} unused images:`);
    unused.slice(0, 10).forEach((img, i) => {
      console.log(`   ${i + 1}. ${img}`);
    });
    if (unused.length > 10) {
      console.log(`   ... and ${unused.length - 10} more`);
    }
    console.log('\n   💡 These images may be safe to delete if not used elsewhere\n');
  } else {
    console.log('   ✅ No unused images found\n');
  }
}

console.log('='.repeat(60) + '\n');
