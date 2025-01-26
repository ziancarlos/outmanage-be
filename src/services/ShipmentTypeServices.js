import sanitize from "sanitize-html";
import ResponseError from "../errors/ResponseError.js";
import prismaClient from "../utils/Database.js";
import {
  getAllValidation,
  getLogsValidation,
  getValidation,
  createValidation,
  updateValidation,
} from "../validations/ShipmentTypeValidations.js";
import validate from "../validations/Validation.js";

async function getShipmentTypeByConstraints(
  where,
  select = null,
  status = 404,
  message = "Tipe pengiriman tidak ditemukan",
  check = (shipmentType, status, message) => {
    if (!shipmentType) {
      throw new ResponseError(status, message);
    }
  }
) {
  const shipmentType = await prismaClient.shipmentType.findFirst({
    where,

    select: select
      ? select
      : {
          shipmentTypeId: true,
          name: true,
        },
  });

  check(shipmentType, status, message);

  return shipmentType;
}

async function createShipmentTypeLog(
  shipmentTypeId,
  userId,
  changeType,
  oldValue = null,
  newValue
) {
  return await prismaClient.shipmentTypeLog.create({
    data: {
      shipmentTypeId,
      userId,
      changeType,
      oldValue,
      newValue,
    },
  });
}

async function get(shipmentTypeIdInput) {
  let { shipmentTypeId, name } = await getShipmentTypeByConstraints({
    shipmentTypeId: validate(getValidation, shipmentTypeIdInput),
  });

  return {
    shipmentTypeId,
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

  const shipmentTypes = await prismaClient.shipmentType.findMany({
    where: {
      AND: [...filters],
    },
    select: {
      shipmentTypeId: true,
      name: true,
    },
    orderBy: {
      shipmentTypeId: "desc",
    },
    take: size,
    skip,
  });

  const totalShipmentTypes = await prismaClient.shipmentType.count({
    where: {
      AND: [...filters],
    },
  });

  return {
    data: shipmentTypes.map(({ shipmentTypeId, name }) => ({
      shipmentTypeId,
      name,
    })),
    paging: {
      page,
      totalItem: totalShipmentTypes,
      totalPage: Math.ceil(totalShipmentTypes / size),
    },
  };
}

async function getLogs(request) {
  const { shipmentTypeId, changeType, date, page, size } = validate(
    getLogsValidation,
    request
  );

  const skip = (page - 1) * size;

  const filters = [];

  if (shipmentTypeId) {
    await getShipmentTypeByConstraints({
      shipmentTypeId,
    });

    filters.push({
      shipmentTypeId,
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

  const whereClause = filters.length > 0 ? { OR: filters } : {};

  const shipmentTypesLogs = await prismaClient.shipmentTypeLog.findMany({
    select: {
      shipmentTypeLogId: true,
      ShipmentType: {
        select: {
          shipmentTypeId: true,
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
      shipmentTypeLogId: "desc",
    },

    take: size,
    skip,
  });

  const totalShipmentTypesLogs = await prismaClient.shipmentTypeLog.count({
    where: {
      AND: whereClause,
    },
  });

  console.log(shipmentTypesLogs);

  return {
    data: shipmentTypesLogs.map(
      ({
        shipmentTypeLogId,
        ShipmentType: shipmentType,
        User: user,
        changeType,
        oldValue,
        newValue,
        createdAt,
      }) => ({
        shipmentTypeLogId,
        shipmentType: {
          shipmentTypeId: shipmentType.shipmentTypeId,
          name: shipmentType.name,
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
      totalItem: totalShipmentTypesLogs,
      totalPage: Math.ceil(totalShipmentTypesLogs / size),
    },
  };
}

async function create(req, userId) {
  let { name } = validate(createValidation, req);

  name = sanitize(name);

  console.log(userId);
  await getShipmentTypeByConstraints(
    {
      name,
    },
    null,
    400,
    "Nama tipe pengiriman sudah digunakan",
    (shipmentType, status, message) => {
      if (shipmentType) {
        throw new ResponseError(status, message);
      }
    }
  );

  const shipmentType = await prismaClient.shipmentType.create({
    data: {
      name,
    },

    select: {
      shipmentTypeId: true,
      name: true,
    },
  });

  createShipmentTypeLog(
    shipmentType.shipmentTypeId,
    userId,
    "CREATE",
    null,
    shipmentType
  );
}

async function update(request, userId) {
  const { shipmentTypeId, name } = validate(updateValidation, request);

  const sanitizedName = name ? sanitize(name) : null;

  const exisitingShipmentType = await getShipmentTypeByConstraints({
    shipmentTypeId,
  });

  const changes = {};

  if (sanitizedName && sanitizedName !== exisitingShipmentType.name) {
    await getShipmentTypeByConstraints(
      {
        name: sanitizedName,
      },
      null,
      409,
      "Nama tipe pengiriman sudah dipakai",
      (shipmentType, status, message) => {
        if (shipmentType) {
          throw new ResponseError(status, message);
        }
      }
    );

    changes.name = sanitizedName;
  }

  if (Object.keys(changes).length === 0) {
    throw new ResponseError(409, "Tidak ada perubahan yang teridentifikasi");
  }

  const updatedShipmentType = await prismaClient.shipmentType.update({
    where: {
      shipmentTypeId,
    },
    data: changes,
    select: {
      shipmentTypeId: true,
      name: true,
    },
  });

  createShipmentTypeLog(
    shipmentTypeId,
    userId,
    "UPDATE",
    exisitingShipmentType,
    updatedShipmentType
  );

  return updatedShipmentType;
}

export default {
  get,
  getAll,
  getLogs,
  create,
  update,
  getShipmentTypeByConstraints,
};
