import { Router } from "express";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../middlewares/AuthMiddlewares.js";
import ItemController from "../controllers/ItemControllers.js";

const ItemRoute = Router();

ItemRoute.use(authenticationMiddleware);

ItemRoute.get(
  "/api/items/logs",
  authorizationMiddleware("read-items-logs"),
  ItemController.getLogs
);

ItemRoute.get(
  "/api/items/:itemId",
  authorizationMiddleware("read-item"),
  ItemController.get
);

ItemRoute.get(
  "/api/items",
  authorizationMiddleware("read-items"),
  ItemController.getAll
);

ItemRoute.post(
  "/api/items",
  authorizationMiddleware("create-item"),
  ItemController.create
);

ItemRoute.patch(
  "/api/items/:itemId",
  authorizationMiddleware("update-item"),
  ItemController.update
);

export default ItemRoute;
