-- CreateTable
CREATE TABLE `ArchiveDocument` (
    `id` VARCHAR(32) NOT NULL,
    `category` ENUM('PASTORAL_LETTERS', 'CIRCULARS', 'OTHERS') NOT NULL,
    `title` VARCHAR(180) NULL,
    `subtitle` VARCHAR(300) NULL,
    `description` TEXT NULL,
    `fileUrl` VARCHAR(2048) NOT NULL,
    `fileName` VARCHAR(255) NULL,
    `fileType` VARCHAR(120) NULL,
    `fileSize` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ArchiveDocument_category_createdAt_idx`(`category`, `createdAt`),
    INDEX `ArchiveDocument_category_updatedAt_idx`(`category`, `updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
