import FleetServices from "../services/FleetServices.js";
async function get(req, res, next) {
  try {
    const fleetId = req.params.fleetId;

    const result = await FleetServices.get(fleetId);

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
      model: req.query.model,
      licensePlate: req.query.licensePlate,
      page: req.query.page,
      size: req.query.size,
    };

    const result = await FleetServices.getAll(request);

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
            fleetId: req.query.fleetId,
            changeType: req.query.changeType,
            date: {
              startDate: req.query.startDate,
              endDate: req.query.endDate,
            },
            page: req.query.page,
            size: req.query.size,
          }
        : {
            fleetId: req.query.fleetId,
            changeType: req.query.changeType,
            page: req.query.page,
            size: req.query.size,
          };

    const result = await FleetServices.getLogs(request);

    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { body } = req;

    await FleetServices.create(body, req.user.userId);

    return res.status(201).json({
      data: "Berhasil menambahkan armada.",
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const request = {
      fleetId: req.params.fleetId,
      model: req.body.model,
      licensePlate: req.body.licensePlate,
    };

    const result = await FleetServices.update(request, req.user.userId);

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
