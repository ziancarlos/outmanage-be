/*
  Warnings:

  - You are about to drop the `shipments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shipments_has_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shipments_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shipments_types_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `shipmentlog` DROP FOREIGN KEY `ShipmentLog_shipmentId_fkey`;

-- DropForeignKey
ALTER TABLE `shipments` DROP FOREIGN KEY `shipments_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `shipments` DROP FOREIGN KEY `shipments_shipmentTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `shipments_has_items` DROP FOREIGN KEY `shipments_has_items_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `shipments_has_items` DROP FOREIGN KEY `shipments_has_items_shipmentId_fkey`;

-- DropForeignKey
ALTER TABLE `shipments_types_logs` DROP FOREIGN KEY `shipments_types_logs_shipmentTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `shipments_types_logs` DROP FOREIGN KEY `shipments_types_logs_userId_fkey`;

-- DropIndex
DROP INDEX `ShipmentLog_shipmentId_fkey` ON `shipmentlog`;

-- DropTable
DROP TABLE `shipments`;

-- DropTable
DROP TABLE `shipments_has_items`;

-- DropTable
DROP TABLE `shipments_types`;

-- DropTable
DROP TABLE `shipments_types_logs`;

-- CreateTable
CREATE TABLE `delivery_orders` (
    `deliveryOrderId` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `address` TEXT NULL,
    `internalNotes` TEXT NULL,

    PRIMARY KEY (`deliveryOrderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_orders_items` (
    `deliveryOrderItemId` INTEGER NOT NULL AUTO_INCREMENT,
    `deliveryOrderId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    UNIQUE INDEX `delivery_orders_items_deliveryOrderId_itemId_key`(`deliveryOrderId`, `itemId`),
    PRIMARY KEY (`deliveryOrderItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_orders_logs` (
    `deliveryOrderLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `deliveryOrderId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `changeType` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `details` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`deliveryOrderLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fleets` (
    `fleetId` INTEGER NOT NULL AUTO_INCREMENT,
    `model` VARCHAR(100) NOT NULL,
    `licensePlate` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `fleets_licensePlate_key`(`licensePlate`),
    PRIMARY KEY (`fleetId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fleets_logs` (
    `fleetLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `fleetId` INTEGER NOT NULL,
    `changeType` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `oldValue` JSON NULL,
    `newValue` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`fleetLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shipment` (
    `shipmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `internalNotes` TEXT NULL,
    `loadGoodsPicture` VARCHAR(255) NULL,
    `shipmentDeliveryId` INTEGER NULL,
    `shipmentPickupId` INTEGER NULL,

    PRIMARY KEY (`shipmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShipmentPickup` (
    `shipmentPickupId` INTEGER NOT NULL AUTO_INCREMENT,
    `licensePlate` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `ShipmentPickup_licensePlate_key`(`licensePlate`),
    PRIMARY KEY (`shipmentPickupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShipmentDelivery` (
    `shipmentDeliveryId` INTEGER NOT NULL AUTO_INCREMENT,
    `fleetId` INTEGER NOT NULL,

    PRIMARY KEY (`shipmentDeliveryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShipmentDeliveryOrder` (
    `shipmentDeliveryOrderId` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentId` INTEGER NOT NULL,
    `deliveryOrderId` INTEGER NOT NULL,
    `address` TEXT NULL,
    `shipmentDeliveryOrderType` ENUM('RUMAH', 'KANTOR', 'GUDANG', 'EKSPEDISI') NULL,

    PRIMARY KEY (`shipmentDeliveryOrderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShipmentDeliveryOrderItem` (
    `shipmentDeliveryOrderItemId` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentDeliveryOrderId` INTEGER NOT NULL,
    `deliveryOrderItemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`shipmentDeliveryOrderItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `delivery_orders` ADD CONSTRAINT `delivery_orders_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`customerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_orders_items` ADD CONSTRAINT `delivery_orders_items_deliveryOrderId_fkey` FOREIGN KEY (`deliveryOrderId`) REFERENCES `delivery_orders`(`deliveryOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_orders_items` ADD CONSTRAINT `delivery_orders_items_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_orders_logs` ADD CONSTRAINT `delivery_orders_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_orders_logs` ADD CONSTRAINT `delivery_orders_logs_deliveryOrderId_fkey` FOREIGN KEY (`deliveryOrderId`) REFERENCES `delivery_orders`(`deliveryOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fleets_logs` ADD CONSTRAINT `fleets_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipment` ADD CONSTRAINT `Shipment_shipmentDeliveryId_fkey` FOREIGN KEY (`shipmentDeliveryId`) REFERENCES `ShipmentDelivery`(`shipmentDeliveryId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipment` ADD CONSTRAINT `Shipment_shipmentPickupId_fkey` FOREIGN KEY (`shipmentPickupId`) REFERENCES `ShipmentPickup`(`shipmentPickupId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentDelivery` ADD CONSTRAINT `ShipmentDelivery_fleetId_fkey` FOREIGN KEY (`fleetId`) REFERENCES `fleets`(`fleetId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentDeliveryOrder` ADD CONSTRAINT `ShipmentDeliveryOrder_shipmentId_fkey` FOREIGN KEY (`shipmentId`) REFERENCES `Shipment`(`shipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentDeliveryOrder` ADD CONSTRAINT `ShipmentDeliveryOrder_deliveryOrderId_fkey` FOREIGN KEY (`deliveryOrderId`) REFERENCES `delivery_orders`(`deliveryOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentDeliveryOrderItem` ADD CONSTRAINT `ShipmentDeliveryOrderItem_deliveryOrderItemId_fkey` FOREIGN KEY (`deliveryOrderItemId`) REFERENCES `delivery_orders_items`(`deliveryOrderItemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentDeliveryOrderItem` ADD CONSTRAINT `ShipmentDeliveryOrderItem_shipmentDeliveryOrderId_fkey` FOREIGN KEY (`shipmentDeliveryOrderId`) REFERENCES `ShipmentDeliveryOrder`(`shipmentDeliveryOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentLog` ADD CONSTRAINT `ShipmentLog_shipmentId_fkey` FOREIGN KEY (`shipmentId`) REFERENCES `Shipment`(`shipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;
