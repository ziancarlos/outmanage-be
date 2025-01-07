/*
  Warnings:

  - Added the required column `description` to the `permissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `permissions` ADD COLUMN `description` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `shipments` (
    `shipmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentTypeId` INTEGER NOT NULL,
    `status` TINYINT NOT NULL,
    `licensePlate` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `internalNotes` TEXT NULL,

    PRIMARY KEY (`shipmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments_has_items` (
    `shipmentHasItemId` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`shipmentHasItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShipmentLog` (
    `shipmentLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `changeType` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `details` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`shipmentLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_shipmentTypeId_fkey` FOREIGN KEY (`shipmentTypeId`) REFERENCES `shipments_types`(`shipmentTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments_has_items` ADD CONSTRAINT `shipments_has_items_shipmentId_fkey` FOREIGN KEY (`shipmentId`) REFERENCES `shipments`(`shipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentLog` ADD CONSTRAINT `ShipmentLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentLog` ADD CONSTRAINT `ShipmentLog_shipmentId_fkey` FOREIGN KEY (`shipmentId`) REFERENCES `shipments`(`shipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;
