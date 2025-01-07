import ItemServices from "../services/ItemServices.js";
async function get(req, res, next) {
  try {
    const itemId = req.params.itemId;

    const result = await ItemServices.get(itemId);

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
      stockKeepingUnit: req.query.stockKeepingUnit,
      page: req.query.page,
      size: req.query.size,
    };

    const result = await ItemServices.getAll(request);

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
            itemId: req.query.itemId,
            changeType: req.query.changeType,
            date: {
              startDate: req.query.startDate,
              endDate: req.query.endDate,
            },
            page: req.query.page,
            size: req.query.size,
          }
        : {
            itemId: req.query.itemId,
            changeType: req.query.changeType,
            page: req.query.page,
            size: req.query.size,
          };

    const result = await ItemServices.getLogs(request);

    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { body } = req;

    await ItemServices.create(body, req.user.userId);

    return res.status(201).json({
      data: "Berhasil menambahkan item pengiriman.",
    });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const request = {
      itemId: req.params.itemId,
      name: req.body.name,
      stockKeepingUnit: req.body.stockKeepingUnit,
    };

    const result = await ItemServices.update(request, req.user.userId);

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
