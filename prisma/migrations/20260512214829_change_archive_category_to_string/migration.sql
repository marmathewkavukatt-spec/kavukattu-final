-- AlterTable: Change category from ENUM to VARCHAR
-- First, convert existing enum values to their string equivalents
ALTER TABLE `archivedocument` MODIFY `category` VARCHAR(100) NOT NULL;

-- Update existing data to use readable format (optional, keeps existing enum values)
-- If you want to convert PASTORAL_LETTERS to "Pastoral letters", uncomment below:
-- UPDATE `archivedocument` SET `category` = 'Pastoral letters' WHERE `category` = 'PASTORAL_LETTERS';
-- UPDATE `archivedocument` SET `category` = 'Circulars' WHERE `category` = 'CIRCULARS';
-- UPDATE `archivedocument` SET `category` = 'Others' WHERE `category` = 'OTHERS';
