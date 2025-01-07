import prismaClient from "../utils/Database.js";
import ResponseError from "../errors/ResponseError.js";
import validate from "../validations/validation.js";
import {
  getValidation,
  createValidation,
  updateValidation,
  updatePermissionsValidation,
} from "../validations/RoleValidations.js";

async function getRoleByConstraints(
  where,
  select = null,
  status = 404,
  message = "Peran tidak ditemukan",
  check = (role, status, message) => {
    if (!role) {
      throw new ResponseError(status, message);
    }
  }
) {
  const role = await prismaClient.role.findUnique({
    where,

    select: select
      ? select
      : {
          roleId: true,
          name: true,
          description: true,
        },
  });

  check(role, status, message);

  return role;
}

async function getAll() {
  const roles = await prismaClient.role.findMany({
    orderBy: {
      roleId: "desc",
    },

    select: {
      roleId: true,
      name: true,
    },
  });

  return roles.map((role) => ({
    roleId: role.roleId,
    name: role.name,
  }));
}

async function create(req) {
  let { name } = validate(createValidation, req);

  name = sanitize(name);

  await getRoleByConstraints(
    {
      name,
    },
    null,
    400,
    "Nama peran sudah digunakan",
    (role, status, message) => {
      if (role) {
        throw new ResponseError(status, message);
      }
    }
  );

  await prismaClient.role.create({
    data: {
      name,
    },
  });
}

async function update(request) {
  const { roleId, name } = validate(updateValidation, request);

  const sanitizedName = name ? sanitize(name) : null;

  const exisitingRole = await getRoleByConstraints({
    roleId,
  });

  const changes = {};

  if (sanitizedName && sanitizedName !== exisitingRole.name) {
    await getRoleByConstraints(
      {
        name: sanitizedName,
      },
      null,
      409,
      "Nama peran sudah dipakai",
      (role, status, message) => {
        if (role) {
          throw new ResponseError(status, message);
        }
      }
    );

    changes.name = sanitizedName;
  }

  if (Object.keys(changes).length === 0) {
    throw new ResponseError(409, "Tidak ada perubahan yang teridentifikasi");
  }

  const updatedCustomer = await prismaClient.role.update({
    where: {
      roleId,
    },
    data: changes,
    select: {
      roleId: true,
      name: true,
    },
  });

  return updatedCustomer;
}

async function getPermissionsRelated(roleIdInput) {
  const roleId = validate(getValidation, roleIdInput);

  await getRoleByConstraints({
    roleId,
  });

  const permissions = await prismaClient.$queryRawUnsafe(
    `SELECT p.permissionId, p.name,
         CASE 
             WHEN rp.roleId IS NOT NULL THEN 1
             ELSE 0
         END AS related
  FROM permissions p
  LEFT JOIN roles_has_permissions rp ON p.permissionId = rp.permissionId AND rp.roleId = ?`,
    roleId
  );

  return permissions.map(({ permissionId, name, related }) => ({
    permissionId,
    name,
    related,
  }));
}

async function getPermissions(roleIdInput) {
  const roleId = validate(getValidation, roleIdInput);

  const permissions = await getRoleByConstraints(
    {
      roleId,
    },
    {
      Permission: {
        select: {
          permissionId: true,
          name: true,
        },
      },
    }
  );

  return permissions.Permission.map(({ permissionId, name }) => ({
    permissionId,
    name,
  }));
}

async function updatePermissions(req) {
  const { roleId, permissions } = validate(updatePermissionsValidation, req);

  await getRoleByConstraints({
    roleId,
  });

  const permissionIds = permissions.map((p) => p.permissionId);

  const dbPermissions = await prisma.permission.findMany({
    where: {
      permissionId: { in: permissionIds },
    },
  });

  const dbPermissionIds = dbPermissions.map((p) => p.permissionId);

  const missingPermissions = permissionIds.filter(
    (id) => !dbPermissionIds.includes(id)
  );
  if (missingPermissions.length > 0) {
    throw new ResponseError(
      404,
      `Izin tidak ditemukkan: ${missingPermissions.join(", ")}`
    );
  }

  const seenPermissionIds = new Set();
  for (const permission of permissions) {
    if (seenPermissionIds.has(permission.permissionId)) {
      throw new ResponseError(
        400,
        `Izin yang terduplikasi: ${permission.permissionId}`
      );
    }
    seenPermissionIds.add(permission.permissionId);
  }

  return await prismaClient.$transaction(async (prisma) => {
    for (const permission of permissions) {
      const { permissionId, related } = permission;

      if (related === 1) {
        const existingRolePermission = await prisma.rolePermission.findFirst({
          where: {
            roleId,
            permissionId,
          },
        });

        if (!existingRolePermission) {
          await prisma.rolePermission.create({
            data: {
              roleId,
              permissionId,
            },
          });
        }
      } else {
        await prisma.rolePermission.deleteMany({
          where: {
            roleId,
            permissionId,
          },
        });
      }
    }
  });
}

export default {
  getRoleByConstraints,
  getAll,
  create,
  update,
  getPermissionsRelated,
  getPermissions,
  updatePermissions,
};
