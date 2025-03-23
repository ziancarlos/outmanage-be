import { Router } from "express";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../middlewares/AuthMiddlewares.js";
import ShipmentControllers from "../controllers/ShipmentControllers.js";
import upload from "../middlewares/UploadMiddleware.js";

const ShipmentRoutes = Router();

ShipmentRoutes.use(authenticationMiddleware);

ShipmentRoutes.get(
  "/api/shipments/logs",
  authorizationMiddleware("read-shipments-logs"),
  ShipmentControllers.getLogs
);

ShipmentRoutes.get("/api/shipments/:shipmentId", ShipmentControllers.get);

ShipmentRoutes.get(
  "/api/shipments",
  authorizationMiddleware("read-shipments"),
  ShipmentControllers.getAll
);

ShipmentRoutes.post(
  "/api/shipments",
  authorizationMiddleware("create-shipment"),
  ShipmentControllers.create
);
ShipmentRoutes.patch(
  "/api/shipments/:shipmentId",
  authorizationMiddleware("update-shipment"),
  ShipmentControllers.update
);

ShipmentRoutes.put(
  "/api/shipments/:shipmentId",
  upload.single("image"),
  authorizationMiddleware("upload-shipment-image"),
  ShipmentControllers.uploadImage
);
ShipmentRoutes.get(
  "/api/shipments/images/:shipmentId",
  ShipmentControllers.showImage
);

export default ShipmentRoutes;
