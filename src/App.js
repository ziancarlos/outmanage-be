import express from "express";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import CustomerRoutes from "./routes/CustomerRoutes.js";
import errorMiddleware from "./middlewares/ErrorMiddleware.js";
import cookieParser from "cookie-parser";
import ItemRoutes from "./routes/ItemRoutes.js";
import ShipmentTypeRoutes from "./routes/ShipmentTypeRoutes.js";
import ShipmentRoutes from "./routes/ShipmentRoutes.js";
import RoleRoutes from "./routes/RoleRoutes.js";

const app = express();
app.use(cookieParser());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend's origin (if it's local, use this)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
    credentials: true, // Allows cookies to be included in cross-origin requests
  })
);

app.use(express.json());

app.use(AuthRoutes);
app.use(UserRoutes);
app.use(CustomerRoutes);
app.use(ItemRoutes);
app.use(ShipmentTypeRoutes);
app.use(ShipmentRoutes);
app.use(RoleRoutes);

app.use(errorMiddleware);
const port = 1500;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
