/**
 * Inspect gallery data to find the issue
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function inspectGalleryData() {
  try {
    console.log('🔍 Inspecting gallery data...\n');

    // Get the category from the URL in the screenshot
    const categoryId = 'cmnzktg6j00029m581ribux6o';
    
    const category = await prisma.galleryCategory.findUnique({
      where: { id: categoryId },
      include: {
        items: {
          orderBy: { order: 'asc' },
          take: 10, // Just show first 10
        },
      },
    });

    if (!category) {
      console.log('❌ Category not found');
      return;
    }

    console.log(`📁 Category: ${category.title}`);
    console.log(`   ID: ${category.id}`);
    console.log(`   Items: ${category.items.length}\n`);

    console.log('📷 Gallery Items:');
    console.log('─'.repeat(80));
    
    for (const item of category.items) {
      console.log(`\nID: ${item.id}`);
      console.log(`Title: ${item.title || '(no title)'}`);
      console.log(`Image URL: "${item.image}"`);
      console.log(`Image URL length: ${item.image.length}`);
      console.log(`Image URL (hex): ${Buffer.from(item.image).toString('hex')}`);
      console.log(`Order: ${item.order}`);
      
      // Check for any unusual characters
      const hasTrailingDigit = /\d$/.test(item.image);
      const hasTrailingOne = /1$/.test(item.image);
      const endsWithExtension = /\.(webp|jpg|jpeg|png|gif)$/i.test(item.image);
      
      console.log(`Ends with digit: ${hasTrailingDigit}`);
      console.log(`Ends with "1": ${hasTrailingOne}`);
      console.log(`Ends with valid extension: ${endsWithExtension}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

inspectGalleryData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
