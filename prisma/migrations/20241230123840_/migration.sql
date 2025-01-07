/*
  Warnings:

  - A unique constraint covering the columns `[shipmentId,itemId]` on the table `shipments_has_items` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `shipments_has_items_shipmentId_itemId_key` ON `shipments_has_items`(`shipmentId`, `itemId`);
