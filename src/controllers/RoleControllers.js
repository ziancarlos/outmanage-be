import RoleServices from "../services/RoleServices.js";

async function get(req, res, next) {
  try {
    const roleId = req.params.roleId;

    const result = await RoleServices.get(roleId);

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

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
    console.log(e);
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

async function create(req, res, next) {
  try {
    const { body } = req;

    await RoleServices.create(body);

    return res.status(201).json({
      data: "Peran berhasil diregistrasi.",
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const request = {
      roleId: req.params.roleId,
      name: req.body.name,
    };

    const result = await RoleServices.update(request);

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    console.log(e);
    console.log(e);
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
    console.log(e);
    next(e);
  }
}

async function updatePermissions(req, res, next) {
  try {
    const roleId = req.params.roleId;

    const request = {
      roleId,
      permissions: req.body.permissions,
    };

    await RoleServices.updatePermissions(request);

    return res.status(200).send({
      data: "Berhasil mengubah relasi izin",
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
}

export default {
  get,
  getAll,
  getMyPermissions,
  getPermissions,
  getPermissionsRelated,
  updatePermissions,
  create,
  update,
};
