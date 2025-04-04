import { Router } from "express";
import DashboardControllers from "../controllers/DashboardControllers.js";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../middlewares/AuthMiddlewares.js";

const DashboardRoutes = Router();

DashboardRoutes.use(authenticationMiddleware);
DashboardRoutes.use(authorizationMiddleware("read-dashboard"));

DashboardRoutes.get(
  "/api/dashboards/total-customer",
  DashboardControllers.getTotalCustomer
);
DashboardRoutes.get(
  "/api/dashboards/total-item",
  DashboardControllers.getTotalItem
);
DashboardRoutes.get(
  "/api/dashboards/total-active-do",
  DashboardControllers.getActiveDO
);
DashboardRoutes.get(
  "/api/dashboards/total-fleet",
  DashboardControllers.getTotalFleet
);
DashboardRoutes.get(
  "/api/dashboards/total-shipment",
  DashboardControllers.getActiveShipment
);
export default DashboardRoutes;
