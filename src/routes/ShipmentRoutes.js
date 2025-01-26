import { Router } from "express";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../middlewares/AuthMiddlewares.js";
import ShipmentControllers from "../controllers/ShipmentControllers.js";

const ShipmentRoute = Router();

ShipmentRoute.use(authenticationMiddleware);

ShipmentRoute.get(
  "/api/shipments/logs",
  authorizationMiddleware("read-shipments-logs"),
  ShipmentControllers.getLogs
);

ShipmentRoute.get(
  "/api/shipments/:shipmentId",
  authorizationMiddleware("read-shipment"),
  ShipmentControllers.get
);

ShipmentRoute.get(
  "/api/shipments",
  authorizationMiddleware("read-shipments"),
  ShipmentControllers.getAll
);

ShipmentRoute.post(
  "/api/shipments",
  authorizationMiddleware("create-shipment"),
  ShipmentControllers.create
);

ShipmentRoute.patch(
  "/api/shipments/:shipmentId",
  authorizationMiddleware("update-shipment"),
  ShipmentControllers.update
);

ShipmentRoute.patch(
  "/api/shipments/:shipmentId/processed",
  authorizationMiddleware("update-shipment-status-processed"),
  ShipmentControllers.updateStatusProcessed
);
ShipmentRoute.patch(
  "/api/shipments/:shipmentId/completed",
  authorizationMiddleware("update-shipment-status-completed"),
  ShipmentControllers.updateStatusCompleted
);

export default ShipmentRoute;
