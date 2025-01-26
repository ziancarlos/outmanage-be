/*
  Warnings:

  - Added the required column `customerId` to the `shipments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `shipments` ADD COLUMN `customerId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`customerId`) ON DELETE RESTRICT ON UPDATE CASCADE;
