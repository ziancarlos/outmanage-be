-- CreateTable
CREATE TABLE `users` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `roleId` INTEGER NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `accessToken` VARCHAR(255) NULL,
    `refreshToken` VARCHAR(255) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `roleId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `permissionId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `permissions_name_key`(`name`),
    PRIMARY KEY (`permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles_has_permissions` (
    `roleHasPermissionId` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    UNIQUE INDEX `roles_has_permissions_roleId_permissionId_key`(`roleId`, `permissionId`),
    PRIMARY KEY (`roleHasPermissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_activities_logs` (
    `userActivityLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `activityType` TINYINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ipAddress` VARCHAR(45) NULL,

    PRIMARY KEY (`userActivityLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_logs` (
    `userLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `targetedUserId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `changeType` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `oldValue` JSON NULL,
    `newValue` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`userLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `customerId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `customers_name_key`(`name`),
    PRIMARY KEY (`customerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers_logs` (
    `customerLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `changeType` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `oldValue` JSON NULL,
    `newValue` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`customerLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `itemId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,

    UNIQUE INDEX `items_name_key`(`name`),
    PRIMARY KEY (`itemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items_logs` (
    `itemLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `changeType` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `oldValue` JSON NULL,
    `newValue` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`itemLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_orders` (
    `deliveryOrderId` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `address` TEXT NULL,
    `internalNotes` TEXT NULL,
    `status` ENUM('SELESAI', 'PROSES', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`deliveryOrderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_orders_items` (
    `deliveryOrderItemId` INTEGER NOT NULL AUTO_INCREMENT,
    `deliveryOrderId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    UNIQUE INDEX `delivery_orders_items_deliveryOrderId_itemId_key`(`deliveryOrderId`, `itemId`),
    PRIMARY KEY (`deliveryOrderItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_orders_logs` (
    `deliveryOrderLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `deliveryOrderId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `changeType` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `details` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`deliveryOrderLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fleets` (
    `fleetId` INTEGER NOT NULL AUTO_INCREMENT,
    `model` VARCHAR(100) NOT NULL,
    `licensePlate` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `fleets_licensePlate_key`(`licensePlate`),
    PRIMARY KEY (`fleetId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fleets_logs` (
    `fleetLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `fleetId` INTEGER NOT NULL,
    `changeType` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `oldValue` JSON NULL,
    `newValue` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`fleetLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments` (
    `shipmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `internalNotes` TEXT NULL,
    `loadGoodsPicture` VARCHAR(255) NULL,
    `licensePlate` VARCHAR(20) NULL,
    `fleetId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,
    `shipmentPickupShipmentPickupId` INTEGER NULL,
    `shipmentDeliveryShipmentDeliveryId` INTEGER NULL,

    PRIMARY KEY (`shipmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_deliveries_orders` (
    `shipmentDeliveryOrderId` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentId` INTEGER NOT NULL,
    `deliveryOrderId` INTEGER NOT NULL,
    `address` TEXT NULL,
    `shipmentDeliveryOrderType` ENUM('RUMAH', 'KANTOR', 'GUDANG', 'EKSPEDISI', 'LAINNYA') NULL,

    PRIMARY KEY (`shipmentDeliveryOrderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_deliveries_orders_items` (
    `shipmentDeliveryOrderItemId` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentDeliveryOrderId` INTEGER NOT NULL,
    `deliveryOrderItemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`shipmentDeliveryOrderItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShipmentLog` (
    `shipmentLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `changeType` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `details` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`shipmentLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`roleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles_has_permissions` ADD CONSTRAINT `roles_has_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`roleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles_has_permissions` ADD CONSTRAINT `roles_has_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`permissionId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_activities_logs` ADD CONSTRAINT `users_activities_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_logs` ADD CONSTRAINT `users_logs_targetedUserId_fkey` FOREIGN KEY (`targetedUserId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_logs` ADD CONSTRAINT `users_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers_logs` ADD CONSTRAINT `customers_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers_logs` ADD CONSTRAINT `customers_logs_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`customerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items_logs` ADD CONSTRAINT `items_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items_logs` ADD CONSTRAINT `items_logs_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_orders` ADD CONSTRAINT `delivery_orders_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`customerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_orders_items` ADD CONSTRAINT `delivery_orders_items_deliveryOrderId_fkey` FOREIGN KEY (`deliveryOrderId`) REFERENCES `delivery_orders`(`deliveryOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_orders_items` ADD CONSTRAINT `delivery_orders_items_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_orders_logs` ADD CONSTRAINT `delivery_orders_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_orders_logs` ADD CONSTRAINT `delivery_orders_logs_deliveryOrderId_fkey` FOREIGN KEY (`deliveryOrderId`) REFERENCES `delivery_orders`(`deliveryOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fleets_logs` ADD CONSTRAINT `fleets_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fleets_logs` ADD CONSTRAINT `fleets_logs_fleetId_fkey` FOREIGN KEY (`fleetId`) REFERENCES `fleets`(`fleetId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_fleetId_fkey` FOREIGN KEY (`fleetId`) REFERENCES `fleets`(`fleetId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_deliveries_orders` ADD CONSTRAINT `shipment_deliveries_orders_shipmentId_fkey` FOREIGN KEY (`shipmentId`) REFERENCES `shipments`(`shipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_deliveries_orders` ADD CONSTRAINT `shipment_deliveries_orders_deliveryOrderId_fkey` FOREIGN KEY (`deliveryOrderId`) REFERENCES `delivery_orders`(`deliveryOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_deliveries_orders_items` ADD CONSTRAINT `shipment_deliveries_orders_items_deliveryOrderItemId_fkey` FOREIGN KEY (`deliveryOrderItemId`) REFERENCES `delivery_orders_items`(`deliveryOrderItemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_deliveries_orders_items` ADD CONSTRAINT `shipment_deliveries_orders_items_shipmentDeliveryOrderId_fkey` FOREIGN KEY (`shipmentDeliveryOrderId`) REFERENCES `shipment_deliveries_orders`(`shipmentDeliveryOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentLog` ADD CONSTRAINT `ShipmentLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentLog` ADD CONSTRAINT `ShipmentLog_shipmentId_fkey` FOREIGN KEY (`shipmentId`) REFERENCES `shipments`(`shipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;
