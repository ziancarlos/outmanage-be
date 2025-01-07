/*
  Warnings:

  - Added the required column `itemId` to the `shipments_has_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `shipments` MODIFY `status` ENUM('UNPROCESSED', 'PROCESSED', 'COMPLETED') NOT NULL DEFAULT 'UNPROCESSED';

-- AlterTable
ALTER TABLE `shipments_has_items` ADD COLUMN `itemId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `shipments_has_items` ADD CONSTRAINT `shipments_has_items_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;
