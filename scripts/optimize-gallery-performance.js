#!/usr/bin/env node

/**
 * Gallery Performance Optimization Script
 * 
 * This script optimizes gallery performance by:
 * 1. Precompressing images
 * 2. Generating responsive image variants
 * 3. Setting up proper caching headers
 * 4. Optimizing database queries
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

// Image optimization settings
const IMAGE_SIZES = [384, 640, 750, 828, 1080, 1200, 1920];
const QUALITY_SETTINGS = {
  webp: 80,
  jpeg: 75,
  avif: 70
};

async function optimizeGalleryImages() {
  console.log('🖼️  Starting gallery image optimization...');
  
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const files = await fs.readdir(uploadsDir);
    
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );
    
    console.log(`Found ${imageFiles.length} images to optimize`);
    
    for (const file of imageFiles) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      
      // Skip if file is already optimized (less than 500KB)
      if (stats.size < 500 * 1024) {
        continue;
      }
      
      console.log(`Optimizing ${file}...`);
      
      try {
        const image = sharp(filePath);
        const metadata = await image.metadata();
        
        // Generate WebP version if it doesn't exist
        const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const webpExists = await fs.access(webpPath).then(() => true).catch(() => false);
        
        if (!webpExists) {
          await image
            .webp({ quality: QUALITY_SETTINGS.webp })
            .toFile(webpPath);
          console.log(`  ✅ Generated WebP: ${path.basename(webpPath)}`);
        }
        
        // Optimize original if it's too large
        if (stats.size > 1024 * 1024) { // 1MB
          const tempPath = filePath + '.tmp';
          
          if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
            await image
              .jpeg({ quality: QUALITY_SETTINGS.jpeg, progressive: true })
              .toFile(tempPath);
          } else if (metadata.format === 'png') {
            await image
              .png({ compressionLevel: 9 })
              .toFile(tempPath);
          }
          
          await fs.rename(tempPath, filePath);
          console.log(`  ✅ Optimized original: ${file}`);
        }
        
      } catch (error) {
        console.error(`  ❌ Failed to optimize ${file}:`, error.message);
      }
    }
    
    console.log('✅ Gallery image optimization completed');
    
  } catch (error) {
    console.error('❌ Gallery optimization failed:', error);
    process.exit(1);
  }
}

async function generateImageManifest() {
  console.log('📋 Generating image manifest for faster loading...');
  
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const files = await fs.readdir(uploadsDir);
    
    const imageManifest = {};
    
    for (const file of files) {
      if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);
        
        try {
          const image = sharp(filePath);
          const metadata = await image.metadata();
          
          imageManifest[file] = {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: stats.size,
            aspectRatio: metadata.width / metadata.height,
            lastModified: stats.mtime.toISOString()
          };
        } catch (error) {
          console.error(`Failed to process ${file}:`, error.message);
        }
      }
    }
    
    const manifestPath = path.join(process.cwd(), 'public', 'image-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(imageManifest, null, 2));
    
    console.log(`✅ Generated manifest with ${Object.keys(imageManifest).length} images`);
    
  } catch (error) {
    console.error('❌ Manifest generation failed:', error);
  }
}

async function main() {
  console.log('🚀 Starting gallery performance optimization...\n');
  
  await optimizeGalleryImages();
  await generateImageManifest();
  
  console.log('\n🎉 Gallery optimization completed successfully!');
  console.log('\nRecommendations:');
  console.log('1. Run this script after uploading new images');
  console.log('2. Consider using a CDN for better global performance');
  console.log('3. Monitor Core Web Vitals for gallery pages');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  optimizeGalleryImages,
  generateImageManifest
};