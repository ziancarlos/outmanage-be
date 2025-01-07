import CustomerServices from "../services/CustomerServices.js";
async function get(req, res, next) {
  try {
    const customerId = req.params.customerId;

    const result = await CustomerServices.get(customerId);

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
      initials: req.query.initials,
      page: req.query.page,
      size: req.query.size,
    };

    const result = await CustomerServices.getAll(request);

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
            customerId: req.query.customerId,
            changeType: req.query.changeType,
            date: {
              startDate: req.query.startDate,
              endDate: req.query.endDate,
            },
            page: req.query.page,
            size: req.query.size,
          }
        : {
            customerId: req.query.customerId,
            changeType: req.query.changeType,
            page: req.query.page,
            size: req.query.size,
          };

    const result = await CustomerServices.getLogs(request);

    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { body } = req;

    await CustomerServices.create(body, req.user.userId);

    return res.status(201).json({
      data: "Berhasil menambahkan customer.",
    });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const request = {
      customerId: req.params.customerId,
      name: req.body.name,
      initials: req.body.initials,
    };

    const result = await CustomerServices.update(request, req.user.userId);

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
