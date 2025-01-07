import ShipmentTypeServices from "../services/ShipmentTypeServices.js";
async function get(req, res, next) {
  try {
    const shipmentTypeId = req.params.shipmentTypeId;

    const result = await ShipmentTypeServices.get(shipmentTypeId);

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
      name: req.query.name,
      page: req.query.page,
      size: req.query.size,
    };

    const result = await ShipmentTypeServices.getAll(request);

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
            shipmentTypeId: req.query.shipmentTypeId,
            changeType: req.query.changeType,
            date: {
              startDate: req.query.startDate,
              endDate: req.query.endDate,
            },
            page: req.query.page,
            size: req.query.size,
          }
        : {
            shipmentTypeId: req.query.shipmentTypeId,
            changeType: req.query.changeType,
            page: req.query.page,
            size: req.query.size,
          };

    const result = await ShipmentTypeServices.getLogs(request);

    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { body } = req;

    await ShipmentTypeServices.create(body, req.user.userId);

    return res.status(201).json({
      data: "Berhasil menambahkan tipe pengiriman.",
    });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const request = {
      shipmentTypeId: req.params.shipmentTypeId,
      name: req.body.name,
    };

    const result = await ShipmentTypeServices.update(request, req.user.userId);

    res.status(200).json({
      data: result,
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
};
