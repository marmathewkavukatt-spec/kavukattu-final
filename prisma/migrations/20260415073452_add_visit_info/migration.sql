-- CreateTable
CREATE TABLE `VisitInfo` (
    `id` VARCHAR(32) NOT NULL,
    `mapEmbedUrl` TEXT NULL,
    `address` TEXT NULL,
    `directions` TEXT NULL,
    `nearbyLandmarks` TEXT NULL,
    `travelGuidance` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
