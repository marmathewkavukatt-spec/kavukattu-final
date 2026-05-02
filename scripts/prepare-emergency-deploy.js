#!/usr/bin/env node

/**
 * Emergency Deployment Preparation Script
 * Prepares your application for immediate deployment to fix 404 errors
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚨 EMERGENCY DEPLOYMENT PREPARATION\n');
console.log('=' .repeat(60));

const steps = [
  {
    name: 'Clean old build',
    action: () => {
      const nextDir = path.join(process.cwd(), '.next');
      if (fs.existsSync(nextDir)) {
        console.log('   Removing old .next folder...');
        fs.rmSync(nextDir, { recursive: true, force: true });
        console.log('   ✅ Old build removed');
      } else {
        console.log('   ℹ️  No old build to remove');
      }
    }
  },
  {
    name: 'Verify dependencies',
    action: () => {
      const nodeModules = path.join(process.cwd(), 'node_modules');
      if (!fs.existsSync(nodeModules)) {
        console.log('   Installing dependencies...');
        execSync('npm install', { stdio: 'inherit' });
        console.log('   ✅ Dependencies installed');
      } else {
        console.log('   ✅ Dependencies already installed');
      }
    }
  },
  {
    name: 'Build application',
    action: () => {
      console.log('   Building Next.js application...');
      console.log('   (This may take a few minutes)');
      try {
        execSync('npm run build', { stdio: 'inherit' });
        console.log('   ✅ Build completed successfully');
      } catch (error) {
        console.error('   ❌ Build failed!');
        throw error;
      }
    }
  },
  {
    name: 'Verify build output',
    action: () => {
      const nextDir = path.join(process.cwd(), '.next');
      const staticDir = path.join(nextDir, 'static');
      const chunksDir = path.join(staticDir, 'chunks');
      
      if (!fs.existsSync(nextDir)) {
        throw new Error('.next folder not created');
      }
      if (!fs.existsSync(staticDir)) {
        throw new Error('.next/static folder not created');
      }
      if (!fs.existsSync(chunksDir)) {
        throw new Error('.next/static/chunks folder not created');
      }
      
      const chunkFiles = fs.readdirSync(chunksDir);
      console.log(`   ✅ Build verified (${chunkFiles.length} chunk files created)`);
    }
  },
  {
    name: 'Create deployment checklist',
    action: () => {
      const checklist = `
DEPLOYMENT CHECKLIST - ${new Date().toISOString()}
${'='.repeat(60)}

✅ Build completed successfully
✅ .next folder is ready for upload

NEXT STEPS:

1. UPLOAD TO SERVER:
   - Go to Hostinger File Manager
   - Navigate to: /domains/marmathewkavukatt.org/public_html
   - DELETE the old .next folder
   - UPLOAD the new .next folder (this folder: ${path.join(process.cwd(), '.next')})
   - Wait for upload to complete (may take 5-10 minutes)

2. RESTART APPLICATION:
   - Go to Hostinger Dashboard
   - Find "Node.js" section
   - Click "Restart Application"

3. TEST:
   - Open https://marmathewkavukatt.org/spiritual-legacy in Incognito mode
   - Check browser console (F12) - should see NO errors
   - Check Network tab - all files should load with 200 status

4. VERIFY:
   - Test other pages (home, about, gallery, etc.)
   - Verify no 404 errors in console
   - Check that CSS and JS are loading properly

${'='.repeat(60)}

FILES TO UPLOAD:
- .next/ (ENTIRE FOLDER - MOST IMPORTANT!)
- src/ (if changed)
- public/ (if changed)
- package.json (if changed)
- next.config.mjs (if changed)

DO NOT UPLOAD:
- node_modules/ (run npm install on server instead)
- .env (set environment variables in Hostinger dashboard)

${'='.repeat(60)}

TROUBLESHOOTING:

If still seeing 404 errors after deployment:
1. Verify .next folder exists on server
2. Check .next/static/chunks/ has files
3. Restart application again
4. Clear browser cache (Ctrl+Shift+R)
5. Test in Incognito mode

${'='.repeat(60)}
`;
      
      const checklistPath = path.join(process.cwd(), 'DEPLOYMENT-CHECKLIST-NOW.txt');
      fs.writeFileSync(checklistPath, checklist);
      console.log(`   ✅ Checklist created: DEPLOYMENT-CHECKLIST-NOW.txt`);
    }
  }
];

// Execute steps
let currentStep = 0;
try {
  for (const step of steps) {
    currentStep++;
    console.log(`\n${currentStep}. ${step.name}...`);
    step.action();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ PREPARATION COMPLETE!\n');
  console.log('📋 Next steps:');
  console.log('   1. Read: DEPLOYMENT-CHECKLIST-NOW.txt');
  console.log('   2. Upload .next folder to Hostinger');
  console.log('   3. Restart Node.js application');
  console.log('   4. Test in browser');
  console.log('\n📖 Detailed instructions: EMERGENCY-FIX-SPIRITUAL-LEGACY.md');
  console.log('\n' + '='.repeat(60) + '\n');
  
} catch (error) {
  console.error('\n❌ PREPARATION FAILED!\n');
  console.error('Error:', error.message);
  console.error('\n🔧 Try running these commands manually:');
  console.error('   1. npm install');
  console.error('   2. npm run build');
  console.error('\n');
  process.exit(1);
}
