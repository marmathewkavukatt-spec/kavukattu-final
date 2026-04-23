/*
  Warnings:

  - Added the required column `category` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `announcement` ADD COLUMN `category` VARCHAR(50) NOT NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `subtitle` VARCHAR(300) NULL;

-- CreateIndex
CREATE INDEX `Announcement_category_idx` ON `Announcement`(`category`);

-- CreateIndex
CREATE INDEX `Announcement_active_category_date_idx` ON `Announcement`(`active`, `category`, `date`);
