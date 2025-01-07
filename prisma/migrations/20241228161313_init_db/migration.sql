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
    `userId` INTEGER NOT NULL,
    `targetedUserId` INTEGER NOT NULL,
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
    `initials` VARCHAR(5) NOT NULL,

    UNIQUE INDEX `customers_initials_key`(`initials`),
    PRIMARY KEY (`customerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers_logs` (
    `customerLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `customerId` INTEGER NOT NULL,
    `changeType` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `oldValue` JSON NULL,
    `newValue` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`customerLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments_types` (
    `shipmentTypeId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `shipments_types_name_key`(`name`),
    PRIMARY KEY (`shipmentTypeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments_types_logs` (
    `shipmentTypeLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `shipmentTypeId` INTEGER NOT NULL,
    `changeType` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `oldValue` JSON NULL,
    `newValue` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`shipmentTypeLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `itemId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `stockKeepingUnit` VARCHAR(30) NOT NULL,

    UNIQUE INDEX `items_name_key`(`name`),
    UNIQUE INDEX `items_stockKeepingUnit_key`(`stockKeepingUnit`),
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
ALTER TABLE `shipments_types_logs` ADD CONSTRAINT `shipments_types_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments_types_logs` ADD CONSTRAINT `shipments_types_logs_shipmentTypeId_fkey` FOREIGN KEY (`shipmentTypeId`) REFERENCES `shipments_types`(`shipmentTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items_logs` ADD CONSTRAINT `items_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items_logs` ADD CONSTRAINT `items_logs_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;
