import { Router } from "express";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../middlewares/AuthMiddlewares.js";
import ShipmentTypeController from "../controllers/ShipmentTypeControllers.js";

const ShipmentTypeRoute = Router();

ShipmentTypeRoute.use(authenticationMiddleware);

ShipmentTypeRoute.get(
  "/api/shipment-types/logs",
  authorizationMiddleware("read-shipment-types-logs"),
  ShipmentTypeController.getLogs
);

ShipmentTypeRoute.get(
  "/api/shipment-types/:shipmentTypeId",
  authorizationMiddleware("read-shipment-type"),
  ShipmentTypeController.get
);

ShipmentTypeRoute.get(
  "/api/shipment-types",
  authorizationMiddleware("read-shipment-types"),
  ShipmentTypeController.getAll
);

ShipmentTypeRoute.post(
  "/api/shipment-types",
  authorizationMiddleware("create-shipment-type"),
  ShipmentTypeController.create
);

ShipmentTypeRoute.patch(
  "/api/shipment-types/:shipmentTypeId",
  authorizationMiddleware("update-shipment-type"),
  ShipmentTypeController.update
);

export default ShipmentTypeRoute;
