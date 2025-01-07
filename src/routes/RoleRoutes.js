import { Router } from "express";
import RoleControllers from "../controllers/RoleControllers.js";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../middlewares/AuthMiddlewares.js";

const RoleRoute = Router();

RoleRoute.use(authenticationMiddleware);

RoleRoute.get(
  "/api/roles",
  authorizationMiddleware("read-roles"),
  RoleControllers.getAll
);

RoleRoute.get(
  "/api/roles/:roleId/permissions/related",
  authorizationMiddleware("read-permissions-with-related"),
  RoleControllers.getPermissionsRelated
);

RoleRoute.get("/api/roles/my/permissions", RoleControllers.getMyPermissions);

RoleRoute.get(
  "/api/roles/:roleId/permissions",
  authorizationMiddleware("read-permissions"),
  RoleControllers.getPermissions
);

RoleRoute.patch(
  "/api/role/:roleId/permissions",
  authorizationMiddleware("update-permissions"),
  RoleControllers.updatePermissions
);

export default RoleRoute;
