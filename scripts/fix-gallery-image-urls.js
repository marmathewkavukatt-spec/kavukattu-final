/**
 * Fix corrupted gallery item image URLs
 * This script removes trailing "1" characters from image URLs that were incorrectly saved
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixGalleryImageUrls() {
  try {
    console.log('🔍 Checking for corrupted gallery item image URLs...\n');

    // Find all gallery items with image URLs ending in a digit followed by file extension
    const allItems = await prisma.galleryItem.findMany({
      select: {
        id: true,
        image: true,
        title: true,
        categoryId: true,
      },
    });

    const corruptedItems = allItems.filter(item => {
      // Check if image URL ends with something like ".webp1", ".jpg1", ".png1", etc.
      return /\.(webp|jpg|jpeg|png|gif)1+$/i.test(item.image);
    });

    if (corruptedItems.length === 0) {
      console.log('✅ No corrupted image URLs found. All gallery items are OK!');
      return;
    }

    console.log(`Found ${corruptedItems.length} corrupted image URL(s):\n`);

    for (const item of corruptedItems) {
      console.log(`  - ID: ${item.id}`);
      console.log(`    Title: ${item.title || '(no title)'}`);
      console.log(`    Current URL: ${item.image}`);
      
      // Remove trailing "1" characters from the URL
      const fixedUrl = item.image.replace(/(\.(webp|jpg|jpeg|png|gif))1+$/i, '$1');
      console.log(`    Fixed URL:   ${fixedUrl}\n`);
    }

    console.log('🔧 Fixing corrupted URLs...\n');

    let fixed = 0;
    for (const item of corruptedItems) {
      const fixedUrl = item.image.replace(/(\.(webp|jpg|jpeg|png|gif))1+$/i, '$1');
      
      await prisma.galleryItem.update({
        where: { id: item.id },
        data: { image: fixedUrl },
      });
      
      fixed++;
      console.log(`✓ Fixed ${fixed}/${corruptedItems.length}: ${item.id}`);
    }

    console.log(`\n✅ Successfully fixed ${fixed} gallery item image URL(s)!`);
    console.log('\n💡 Tip: Refresh your browser to see the fixed images.');

  } catch (error) {
    console.error('❌ Error fixing gallery image URLs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixGalleryImageUrls()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
