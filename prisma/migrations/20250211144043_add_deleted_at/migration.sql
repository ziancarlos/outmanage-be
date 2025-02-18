-- AlterTable
ALTER TABLE `delivery_orders` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `delivery_orders_items` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `shipment` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `shipmentdeliveryorder` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `shipmentdeliveryorderitem` ADD COLUMN `deletedAt` DATETIME(3) NULL;
