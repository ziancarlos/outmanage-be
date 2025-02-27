import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import ResponseError from "../errors/ResponseError.js";
import crypto from "crypto";

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (_, file, cb) => {
    // Fix: file is now correctly used
    const ext = path.extname(file.originalname);
    const randomString = crypto.randomBytes(8).toString("hex"); // Generate a random string
    cb(null, `shipment-${randomString}${ext}`);
  },
});

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new ResponseError(400, "Hanya file gambar saja yang diperbolehkan."),
      false
    );
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default upload;
