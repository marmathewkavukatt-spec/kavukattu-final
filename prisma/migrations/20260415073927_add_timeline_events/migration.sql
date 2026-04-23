-- CreateTable
CREATE TABLE `TimelineEvent` (
    `id` VARCHAR(32) NOT NULL,
    `year` INTEGER NOT NULL,
    `title` VARCHAR(180) NOT NULL,
    `description` VARCHAR(500) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TimelineEvent_active_order_idx`(`active`, `order`),
    INDEX `TimelineEvent_year_idx`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
