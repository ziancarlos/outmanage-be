import { Router } from "express";
import AuthController from "../controllers/AuthControllers.js";
import { authenticationMiddleware } from "../middlewares/AuthMiddlewares.js";

const AuthRoute = Router();

AuthRoute.delete(
  "/api/auth/logout",
  authenticationMiddleware,
  AuthController.logout
);

AuthRoute.post("/api/auth/login", AuthController.login);
AuthRoute.post("/api/auth/refresh", AuthController.refresh);

export default AuthRoute;
