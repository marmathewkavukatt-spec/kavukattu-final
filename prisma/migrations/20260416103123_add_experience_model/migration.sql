-- CreateTable
CREATE TABLE `Experience` (
    `id` VARCHAR(32) NOT NULL,
    `authorName` VARCHAR(120) NOT NULL,
    `content` TEXT NOT NULL,
    `authorImage` VARCHAR(2048) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Experience_active_order_idx`(`active`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
