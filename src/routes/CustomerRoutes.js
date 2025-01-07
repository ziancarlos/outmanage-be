import { Router } from "express";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../middlewares/AuthMiddlewares.js";
import CustomerController from "../controllers/CustomerControllers.js";

const CustomerRoute = Router();

CustomerRoute.use(authenticationMiddleware);

CustomerRoute.get(
  "/api/customers/logs",
  authorizationMiddleware("read-customers-logs"),
  CustomerController.getLogs
);

CustomerRoute.get(
  "/api/customers/:customerId",
  authorizationMiddleware("read-customer"),
  CustomerController.get
);

CustomerRoute.get(
  "/api/customers",
  authorizationMiddleware("read-customers"),
  CustomerController.getAll
);

CustomerRoute.post(
  "/api/customers",
  authorizationMiddleware("create-customer"),
  CustomerController.create
);

CustomerRoute.patch(
  "/api/customers/:customerId",
  authorizationMiddleware("update-customer"),
  CustomerController.update
);

export default CustomerRoute;
