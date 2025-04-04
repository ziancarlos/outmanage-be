import DeliveryOrderServices from "../services/DeliveryOrderServices.js";
async function get(req, res, next) {
  try {
    const deliveryOrderId = req.params.deliveryOrderId;

    const result = await DeliveryOrderServices.get(deliveryOrderId);

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
            customerId: req.query.customerId,
            name: req.query.name,
            deliveryOrderId: req.query.deliveryOrderId,
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
            customerId: req.query.customerId,
            status: req.query.status,
            removedStatus: req.query.removedStatus,
            page: req.query.page,
            size: req.query.size,
          };

    const result = await DeliveryOrderServices.getAll(request);

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
            deliveryOrderId: req.query.deliveryOrderId,
            changeType: req.query.changeType,
            date: {
              startDate: req.query.startDate,
              endDate: req.query.endDate,
            },
            page: req.query.page,
            size: req.query.size,
          }
        : {
            deliveryOrderId: req.query.deliveryOrderId,
            changeType: req.query.changeType,
            page: req.query.page,
            size: req.query.size,
          };

    const result = await DeliveryOrderServices.getLogs(request);

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { body } = req;

    await DeliveryOrderServices.create(body, req.user.userId);

    return res.status(201).json({
      data: "Berhasil menambahkan DO.",
    });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const request = {
      deliveryOrderId: req.params.deliveryOrderId,
      customerId: req.body.customerId,
      address: req.body.address,
      internalNotes: req.body.internalNotes,
      items: req.body.items,
    };

    const result = await DeliveryOrderServices.update(request, req.user.userId);

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
