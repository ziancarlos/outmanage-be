import RoleServices from "../services/RoleServices.js";

async function getAll(req, res, next) {
  try {
    const result = await RoleServices.getAll();

    return res.status(200).send({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function getPermissionsRelated(req, res, next) {
  try {
    const roleId = req.params.roleId;

    const result = await RoleServices.getPermissionsRelated(roleId);

    return res.status(200).send({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function getPermissions(req, res, next) {
  try {
    const roleId = req.params.roleId;

    const result = await RoleServices.getPermissions(roleId);

    return res.status(200).send({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function getMyPermissions(req, res, next) {
  try {
    const roleId = req.user.roleId;

    const result = await RoleServices.getPermissions(roleId);

    return res.status(200).send({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function updatePermissions(req, res, next) {
  try {
    const roleId = req.params.roleId;
    const body = req.body;

    const request = {
      roleId,
      permissions: body,
    };

    await RoleServices.updatePermissions(request);

    return res.status(200).send({
      data: "Berhasil mengubah relasi izin",
    });
  } catch (e) {
    next(e);
  }
}

export default {
  getAll,
  getMyPermissions,
  getPermissions,
  getPermissionsRelated,
  updatePermissions,
};
