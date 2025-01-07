import {
  getAllValidation,
  getValidation,
} from "../validations/UserValidations.js";
import validate from "../validations/validation.js";
import prismaClient from "../utils/Database.js";
import ResponseError from "../errors/ResponseError.js";
import sanitize from "sanitize-html";
import RoleServices from "./RoleServices.js";

async function getUserByConstraints(
  where,
  select = null,
  status = 404,
  message = "User tidak ditemukan",
  check = (user, status, message) => {
    if (!user) {
      throw new ResponseError(status, message);
    }
  }
) {
  const user = await prismaClient.user.findFirst({
    where,

    select: select
      ? select
      : {
          userId: true,
          roleId: true,
          username: true,
          password: true,
          deletedAt: true,
        },
  });

  check(user, status, message);

  return user;
}

async function createUserLog(
  userId,
  targetedUserId,
  changeType,
  oldValue = null,
  newValue
) {
  return await prismaClient.userLog.create({
    data: {
      userId,
      targetedUserId,
      changeType,
      oldValue,
      newValue,
    },
  });
}

async function get(userIdInput) {
  validate(getValidation, userIdInput);

  const {
    userId,
    username,
    Role: role,
    deletedAt,
  } = await getUserByConstraints(
    {
      userId: userIdInput,
    },
    {
      userId: true,
      username: true,
      Role: {
        select: {
          roleId: true,
          name: true,
        },
      },

      deletedAt: true,
    }
  );

  return {
    userId,
    username,
    role: {
      roleId: role.roleId,
      name: role.name,
    },
    deletedAt,
  };
}

async function getAll(request) {
  let { username, removedStatus, page, size } = validate(
    getAllValidation,
    request
  );

  username = sanitize(username);

  const skip = (page - 1) * size;

  const filtersAnd = [
    {
      deletedAt: removedStatus === false ? null : { not: null },
    },
  ];

  if (username) {
    filtersAnd.push({
      username: {
        contains: username,
      },
    });
  }

  const users = await prismaClient.user.findMany({
    where: {
      AND: [...filtersAnd],
    },
    select: {
      userId: true,
      username: true,
      role: {
        select: {
          roleId: true,
          name: true,
        },
      },
      deletedAt: true,
    },
    orderBy: {
      userId: "desc",
    },
    take: size,
    skip,
  });

  const totalUsers = await prismaClient.user.count({
    where: {
      AND: [...filtersAnd],
    },
  });

  return {
    data: users.map(({ userId, username, role, deletedAt }) => ({
      userId,
      username,
      role: {
        roleId: role.roleId,
        name: role.name,
      },
      deletedAt,
    })),
    paging: {
      page,
      totalItem: totalUsers,
      totalPage: Math.ceil(totalUsers / size),
    },
  };
}

async function getActivities(request) {
  const { userId, activity, date, page, size } = validate(
    getActivitiesValidation,
    request
  );

  const skip = (page - 1) * size;

  const filters = [];

  if (userId) {
    await getUserByConstraints(where);

    filters.push({
      User: {
        userId: userId,
      },
    });
  }

  if (activity) {
    filters.push({
      activityType: activity === "login_berhasil" ? 1 : 0,
    });
  }

  if (date) {
    if (!date.startDate) {
      throw new ResponseError(
        400,
        "Tanggal mulai dan Tanggal selesai diperlukan."
      );
    }

    if (!date.endDate) {
      throw new ResponseError(
        400,
        "Tanggal mulai dan Tanggal selesai diperlukan."
      );
    }

    if (new Date(date.startDate) > new Date(date.endDate)) {
      throw new ResponseError(
        400,
        "Tanggal Mulai tidak boleh lebih lambat dari Tanggal Selesai."
      );
    }

    const startDate = new Date(date.startDate);
    startDate.setHours(0, 0, 0, 0); // Set time to start of the day

    const endDate = new Date(date.endDate);
    endDate.setHours(23, 59, 59); // Set time to end of the day

    filters.push({
      createdAt: {
        gte: startDate.toISOString(), // Convert to ISO string
        lte: endDate.toISOString(), // Convert to ISO string
      },
    });
  }

  const activities = await prismaClient.userActivityLog.findMany({
    where: {
      AND: filters,
    },

    select: {
      userActivityLogId: true,
      User: {
        select: {
          userId: true,
          username: true,
        },
      },
      ipAddress: true,
      activityType: true,
      createdAt: true,
    },

    orderBy: {
      userActivityLogId: "desc",
    },

    take: size,
    skip,
  });

  const totalActivities = await prismaClient.userActivityLog.count({
    where: {
      AND: filters,
    },
  });

  return {
    data: activities.map(
      ({
        userActivityLogId,
        User: user,
        ipAddress,
        activityType,
        createdAt,
      }) => {
        return {
          userActivityLogId,
          user: user
            ? {
                userId: user.userId,
                username: user.username,
              }
            : null,
          activityType,
          ipAddress,
          createdAt,
        };
      }
    ),
    paging: {
      page,
      totalItem: totalActivities,
      totalPage: Math.ceil(totalActivities / size),
    },
  };
}

