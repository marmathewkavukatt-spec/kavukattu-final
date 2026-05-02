#!/usr/bin/env node

/**
 * Deployment Diagnostic Script
 * Checks if your local build is ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 DEPLOYMENT DIAGNOSTIC TOOL\n');
console.log('=' .repeat(60));

let hasErrors = false;
let hasWarnings = false;

// Check 1: .next folder exists
console.log('\n1. Checking .next folder...');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('   ✅ .next folder exists');
  
  // Check subdirectories
  const staticDir = path.join(nextDir, 'static');
  const chunksDir = path.join(staticDir, 'chunks');
  const cssDir = path.join(staticDir, 'css');
  
  if (fs.existsSync(staticDir)) {
    console.log('   ✅ .next/static exists');
  } else {
    console.log('   ❌ .next/static is MISSING');
    hasErrors = true;
  }
  
  if (fs.existsSync(chunksDir)) {
    const chunkFiles = fs.readdirSync(chunksDir);
    console.log(`   ✅ .next/static/chunks exists (${chunkFiles.length} files)`);
  } else {
    console.log('   ❌ .next/static/chunks is MISSING');
    hasErrors = true;
  }
  
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    console.log(`   ✅ .next/static/css exists (${cssFiles.length} files)`);
  } else {
    console.log('   ⚠️  .next/static/css is MISSING (might be okay if no CSS)');
    hasWarnings = true;
  }
} else {
  console.log('   ❌ .next folder does NOT exist');
  console.log('   ⚠️  You need to run: npm run build');
  hasErrors = true;
}

// Check 2: Build ID
console.log('\n2. Checking build ID...');
const buildIdFile = path.join(nextDir, 'BUILD_ID');
if (fs.existsSync(buildIdFile)) {
  const buildId = fs.readFileSync(buildIdFile, 'utf8').trim();
  console.log(`   ✅ Build ID: ${buildId}`);
} else {
  console.log('   ❌ BUILD_ID file is MISSING');
  hasErrors = true;
}

// Check 3: Package.json
console.log('\n3. Checking package.json...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('   ✅ package.json exists');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('   ✅ Build script exists');
  } else {
    console.log('   ❌ Build script is MISSING');
    hasErrors = true;
  }
  
  if (packageJson.scripts && packageJson.scripts.start) {
    console.log('   ✅ Start script exists');
  } else {
    console.log('   ❌ Start script is MISSING');
    hasErrors = true;
  }
} else {
  console.log('   ❌ package.json is MISSING');
  hasErrors = true;
}

// Check 4: Next.js config
console.log('\n4. Checking Next.js config...');
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  console.log('   ✅ next.config.mjs exists');
} else {
  console.log('   ⚠️  next.config.mjs not found (might be okay)');
  hasWarnings = true;
}

// Check 5: Public folder
console.log('\n5. Checking public folder...');
const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  console.log('   ✅ public folder exists');
} else {
  console.log('   ⚠️  public folder not found');
  hasWarnings = true;
}

// Check 6: Node modules
console.log('\n6. Checking node_modules...');
const nodeModulesDir = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesDir)) {
  console.log('   ✅ node_modules exists');
} else {
  console.log('   ❌ node_modules is MISSING');
  console.log('   ⚠️  You need to run: npm install');
  hasErrors = true;
}

// Check 7: .gitignore
console.log('\n7. Checking .gitignore...');
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignore.includes('.next')) {
    console.log('   ⚠️  .next is in .gitignore');
    console.log('   ℹ️  You must manually upload .next folder to server');
    hasWarnings = true;
  } else {
    console.log('   ✅ .next is NOT in .gitignore');
  }
} else {
  console.log('   ⚠️  .gitignore not found');
  hasWarnings = true;
}

// Check 8: Estimate .next folder size
console.log('\n8. Checking .next folder size...');
if (fs.existsSync(nextDir)) {
  try {
    const getDirectorySize = (dirPath) => {
      let size = 0;
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          size += getDirectorySize(filePath);
        } else {
          size += stats.size;
        }
      }
      
      return size;
    };
    
    const size = getDirectorySize(nextDir);
    const sizeMB = (size / (1024 * 1024)).toFixed(2);
    console.log(`   ℹ️  .next folder size: ${sizeMB} MB`);
    
    if (size < 1024 * 1024) {
      console.log('   ⚠️  .next folder seems too small (< 1 MB)');
      console.log('   ⚠️  Build might be incomplete');
      hasWarnings = true;
    }
  } catch (error) {
    console.log('   ⚠️  Could not calculate size');
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 DIAGNOSTIC SUMMARY\n');

if (hasErrors) {
  console.log('❌ ERRORS FOUND - Cannot deploy yet!');
  console.log('\n🔧 REQUIRED ACTIONS:');
  console.log('   1. Run: npm install');
  console.log('   2. Run: npm run build');
  console.log('   3. Verify .next folder is created');
  console.log('   4. Run this diagnostic again');
} else if (hasWarnings) {
  console.log('⚠️  WARNINGS FOUND - Review before deploying');
  console.log('\n✅ You can proceed with deployment, but:');
  console.log('   - Make sure to upload .next folder manually');
  console.log('   - Verify all files are uploaded completely');
} else {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\n🚀 READY TO DEPLOY:');
  console.log('   1. Upload .next folder to server');
  console.log('   2. Upload all other project files');
  console.log('   3. Run: npm install (on server)');
  console.log('   4. Restart Node.js application');
}

console.log('\n' + '='.repeat(60));
console.log('\n📖 For detailed deployment instructions, see:');
console.log('   - EMERGENCY-FIX-SPIRITUAL-LEGACY.md');
console.log('   - HOSTINGER-DEPLOYMENT-FIX.md');
console.log('\n');

process.exit(hasErrors ? 1 : 0);
