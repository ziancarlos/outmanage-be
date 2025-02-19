/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `delivery_orders_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `delivery_orders_items` DROP COLUMN `deletedAt`;