async function create(req, userId) {
  let { username, password, roleId } = validate(createValidation, req);

  username = sanitize(username);

  await getUserByConstraints(
    {
      username,
    },
    null,
    "409",
    "Nama pengguna sudah digunakan.",
    () => (user, status, message) => {
      if (user) {
        throw new ResponseError(status, message);
      }
    }
  );

  await RoleServices.getRoleByConstraints(
    { roleId },
    null,
    404,
    "Peran tidak ditemukkan"
  );

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prismaClient.user.create({
    data: {
      username,
      password: hashedPassword,
      role_id: roleId,
    },

    select: {
      userId: true,
      username: true,
      password: true,
      roleId: true,
      deletedAt: true,
    },
  });

  createUserLog(user.userId, userId, "CREATE", null, user);
}

async function update(request, userId) {
  const {
    userId: targetedUserId,
    roleId,
    username,
    password,
  } = validate(updateValidation, request);

  const sanitizedUsername = username ? sanitize(username) : undefined;

  const existingUser = await getUserByConstraints({
    targetedUserId,
  });

  const changes = {};

  if (sanitizedUsername && sanitizedUsername !== existingUser.username) {
    await getUserByConstraints(
      {
        username,
      },
      null,
      "409",
      "Nama pengguna sudah digunakan.",
      () => (user, status, message) => {
        if (user) {
          throw new ResponseError(status, message);
        }
      }
    );
    changes.username = sanitizedUsername;
  }

  if (password) {
    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      changes.password = await bcrypt.hash(password, 10);
    }
  }

  if (roleId && roleId !== existingUser.roleId) {
    await RoleServices.getRoleByConstraints({
      roleId,
    });

    changes.roleId = roleId;
  }

  if (Object.keys(changes).length === 0) {
    throw new ResponseError(409, "Tidak ada perubahan yang teridentifikasi");
  }

  const updatedUser = await prismaClient.user.update({
    where: {
      userId,
    },
    data: changes,
    select: {
      userId: true,
      username: true,
      password: true,
      deletedAt: true,
    },
  });

  createUserLog(userId, targetedUserId, "UPDATE", existingUser, updatedUser);

  return updatedUser;
}

async function remove(userIdInput, userId) {
  const targetedUserId = validate(getValidation, userIdInput);

  const user = await getUserByConstraints({
    targetedUserId,
    deletedAt: { not: null },
  });

  createUserLog(
    userId,
    targetedUserId,
    "UPDATE",
    user,
    await prismaClient.user.update({
      where: {
        userId: targetedUserId,
      },

      data: {
        deletedAt: new Date(),
      },

      select: {
        userId: true,
        username: true,
        password: true,
        deletedAt: true,
      },
    })
  );
}

async function restore(userIdInput, userId) {
  const targetedUserId = validate(getValidation, userIdInput);

  const user = await getUserByConstraints({
    targetedUserId,
    deletedAt: null,
  });

  createUserLog(
    userId,
    targetedUserId,
    "UPDATE",
    user,
    await prismaClient.user.update({
      where: {
        userId: userId,
      },
      data: {
        deletedAt: null,
      },
      select: {
        userId: true,
        username: true,
        password: true,
        deletedAt: true,
      },
    })
  );
}

export default {
  getUserByConstraints,
  get,
  getAll,
  getActivities,
  create,
  update,
  remove,
  restore,
};
