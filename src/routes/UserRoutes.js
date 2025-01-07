import { Router } from "express";
import UserControllers from "../controllers/UserControllers.js";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../middlewares/AuthMiddlewares.js";

const UserRoute = Router();

UserRoute.use(authenticationMiddleware);

UserRoute.get("/api/users/my/activities", UserControllers.getMyActivities);

UserRoute.get("/api/users/my", UserControllers.getMyProfile);

UserRoute.patch("/api/users/my", UserControllers.updateMyProfile);

UserRoute.get(
  "/api/users/activities",
  authorizationMiddleware("read-users-activities"),
  UserControllers.getAllActivities
);

UserRoute.get(
  "/api/users/removed",
  authorizationMiddleware("read-removed-users"),
  UserControllers.getAllRemoved
);

UserRoute.get(
  "/api/users/logs",
  authorizationMiddleware("read-users-logs"),
  UserControllers.getLogs
);

UserRoute.get(
  "/api/users/:userId",
  authorizationMiddleware("read-user"),
  UserControllers.get
);

UserRoute.get(
  "/api/users",
  authorizationMiddleware("read-users"),
  UserControllers.getAll
);

UserRoute.post(
  "/api/users",
  authorizationMiddleware("create-user"),
  UserControllers.create
);

UserRoute.patch(
  "/api/users/:userId",
  authorizationMiddleware("update-user"),
  UserControllers.update
);

UserRoute.delete(
  "/api/users/:userId",
  authorizationMiddleware("remove-user"),
  UserControllers.remove
);

UserRoute.post(
  "/api/users/restore/:userId",
  authorizationMiddleware("restore-user"),
  UserControllers.restore
);

export default UserRoute;
