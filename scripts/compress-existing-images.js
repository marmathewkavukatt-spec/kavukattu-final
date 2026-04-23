/**
 * Script to compress existing images in the uploads folder
 * This will help reduce storage space for images uploaded before compression was implemented
 * 
 * Usage: node scripts/compress-existing-images.js
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const BACKUP_DIR = path.join(process.cwd(), 'public', 'uploads-backup');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'];

const COMPRESSION_OPTIONS = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 80,
  format: 'webp',
};

async function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

async function compressImage(inputPath, outputPath) {
  try {
    const stats = await fs.stat(inputPath);
    const originalSize = stats.size;

    let pipeline = sharp(inputPath);
    const metadata = await pipeline.metadata();

    // Resize if needed
    if (
      metadata.width &&
      metadata.height &&
      (metadata.width > COMPRESSION_OPTIONS.maxWidth || metadata.height > COMPRESSION_OPTIONS.maxHeight)
    ) {
      pipeline = pipeline.resize(COMPRESSION_OPTIONS.maxWidth, COMPRESSION_OPTIONS.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Compress to WebP
    await pipeline
      .webp({ quality: COMPRESSION_OPTIONS.quality })
      .toFile(outputPath);

    const newStats = await fs.stat(outputPath);
    const newSize = newStats.size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(2);

    return {
      success: true,
      originalSize,
      newSize,
      savings,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function processDirectory(dirPath, relativePath = '') {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      console.log(`\nProcessing directory: ${relPath}`);
      const subResults = await processDirectory(fullPath, relPath);
      totalOriginalSize += subResults.totalOriginalSize;
      totalNewSize += subResults.totalNewSize;
      processedCount += subResults.processedCount;
      skippedCount += subResults.skippedCount;
      errorCount += subResults.errorCount;
    } else if (await isImageFile(entry.name)) {
      // Skip if already WebP
      if (entry.name.toLowerCase().endsWith('.webp')) {
        console.log(`⏭️  Skipping (already WebP): ${relPath}`);
        skippedCount++;
        continue;
      }

      const outputName = entry.name.replace(/\.[^.]+$/, '.webp');
      const outputPath = path.join(dirPath, outputName);

      // Skip if WebP version already exists
      try {
        await fs.access(outputPath);
        console.log(`⏭️  Skipping (WebP exists): ${relPath}`);
        skippedCount++;
        continue;
      } catch {
        // File doesn't exist, proceed with compression
      }

      console.log(`🔄 Compressing: ${relPath}`);
      const result = await compressImage(fullPath, outputPath);

      if (result.success) {
        totalOriginalSize += result.originalSize;
        totalNewSize += result.newSize;
        processedCount++;
        console.log(
          `✅ Compressed: ${relPath} (${(result.originalSize / 1024).toFixed(2)}KB → ${(result.newSize / 1024).toFixed(2)}KB, saved ${result.savings}%)`
        );

        // Optionally delete original (commented out for safety)
        // await fs.unlink(fullPath);
        // console.log(`   Deleted original: ${relPath}`);
      } else {
        errorCount++;
        console.error(`❌ Error compressing ${relPath}: ${result.error}`);
      }
    }
  }

  return {
    totalOriginalSize,
    totalNewSize,
    processedCount,
    skippedCount,
    errorCount,
  };
}

async function main() {
  console.log('🖼️  Image Compression Script');
  console.log('============================\n');

  try {
    // Check if uploads directory exists
    try {
      await fs.access(UPLOADS_DIR);
    } catch {
      console.error(`❌ Uploads directory not found: ${UPLOADS_DIR}`);
      process.exit(1);
    }

    console.log(`📁 Processing images in: ${UPLOADS_DIR}\n`);
    console.log('⚠️  Note: Original files will be kept. Delete them manually after verifying compressed versions.\n');

    const startTime = Date.now();
    const results = await processDirectory(UPLOADS_DIR);
    const endTime = Date.now();

    console.log('\n============================');
    console.log('📊 Compression Summary');
    console.log('============================');
    console.log(`✅ Processed: ${results.processedCount} images`);
    console.log(`⏭️  Skipped: ${results.skippedCount} images`);
    console.log(`❌ Errors: ${results.errorCount} images`);
    console.log(`📦 Original size: ${(results.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📦 New size: ${(results.totalNewSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (results.totalOriginalSize > 0) {
      const totalSavings = ((results.totalOriginalSize - results.totalNewSize) / results.totalOriginalSize * 100).toFixed(2);
      const savedMB = ((results.totalOriginalSize - results.totalNewSize) / 1024 / 1024).toFixed(2);
      console.log(`💾 Space saved: ${savedMB} MB (${totalSavings}%)`);
    }
    
    console.log(`⏱️  Time taken: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    console.log('\n✨ Done!');
    console.log('\n⚠️  Remember to:');
    console.log('   1. Verify the compressed images look good');
    console.log('   2. Update database references if needed');
    console.log('   3. Delete original files to free up space');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
