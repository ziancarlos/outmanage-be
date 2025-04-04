import { Router } from "express";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../middlewares/AuthMiddlewares.js";
import ReportControllers from "../controllers/ReportControllers.js";

const ReportRoute = Router();

ReportRoute.use(authenticationMiddleware);

ReportRoute.get(
  "/api/reports/outgoing-items",
  authorizationMiddleware("read-reports-outgoing-items"),
  ReportControllers.getOutgoingItems
);
ReportRoute.get(
  "/api/reports/outgoing-items/download",
  ReportControllers.downloadOutgoingItemsExcel
);

export default ReportRoute;
