-- AddForeignKey
ALTER TABLE `fleets_logs` ADD CONSTRAINT `fleets_logs_fleetId_fkey` FOREIGN KEY (`fleetId`) REFERENCES `fleets`(`fleetId`) ON DELETE RESTRICT ON UPDATE CASCADE;
