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
import FleetRoutes from "./routes/FleetRoutes.js";
import ShipmentRoutes from "./routes/ShipmentRoutes.js";
import ReportRoute from "./routes/ReportRoutes.js";
import DashboardRoutes from "./routes/DashboardRoutes.js";

const app = express();
app.use(cookieParser());

const origin = process.env.ALLOW_ORIGIN || "https://outmanage.online";

app.use(
  cors({
    origin, // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Error handling middleware (place after routes)

app.use(express.json());

app.use(AuthRoutes);
app.use(UserRoutes);
app.use(CustomerRoutes);
app.use(ItemRoutes);
app.use(RoleRoutes);
app.use(DeliveryOrderRoutes);
app.use(FleetRoutes);
app.use(ShipmentRoutes);
app.use(ReportRoute);
app.use(DashboardRoutes);

app.use((err, req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://outmanage.online");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle the error response
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});
app.use(errorMiddleware);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
