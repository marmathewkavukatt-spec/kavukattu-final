/**
 * List all gallery categories and their items
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAllCategories() {
  try {
    console.log('🔍 Listing all gallery categories...\n');

    const categories = await prisma.galleryCategory.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    if (categories.length === 0) {
      console.log('❌ No categories found');
      return;
    }

    for (const category of categories) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📁 Category: ${category.title}`);
      console.log(`   ID: ${category.id}`);
      console.log(`   Active: ${category.active}`);
      console.log(`   Items: ${category.items.length}`);
      console.log(`   Cover: ${category.coverImage}`);
      
      if (category.items.length > 0) {
        console.log(`\n   📷 Items (showing first 5):`);
        for (const item of category.items.slice(0, 5)) {
          console.log(`   - ${item.title || '(no title)'}`);
          console.log(`     URL: "${item.image}"`);
          console.log(`     Ends with: "${item.image.slice(-10)}"`);
          
          // Check for issues
          const endsWithExtension = /\.(webp|jpg|jpeg|png|gif)$/i.test(item.image);
          const hasExtraChars = /\.(webp|jpg|jpeg|png|gif).+$/i.test(item.image);
          
          if (!endsWithExtension) {
            console.log(`     ⚠️  WARNING: Does not end with valid extension!`);
          }
          if (hasExtraChars) {
            console.log(`     ⚠️  WARNING: Has extra characters after extension!`);
          }
        }
        
        if (category.items.length > 5) {
          console.log(`   ... and ${category.items.length - 5} more items`);
        }
      }
    }

    console.log(`\n${'='.repeat(80)}\n`);
    console.log(`Total categories: ${categories.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

listAllCategories()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
