-- DropForeignKey
ALTER TABLE `galleryitem` DROP FOREIGN KEY `GalleryItem_categoryId_fkey`;

-- CreateIndex
CREATE INDEX `About_updatedAt_idx` ON `About`(`updatedAt`);

-- CreateIndex
CREATE INDEX `VisitInfo_updatedAt_idx` ON `VisitInfo`(`updatedAt`);
