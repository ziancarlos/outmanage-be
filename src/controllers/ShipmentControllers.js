import path from "path";
import ResponseError from "../errors/ResponseError.js";
import ShipmentServices from "../services/ShipmentServices.js";
import fs from "fs";
async function get(req, res, next) {
  try {
    const shipmentId = req.params.shipmentId;

    const result = await ShipmentServices.get(shipmentId);

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function getAll(req, res, next) {
  try {
    const request =
      req.query.startDate || req.query.endDate
        ? {
            licensePlate: req.query.licensePlate,
            shipmentType: req.query.shipmentType,
            status: req.query.status,
            removedStatus: req.query.removedStatus,
            date: {
              startDate: req.query.startDate,
              endDate: req.query.endDate,
            },
            page: req.query.page,
            size: req.query.size,
          }
        : {
            licensePlate: req.query.licensePlate,
            shipmentType: req.query.shipmentType,
            status: req.query.status,
            removedStatus: req.query.removedStatus,
            page: req.query.page,
            size: req.query.size,
          };

    const result = await ShipmentServices.getAll(request);

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

async function getLogs(req, res, next) {
  try {
    const request =
      req.query.startDate || req.query.endDate
        ? {
            shipmentId: req.query.shipmentId,
            changeType: req.query.changeType,
            date: {
              startDate: req.query.startDate,
              endDate: req.query.endDate,
            },
            page: req.query.page,
            size: req.query.size,
          }
        : {
            shipmentId: req.query.shipmentId,
            changeType: req.query.changeType,
            page: req.query.page,
            size: req.query.size,
          };

    const result = await ShipmentServices.getLogs(request);

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { body } = req;

    await ShipmentServices.create(body, req.user.userId);

    return res.status(201).json({
      data: "Berhasil menambahkan Pengiriman.",
    });
  } catch (e) {
    next(e);
  }
}

async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      throw new ResponseError(400, "Gambar wajib diunggah.");
    }

    const request = {
      shipmentId: req.params.shipmentId,
      imageUrl: req.file.filename, // This now uses Multer's filename
    };

    await ShipmentServices.saveImage(request);

    return res.status(201).json({
      message: "Bukti pengiriman barang berhasil diunggah.",
    });
  } catch (e) {
    next(e);
  }
}

async function showImage(req, res, next) {
  try {
    const { shipmentId } = req.params;

    // Get filename from service
    const filename = await ShipmentServices.getImage(shipmentId);

    // Create absolute path
    const imagePath = path.join(
      process.cwd(), // Root project directory
      "uploads",
      "shipments",
      filename
    );

    // Verify file exists
    if (!fs.existsSync(imagePath)) {
      throw new ResponseError(404, "Unggahan tidak ditemukkan");
    }

    // Determine MIME type dynamically
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
    };

    // Send file with correct headers
    res.sendFile(imagePath, {
      headers: {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const request = {
      shipmentId: req.params.shipmentId,
      fleetId: req.body.fleetId,
      licensePlate: req.body.licensePlate,
      internalNotes: req.body.internalNotes,
      deliveryOrders: req.body.deliveryOrders,
    };
    await ShipmentServices.update(request, req.user.userId);

    return res.status(201).json({
      data: "Berhasil mengubah Pengiriman.",
    });
  } catch (e) {
    next(e);
  }
}
export default {
  get,
  getAll,
  getLogs,
  create,
  update,
  uploadImage,
  showImage,
};
