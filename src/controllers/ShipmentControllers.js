import ShipmentServices from "../services/ShipmentServices.js";
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
    const request = {
      shipmentTypeId: req.query.shipmentTypeId,
      status: req.query.status,
      licensePlate: req.query.licensePlate,
      address: req.query.address,
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
            details: req.query.details,
            page: req.query.page,
            size: req.query.size,
          }
        : {
            shipmentId: req.query.shipmentId,
            changeType: req.query.changeType,
            details: req.query.details,
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
      data: "Berhasil menambahkan pengiriman.",
    });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const request = {
      shipmentId: req.params.shipmentId,
      shipmentTypeId: req.body.shipmentTypeId,
      licensePlate: req.body.licensePlate,
      address: req.body.address,
      internalNotes: req.body.internalNotes,
      items: req.body.items,
    };

    const result = await ShipmentServices.update(request, req.user.userId);

    res.status(200).json({
      data: "Berhasil mengubah pengiriman",
    });
  } catch (e) {
    next(e);
  }
}
async function updateStatusProcessed(req, res, next) {
  try {
    const request = {
      shipmentId: req.params.shipmentId,
      status: "PROCESSED",
    };

    const result = await ShipmentServices.updateStatus(
      request,
      req.user.userId
    );

    res.status(200).json({
      data: "Berhasil mengubah status pengiriman menjadi proses.",
    });
  } catch (e) {
    next(e);
  }
}

async function updateStatusCompleted(req, res, next) {
  try {
    const request = {
      shipmentId: req.params.shipmentId,
      status: "COMPLETED",
    };

    const result = await ShipmentServices.updateStatus(
      request,
      req.user.userId
    );

    res.status(200).json({
      data: "Berhasil mengubah status pengiriman menjadi selesai.",
    });
  } catch (e) {
    next(e);
  }
}

export default {
  get,
  getAll,
  getLogs,
  update,
  create,
  updateStatusCompleted,
  updateStatusProcessed,
};
