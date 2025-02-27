/*
  Warnings:

  - You are about to drop the column `fleetId` on the `shipment_deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `licensePlate` on the `shipment_pickups` table. All the data in the column will be lost.
  - You are about to drop the column `shipmentDeliveryId` on the `shipments` table. All the data in the column will be lost.
  - You are about to drop the column `shipmentPickupId` on the `shipments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `shipment_deliveries` DROP FOREIGN KEY `shipment_deliveries_fleetId_fkey`;

-- DropForeignKey
ALTER TABLE `shipments` DROP FOREIGN KEY `shipments_shipmentDeliveryId_fkey`;

-- DropForeignKey
ALTER TABLE `shipments` DROP FOREIGN KEY `shipments_shipmentPickupId_fkey`;

-- DropIndex
DROP INDEX `shipment_deliveries_fleetId_fkey` ON `shipment_deliveries`;

-- DropIndex
DROP INDEX `shipment_pickups_licensePlate_key` ON `shipment_pickups`;

-- DropIndex
DROP INDEX `shipments_shipmentDeliveryId_fkey` ON `shipments`;

-- DropIndex
DROP INDEX `shipments_shipmentPickupId_fkey` ON `shipments`;

-- AlterTable
ALTER TABLE `shipment_deliveries` DROP COLUMN `fleetId`,
    ADD COLUMN `fleetFleetId` INTEGER NULL;

-- AlterTable
ALTER TABLE `shipment_pickups` DROP COLUMN `licensePlate`;

-- AlterTable
ALTER TABLE `shipments` DROP COLUMN `shipmentDeliveryId`,
    DROP COLUMN `shipmentPickupId`,
    ADD COLUMN `fleetId` INTEGER NULL,
    ADD COLUMN `licensePlate` VARCHAR(20) NULL,
    ADD COLUMN `shipmentDeliveryShipmentDeliveryId` INTEGER NULL,
    ADD COLUMN `shipmentPickupShipmentPickupId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_fleetId_fkey` FOREIGN KEY (`fleetId`) REFERENCES `fleets`(`fleetId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_shipmentPickupShipmentPickupId_fkey` FOREIGN KEY (`shipmentPickupShipmentPickupId`) REFERENCES `shipment_pickups`(`shipmentPickupId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_shipmentDeliveryShipmentDeliveryId_fkey` FOREIGN KEY (`shipmentDeliveryShipmentDeliveryId`) REFERENCES `shipment_deliveries`(`shipmentDeliveryId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_deliveries` ADD CONSTRAINT `shipment_deliveries_fleetFleetId_fkey` FOREIGN KEY (`fleetFleetId`) REFERENCES `fleets`(`fleetId`) ON DELETE SET NULL ON UPDATE CASCADE;
