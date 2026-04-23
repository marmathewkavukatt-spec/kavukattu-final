-- CreateTable
CREATE TABLE `Administrator` (
    `id` VARCHAR(32) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `designation` VARCHAR(180) NOT NULL,
    `image` VARCHAR(2048) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Administrator_active_order_idx`(`active`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
