import { Router } from "express";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../middlewares/AuthMiddlewares.js";
import DeliveryOrderController from "../controllers/DeliveryOrderControllers.js";

const DeliveryOrderRoutes = Router();

DeliveryOrderRoutes.use(authenticationMiddleware);

DeliveryOrderRoutes.get(
  "/api/delivery-orders/logs",
  authorizationMiddleware("read-delivery-orders-logs"),
  DeliveryOrderController.getLogs
);

DeliveryOrderRoutes.get(
  "/api/delivery-orders/:deliveryOrderId",
  authorizationMiddleware("read-delivery-order"),
  DeliveryOrderController.get
);

DeliveryOrderRoutes.get(
  "/api/delivery-orders",
  authorizationMiddleware("read-delivery-orders"),
  DeliveryOrderController.getAll
);

DeliveryOrderRoutes.post(
  "/api/delivery-orders",
  authorizationMiddleware("create-delivery-order"),
  DeliveryOrderController.create
);

DeliveryOrderRoutes.patch(
  "/api/delivery-orders/:deliveryOrderId",
  authorizationMiddleware("update-delivery-order"),
  DeliveryOrderController.update
);

export default DeliveryOrderRoutes;
