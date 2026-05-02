#!/usr/bin/env node

/**
 * Prepare Hostinger Deployment Package
 * 
 * Creates a deployment-ready package for Hostinger
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Preparing Hostinger Deployment Package\n');

// Step 1: Clean old build
console.log('🧹 Step 1: Cleaning old build...');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('✅ Old build removed\n');
}

// Step 2: Build
console.log('🔨 Step 2: Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 3: Verify build
console.log('🔍 Step 3: Verifying build...');
if (!fs.existsSync(nextDir)) {
  console.error('❌ .next directory not found!');
  process.exit(1);
}

const staticDir = path.join(nextDir, 'static');
if (!fs.existsSync(staticDir)) {
  console.error('❌ .next/static directory not found!');
  process.exit(1);
}

const chunksDir = path.join(staticDir, 'chunks');
if (!fs.existsSync(chunksDir)) {
  console.error('❌ .next/static/chunks directory not found!');
  process.exit(1);
}

console.log('✅ Build verified\n');

// Step 4: Check file sizes
console.log('📊 Step 4: Build statistics...');
const getDirectorySize = (dir) => {
  let size = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += fs.statSync(filePath).size;
    }
  }
  
  return size;
};

const nextSize = getDirectorySize(nextDir);
const nextSizeMB = (nextSize / 1024 / 1024).toFixed(2);

console.log(`   .next directory size: ${nextSizeMB} MB`);
console.log(`   Files to upload: .next, src, public, package.json, next.config.mjs, prisma\n`);

// Step 5: Create deployment instructions
console.log('📋 Step 5: Deployment Instructions\n');
console.log('═══════════════════════════════════════════════════════════════');
console.log('HOSTINGER DEPLOYMENT STEPS:');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('METHOD 1: File Manager Upload (RECOMMENDED FOR QUICK FIX)\n');
console.log('1. Login to Hostinger Dashboard');
console.log('2. Go to File Manager');
console.log('3. Navigate to your project directory');
console.log('   (usually /domains/marmathewkavukatt.org/public_html)');
console.log('4. DELETE the old .next folder');
console.log('5. UPLOAD the new .next folder from your local machine');
console.log('   Location: ' + nextDir);
console.log('6. Wait for upload to complete (may take 5-10 minutes)');
console.log('7. Go to Hostinger Dashboard → Node.js → Restart Application');
console.log('8. Test your site\n');

console.log('METHOD 2: GitHub Deployment\n');
console.log('1. Commit and push your code to GitHub');
console.log('2. Ensure GitHub Actions workflow builds the project');
console.log('3. Ensure .next folder is deployed to server');
console.log('4. Restart application on Hostinger\n');

console.log('METHOD 3: SSH Deployment\n');
console.log('1. SSH into your server');
console.log('2. cd /domains/marmathewkavukatt.org/public_html');
console.log('3. git pull origin main');
console.log('4. npm install');
console.log('5. npm run build');
console.log('6. pm2 restart all\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('VERIFICATION:');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('After deployment, verify:');
console.log('1. .next folder exists on server');
console.log('2. .next/static/chunks/ has files');
console.log('3. Open site in browser');
console.log('4. Check DevTools Console (F12) - no 404 errors');
console.log('5. Navigate to different pages - all should work\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('TROUBLESHOOTING:');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('If you still see 404 errors:');
console.log('1. Verify .next folder is on server');
console.log('2. Check file permissions: chmod -R 755 .next');
console.log('3. Verify correct directory');
console.log('4. Check Hostinger Node.js settings');
console.log('5. Check server logs for errors\n');

console.log('✨ Build is ready for deployment!');
console.log('📁 Upload the .next folder to Hostinger now.\n');
