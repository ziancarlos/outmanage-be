/*
  Warnings:

  - You are about to drop the column `initials` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `stockKeepingUnit` on the `items` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `customers_initials_key` ON `customers`;

-- DropIndex
DROP INDEX `items_stockKeepingUnit_key` ON `items`;

-- AlterTable
ALTER TABLE `customers` DROP COLUMN `initials`;

-- AlterTable
ALTER TABLE `items` DROP COLUMN `stockKeepingUnit`;

-- CreateIndex
CREATE UNIQUE INDEX `customers_name_key` ON `customers`(`name`);
