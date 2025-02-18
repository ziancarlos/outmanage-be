import { Router } from "express";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../middlewares/AuthMiddlewares.js";
import FleetController from "../controllers/FleetControllers.js";

const FleetRoutes = Router();

FleetRoutes.use(authenticationMiddleware);

FleetRoutes.get(
  "/api/fleets/logs",
  authorizationMiddleware("read-fleets-logs"),
  FleetController.getLogs
);

FleetRoutes.get(
  "/api/fleets/:fleetId",
  authorizationMiddleware("read-fleet"),
  FleetController.get
);

FleetRoutes.get(
  "/api/fleets",
  authorizationMiddleware("read-fleets"),
  FleetController.getAll
);

FleetRoutes.post(
  "/api/fleets",
  authorizationMiddleware("create-fleet"),
  FleetController.create
);

FleetRoutes.patch(
  "/api/fleets/:fleetId",
  authorizationMiddleware("update-fleet"),
  FleetController.update
);

export default FleetRoutes;
