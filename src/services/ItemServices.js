import sanitize from "sanitize-html";
import ResponseError from "../errors/ResponseError.js";
import prismaClient from "../utils/Database.js";
import {
  getAllValidation,
  getLogsValidation,
  getValidation,
  createValidation,
  updateValidation,
} from "../validations/ItemValidations.js";
import validate from "../validations/Validation.js";

async function getItemByConstraints(
  where,
  select = null,
  status = 404,
  message = "Barang tidak ditemukan",
  check = (item, status, message) => {
    if (!item) {
      throw new ResponseError(status, message);
    }
  }
) {
  const item = await prismaClient.item.findFirst({
    where,

    select: select
      ? select
      : {
          itemId: true,
          name: true,
        },
  });

  check(item, status, message);

  return item;
}

async function createItemLog(
  itemId,
  userId,
  changeType,
  oldValue = null,
  newValue
) {
  return await prismaClient.itemLog.create({
    data: {
      itemId,
      userId,
      changeType,
      oldValue,
      newValue,
    },
  });
}

async function get(itemIdInput) {
  let { itemId, name } = await getItemByConstraints({
    itemId: validate(getValidation, itemIdInput),
  });

  return {
    itemId,
    name,
  };
}

async function getAll(request) {
  let { name, page, size } = validate(getAllValidation, request);

  name = sanitize(name);

  const skip = (page - 1) * size;

  const filters = [];

  if (name) {
    filters.push({
      name: {
        contains: name,
      },
    });
  }

  const whereClause = filters.length > 0 ? { AND: filters } : {};

  const items = await prismaClient.item.findMany({
    where: whereClause,
    select: {
      itemId: true,
      name: true,
    },
    orderBy: {
      itemId: "desc",
    },
    take: size,
    skip,
  });

  const totalItems = await prismaClient.item.count({
    where: whereClause,
  });

  return {
    data: items.map(({ itemId, name }) => ({
      itemId,
      name,
    })),
    paging: {
      page,
      totalItem: totalItems,
      totalPage: Math.ceil(totalItems / size),
    },
  };
}

async function getLogs(request) {
  const { itemId, changeType, date, page, size } = validate(
    getLogsValidation,
    request
  );

  const skip = (page - 1) * size;

  const filters = [];

  if (itemId) {
    await getItemByConstraints({
      itemId,
    });

    filters.push({
      itemId,
    });
  }

  if (changeType) {
    filters.push({
      changeType,
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
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date.endDate);

    endDate.setHours(23, 59, 59, 999);

    filters.push({
      createdAt: {
        gte: startDate.toISOString(),
        lte: endDate.toISOString(),
      },
    });
  }

  const whereClause = filters.length > 0 ? { AND: filters } : {};

  const itemsLogs = await prismaClient.itemLog.findMany({
    select: {
      itemLogId: true,
      itemId: true,
      Item: {
        select: {
          itemId: true,
          name: true,
        },
      },
      User: {
        select: {
          userId: true,
          username: true,
        },
      },
      changeType: true,
      oldValue: true,
      newValue: true,
      createdAt: true,
    },

    where: {
      AND: whereClause,
    },

    orderBy: {
      itemLogId: "desc",
    },

    take: size,
    skip,
  });

  const totalItemsLogs = await prismaClient.itemLog.count({
    where: {
      AND: whereClause,
    },
  });

  return {
    data: itemsLogs.map(
      ({
        itemLogId,
        Item: item,
        User: user,
        changeType,
        oldValue,
        newValue,
        createdAt,
      }) => ({
        itemLogId,
        item: {
          itemId: item.itemId,
          name: item.name,
        },
        user: {
          userId: user.userId,
          username: user.username,
        },
        changeType,
        oldValue,
        newValue,
        createdAt,
      })
    ),

    paging: {
      page,
      totalItem: totalItemsLogs,
      totalPage: Math.ceil(totalItemsLogs / size),
    },
  };
}

async function create(req, userId) {
  let { name } = validate(createValidation, req);

  name = sanitize(name);
  name = name.toUpperCase();

  await getItemByConstraints(
    {
      name,
    },
    null,
    400,
    "Nama barang sudah digunakan",
    (item, status, message) => {
      if (item) {
        throw new ResponseError(status, message);
      }
    }
  );

  const item = await prismaClient.item.create({
    data: {
      name,
    },

    select: {
      itemId: true,
      name: true,
    },
  });

  createItemLog(item.itemId, userId, "CREATE", null, item);
}

async function update(request, userId) {
  const { itemId, name } = validate(updateValidation, request);

  let sanitizedName = name ? sanitize(name) : null;
  sanitizedName = sanitizedName.toUpperCase();

  const exisitingItem = await getItemByConstraints({
    itemId,
  });

  const changes = {};

  if (sanitizedName && sanitizedName !== exisitingItem.name) {
    await getItemByConstraints(
      {
        name: sanitizedName,
      },
      null,
      409,
      "Nama barang sudah digunakan",
      (item, status, message) => {
        if (item) {
          throw new ResponseError(status, message);
        }
      }
    );

    changes.name = sanitizedName;
  }

  if (Object.keys(changes).length === 0) {
    throw new ResponseError(409, "Tidak ada perubahan yang teridentifikasi");
  }

  const updatedItem = await prismaClient.item.update({
    where: {
      itemId,
    },
    data: changes,
    select: {
      itemId: true,
      name: true,
    },
  });

  createItemLog(itemId, userId, "UPDATE", exisitingItem, updatedItem);

  return updatedItem;
}

export default {
  getItemByConstraints,
  get,
  getAll,
  getLogs,
  create,
  update,
};
