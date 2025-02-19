/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `shipment_deliveries_orders` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `shipment_deliveries_orders_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `shipment_deliveries_orders` DROP COLUMN `deletedAt`;

-- AlterTable
ALTER TABLE `shipment_deliveries_orders_items` DROP COLUMN `deletedAt`;
