/*
  Warnings:

  - You are about to drop the `shipment_deliveries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shipment_pickups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `shipment_deliveries` DROP FOREIGN KEY `shipment_deliveries_fleetFleetId_fkey`;

-- DropForeignKey
ALTER TABLE `shipments` DROP FOREIGN KEY `shipments_shipmentDeliveryShipmentDeliveryId_fkey`;

-- DropForeignKey
ALTER TABLE `shipments` DROP FOREIGN KEY `shipments_shipmentPickupShipmentPickupId_fkey`;

-- DropIndex
DROP INDEX `shipments_shipmentDeliveryShipmentDeliveryId_fkey` ON `shipments`;

-- DropIndex
DROP INDEX `shipments_shipmentPickupShipmentPickupId_fkey` ON `shipments`;

-- AlterTable
ALTER TABLE `shipment_deliveries_orders` MODIFY `shipmentDeliveryOrderType` ENUM('RUMAH', 'KANTOR', 'GUDANG', 'EKSPEDISI', 'LAINNYA') NULL;

-- DropTable
DROP TABLE `shipment_deliveries`;

-- DropTable
DROP TABLE `shipment_pickups`;
