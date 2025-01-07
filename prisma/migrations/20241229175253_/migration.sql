/*
  Warnings:

  - You are about to drop the column `description` on the `permissions` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `shipments` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `permissions` DROP COLUMN `description`;

-- AlterTable
ALTER TABLE `shipments` MODIFY `status` ENUM('UNPROCESSED', 'PROCESSED', 'COMPLETED') NOT NULL;
