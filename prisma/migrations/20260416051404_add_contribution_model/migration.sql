/*
  Warnings:

  - You are about to drop the `administrator` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `administrator`;

-- CreateTable
CREATE TABLE `Contribution` (
    `id` VARCHAR(32) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `address` VARCHAR(500) NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Contribution_type_status_createdAt_idx`(`type`, `status`, `createdAt`),
    INDEX `Contribution_status_idx`(`status`),
    INDEX `Contribution_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
