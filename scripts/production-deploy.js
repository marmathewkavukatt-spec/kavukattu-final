#!/usr/bin/env node

/**
 * Production Deployment Script
 * 
 * Ensures the application is production-ready before deployment.
 * Prevents chunk loading errors and other production issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Production Deployment Pre-Check\n');
console.log('='.repeat(60));

let hasErrors = false;
let hasWarnings = false;

// Helper function to run commands
function runCommand(command, description) {
  try {
    console.log(`\n📋 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} - Success`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Failed`);
    hasErrors = true;
    return false;
  }
}

// Helper function to check file exists
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}`);
    return true;
  } else {
    console.log(`❌ ${description} - NOT FOUND`);
    hasErrors = true;
    return false;
  }
}

console.log('\n1️⃣  ENVIRONMENT CHECK');
console.log('-'.repeat(60));

// Check Node version
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.log('❌ Could not determine Node.js version');
  hasErrors = true;
}

// Check for required files
console.log('\n2️⃣  REQUIRED FILES CHECK');
console.log('-'.repeat(60));

checkFile('package.json', 'package.json exists');
checkFile('next.config.mjs', 'next.config.mjs exists');
checkFile('.env', '.env file exists');
checkFile('prisma/schema.prisma', 'Prisma schema exists');

// Check for critical components
console.log('\n3️⃣  CRITICAL COMPONENTS CHECK');
console.log('-'.repeat(60));

checkFile('src/components/ChunkErrorHandler.tsx', 'ChunkErrorHandler component');
checkFile('src/components/ServiceWorkerManager.tsx', 'ServiceWorkerManager component');
checkFile('src/components/ProductionErrorBoundary.tsx', 'ProductionErrorBoundary component');

// Check Next.js config for production settings
console.log('\n4️⃣  NEXT.JS CONFIGURATION CHECK');
console.log('-'.repeat(60));

try {
  const configContent = fs.readFileSync('next.config.mjs', 'utf8');
  
  if (configContent.includes('generateBuildId')) {
    console.log('✅ Build ID generation configured');
  } else {
    console.log('⚠️  Build ID generation not found');
    hasWarnings = true;
  }
  
  if (configContent.includes('no-cache') || configContent.includes('must-revalidate')) {
    console.log('✅ Cache headers configured');
  } else {
    console.log('⚠️  Cache headers might not be optimal');
    hasWarnings = true;
  }
  
  if (configContent.includes('productionBrowserSourceMaps: false')) {
    console.log('✅ Source maps disabled for production');
  } else {
    console.log('⚠️  Source maps might be enabled');
    hasWarnings = true;
  }
} catch (error) {
  console.log('❌ Could not read next.config.mjs');
  hasErrors = true;
}

// Clean old builds
console.log('\n5️⃣  CLEANING OLD BUILDS');
console.log('-'.repeat(60));

const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ Removed old .next directory');
  } catch (error) {
    console.log('⚠️  Could not remove .next directory');
    hasWarnings = true;
  }
} else {
  console.log('✅ No old .next directory to clean');
}

// Clear node_modules cache
const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  try {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('✅ Cleared node_modules cache');
  } catch (error) {
    console.log('⚠️  Could not clear node_modules cache');
    hasWarnings = true;
  }
} else {
  console.log('✅ No cache to clear');
}

// Install dependencies
console.log('\n6️⃣  DEPENDENCIES');
console.log('-'.repeat(60));

if (!runCommand('npm ci --production=false', 'Installing dependencies')) {
  console.log('⚠️  Falling back to npm install...');
  runCommand('npm install', 'Installing dependencies (fallback)');
}

// Generate Prisma client
console.log('\n7️⃣  DATABASE');
console.log('-'.repeat(60));

runCommand('npx prisma generate', 'Generating Prisma client');

// Run build
console.log('\n8️⃣  BUILDING APPLICATION');
console.log('-'.repeat(60));

if (!runCommand('npm run build', 'Building Next.js application')) {
  console.log('\n❌ BUILD FAILED - Cannot proceed with deployment');
  process.exit(1);
}

// Verify build output
console.log('\n9️⃣  VERIFYING BUILD OUTPUT');
console.log('-'.repeat(60));

checkFile('.next/BUILD_ID', 'Build ID file');
checkFile('.next/build-manifest.json', 'Build manifest');

const staticDir = path.join(process.cwd(), '.next', 'static');
if (fs.existsSync(staticDir)) {
  const staticFiles = fs.readdirSync(staticDir);
  console.log(`✅ Static directory contains ${staticFiles.length} items`);
} else {
  console.log('❌ Static directory not found');
  hasErrors = true;
}

// Check public directory
console.log('\n🔟 PUBLIC ASSETS CHECK');
console.log('-'.repeat(60));

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (fs.existsSync(uploadsDir)) {
  console.log('✅ Public uploads directory exists');
} else {
  console.log('⚠️  Public uploads directory not found');
  hasWarnings = true;
}

// Final summary
console.log('\n' + '='.repeat(60));
console.log('📊 DEPLOYMENT READINESS SUMMARY');
console.log('='.repeat(60));

if (hasErrors) {
  console.log('\n❌ DEPLOYMENT BLOCKED - Critical errors found');
  console.log('\nPlease fix the errors above before deploying.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n⚠️  DEPLOYMENT READY WITH WARNINGS');
  console.log('\nWarnings detected but deployment can proceed.');
  console.log('Review warnings above and fix if necessary.\n');
} else {
  console.log('\n✅ DEPLOYMENT READY - All checks passed!');
  console.log('\nYour application is ready for production deployment.\n');
}

// Deployment instructions
console.log('📋 NEXT STEPS:');
console.log('1. Review the build output above');
console.log('2. Test the build locally: npm start');
console.log('3. Deploy to your hosting platform');
console.log('4. Clear CDN cache after deployment');
console.log('5. Test on mobile devices after deployment');
console.log('6. Monitor logs for any errors\n');

// Build info
try {
  const buildId = fs.readFileSync('.next/BUILD_ID', 'utf8').trim();
  console.log(`🏷️  Build ID: ${buildId}`);
  console.log(`📅 Build Date: ${new Date().toISOString()}\n`);
} catch (error) {
  // Ignore if BUILD_ID not found
}

console.log('='.repeat(60));
