import UserServices from "../services/UserServices.js";
async function get(req, res, next) {
  try {
    const userId = req.params.userId;

    const result = await UserServices.get(userId);

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
      username: req.query.username,
      removedStatus: false,
      page: req.query.page,
      size: req.query.size,
    };

    const result = await UserServices.getAll(request);

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

async function getAllRemoved(req, res, next) {
  try {
    const request = {
      username: req.query.username,
      removedStatus: true,
      page: req.query.page,
      size: req.query.size,
    };

    const result = await UserServices.getAll(request);

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

async function getMyProfile(req, res, next) {
  try {
    const userId = req.user.userId;

    const result = await UserServices.get(userId);

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function getAllActivities(req, res, next) {
  try {
    const request =
      req.query.startDate || req.query.endDate
        ? {
            userId: req.query.userId,
            activity: req.query.activity,
            date: {
              startDate: req.query.startDate,
              endDate: req.query.endDate,
            },
            page: req.query.page,
            size: req.query.size,
          }
        : {
            userId: req.query.userId,
            activity: req.query.activity,
            page: req.query.page,
            size: req.query.size,
          };

    const result = await UserServices.getActivities(request);

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

async function getMyActivities(req, res, next) {
  try {
    const request =
      req.query.startDate || req.query.endDate
        ? {
            userId: req.user.userId,
            activity: req.query.activity,
            date: {
              startDate: req.query.startDate,
              endDate: req.query.endDate,
            },
            page: req.query.page,
            size: req.query.size,
          }
        : {
            userId: req.user.userId,
            activity: req.query.activity,
            page: req.query.page,
            size: req.query.size,
          };

    const result = await UserServices.getActivities(request);

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { body } = req;

    await UserServices.create(body, req.user.userId);

    return res.status(201).json({
      data: "User berhasil diregistrasi.",
    });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const request = {
      userId: req.params.userId,
      roleId: req.body.roleId,
      username: req.body.username,
      password: req.body.password,
    };

    const result = await UserServices.update(request, req.user.userId);

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const request = {
      userId: req.user.userId,
      roleId: req.body.roleId,
      username: req.body.username,
      password: req.body.password,
    };

    const result = await UserServices.update(request, req.user.userId);

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.params.userId;

    await UserServices.remove(userId, req.user.userId);

    res.status(200).json({
      data: "Ok.",
    });
  } catch (e) {
    next(e);
  }
}

async function restore(req, res, next) {
  try {
    const userId = req.params.userId;

    await UserServices.restore(userId, req.user.userId);

    res.status(200).json({
      data: "Ok.",
    });
  } catch (e) {
    next(e);
  }
}

async function getLogs(req, res, next) {
  try {
    const request =
      req.query.startDate || req.query.endDate
        ? {
            userId: req.query.userId,
            changeType: req.query.changeType,
            date: {
              startDate: req.query.startDate,
              endDate: req.query.endDate,
            },
            page: req.query.page,
            size: req.query.size,
          }
        : {
            userId: req.query.customerId,
            changeType: req.query.changeType,
            page: req.query.page,
            size: req.query.size,
          };

    const result = await UserServices.getLogs(request);

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

export default {
  get,
  getAll,
  update,
  create,
  remove,
  restore,
  getAllRemoved,
  getAllActivities,
  getMyActivities,
  getMyProfile,
  updateMyProfile,
  getLogs,
};
