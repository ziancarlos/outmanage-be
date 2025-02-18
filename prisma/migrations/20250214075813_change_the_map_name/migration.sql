/*
  Warnings:

  - You are about to drop the `shipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shipmentdelivery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shipmentdeliveryorder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shipmentdeliveryorderitem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shipmentpickup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `shipment` DROP FOREIGN KEY `Shipment_shipmentDeliveryId_fkey`;

-- DropForeignKey
ALTER TABLE `shipment` DROP FOREIGN KEY `Shipment_shipmentPickupId_fkey`;

-- DropForeignKey
ALTER TABLE `shipmentdelivery` DROP FOREIGN KEY `ShipmentDelivery_fleetId_fkey`;

-- DropForeignKey
ALTER TABLE `shipmentdeliveryorder` DROP FOREIGN KEY `ShipmentDeliveryOrder_deliveryOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `shipmentdeliveryorder` DROP FOREIGN KEY `ShipmentDeliveryOrder_shipmentId_fkey`;

-- DropForeignKey
ALTER TABLE `shipmentdeliveryorderitem` DROP FOREIGN KEY `ShipmentDeliveryOrderItem_deliveryOrderItemId_fkey`;

-- DropForeignKey
ALTER TABLE `shipmentdeliveryorderitem` DROP FOREIGN KEY `ShipmentDeliveryOrderItem_shipmentDeliveryOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `shipmentlog` DROP FOREIGN KEY `ShipmentLog_shipmentId_fkey`;

-- DropIndex
DROP INDEX `ShipmentLog_shipmentId_fkey` ON `shipmentlog`;

-- AlterTable
ALTER TABLE `delivery_orders` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `shipment`;

-- DropTable
DROP TABLE `shipmentdelivery`;

-- DropTable
DROP TABLE `shipmentdeliveryorder`;

-- DropTable
DROP TABLE `shipmentdeliveryorderitem`;

-- DropTable
DROP TABLE `shipmentpickup`;

-- CreateTable
CREATE TABLE `shipments` (
    `shipmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `internalNotes` TEXT NULL,
    `loadGoodsPicture` VARCHAR(255) NULL,
    `shipmentDeliveryId` INTEGER NULL,
    `shipmentPickupId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`shipmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_pickups` (
    `shipmentPickupId` INTEGER NOT NULL AUTO_INCREMENT,
    `licensePlate` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `shipment_pickups_licensePlate_key`(`licensePlate`),
    PRIMARY KEY (`shipmentPickupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_deliveries` (
    `shipmentDeliveryId` INTEGER NOT NULL AUTO_INCREMENT,
    `fleetId` INTEGER NOT NULL,

    PRIMARY KEY (`shipmentDeliveryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_deliveries_orders` (
    `shipmentDeliveryOrderId` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentId` INTEGER NOT NULL,
    `deliveryOrderId` INTEGER NOT NULL,
    `address` TEXT NULL,
    `shipmentDeliveryOrderType` ENUM('RUMAH', 'KANTOR', 'GUDANG', 'EKSPEDISI') NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`shipmentDeliveryOrderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_deliveries_orders_items` (
    `shipmentDeliveryOrderItemId` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentDeliveryOrderId` INTEGER NOT NULL,
    `deliveryOrderItemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`shipmentDeliveryOrderItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_shipmentDeliveryId_fkey` FOREIGN KEY (`shipmentDeliveryId`) REFERENCES `shipment_deliveries`(`shipmentDeliveryId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_shipmentPickupId_fkey` FOREIGN KEY (`shipmentPickupId`) REFERENCES `shipment_pickups`(`shipmentPickupId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_deliveries` ADD CONSTRAINT `shipment_deliveries_fleetId_fkey` FOREIGN KEY (`fleetId`) REFERENCES `fleets`(`fleetId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_deliveries_orders` ADD CONSTRAINT `shipment_deliveries_orders_shipmentId_fkey` FOREIGN KEY (`shipmentId`) REFERENCES `shipments`(`shipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_deliveries_orders` ADD CONSTRAINT `shipment_deliveries_orders_deliveryOrderId_fkey` FOREIGN KEY (`deliveryOrderId`) REFERENCES `delivery_orders`(`deliveryOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_deliveries_orders_items` ADD CONSTRAINT `shipment_deliveries_orders_items_deliveryOrderItemId_fkey` FOREIGN KEY (`deliveryOrderItemId`) REFERENCES `delivery_orders_items`(`deliveryOrderItemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_deliveries_orders_items` ADD CONSTRAINT `shipment_deliveries_orders_items_shipmentDeliveryOrderId_fkey` FOREIGN KEY (`shipmentDeliveryOrderId`) REFERENCES `shipment_deliveries_orders`(`shipmentDeliveryOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentLog` ADD CONSTRAINT `ShipmentLog_shipmentId_fkey` FOREIGN KEY (`shipmentId`) REFERENCES `shipments`(`shipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;
