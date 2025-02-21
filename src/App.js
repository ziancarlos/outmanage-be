import express from "express";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import CustomerRoutes from "./routes/CustomerRoutes.js";
import errorMiddleware from "./middlewares/ErrorMiddleware.js";
import cookieParser from "cookie-parser";
import ItemRoutes from "./routes/ItemRoutes.js";
import RoleRoutes from "./routes/RoleRoutes.js";
import DeliveryOrderRoutes from "./routes/DeliveryOrderRoutes.js";
import FleetServices from "./services/FleetServices.js";
import FleetRoutes from "./routes/FleetRoutes.js";

const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN || "https://outmanage.online", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use(AuthRoutes);
app.use(UserRoutes);
app.use(CustomerRoutes);
app.use(ItemRoutes);
app.use(RoleRoutes);
app.use(DeliveryOrderRoutes);
app.use(FleetRoutes);

app.use(errorMiddleware);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
