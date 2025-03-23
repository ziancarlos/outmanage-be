import ResponseError from "../errors/ResponseError.js";
import ShipmentServices from "../services/ShipmentServices.js";

async function get(req, res, next) {
  try {
    const shipmentId = req.params.shipmentId;

    const result = await ShipmentServices.get(shipmentId);

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    console.log(e);
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
    console.log(e);
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
    console.log(e);
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
      imageUrl: req.file.filename,
    };

    await ShipmentServices.saveImage(request);

    return res.status(201).json({
      message: "Bukti muat barang berhasil ditambahkan.",
    });
  } catch (e) {
    next(e);
  }
}

async function showImage(req, res, next) {
  try {
    const { shipmentId } = req.params;

    const loadGoodsPicture = await ShipmentServices.getImage(shipmentId);

    res.setHeader("Content-Type", "image/jpeg");
    res.send(loadGoodsPicture);
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
    console.log(e);
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
