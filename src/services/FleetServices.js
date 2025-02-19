import sanitize from "sanitize-html";
import prismaClient from "../utils/Database.js";
import {
  getAllValidation,
  getLogsValidation,
  getValidation,
  createValidation,
  updateValidation,
} from "../validations/FleetValidations.js";
import ResponseError from "../errors/ResponseError.js";
import validate from "../validations/Validation.js";

async function getFleetByConstraints(
  where,
  select = null,
  status = 404,
  message = "Armada tidak ditemukan",
  check = (fleet, status, message) => {
    if (!fleet) {
      throw new ResponseError(status, message);
    }
  }
) {
  const fleet = await prismaClient.fleet.findFirst({
    where,

    select: select
      ? select
      : {
          fleetId: true,
          model: true,
          licensePlate: true,
        },
  });

  check(fleet, status, message);

  return fleet;
}

async function createFleetLog(
  fleetId,
  userId,
  changeType,
  oldValue = null,
  newValue
) {
  return await prismaClient.fleetLog.create({
    data: {
      fleetId,
      userId,
      changeType,
      oldValue,
      newValue,
    },
  });
}

async function get(fleetIdInput) {
  let { fleetId, model, licensePlate } = await getFleetByConstraints({
    fleetId: validate(getValidation, fleetIdInput),
  });

  return {
    fleetId,
    model,
    licensePlate,
  };
}

async function getAll(request) {
  let { model, licensePlate, page, size } = validate(getAllValidation, request);

  model = sanitize(model);
  licensePlate = sanitize(licensePlate);

  const skip = (page - 1) * size;

  const filters = [];

  if (model) {
    filters.push({
      model: {
        contains: model,
      },
    });
  }

  if (licensePlate) {
    filters.push({
      licensePlate: {
        contains: licensePlate,
      },
    });
  }

  // If no filters are applied, return all records
  const whereClause = filters.length > 0 ? { OR: filters } : {};

  const fleets = await prismaClient.fleet.findMany({
    where: whereClause,
    select: {
      fleetId: true,
      model: true,
      licensePlate: true,
    },
    orderBy: {
      fleetId: "desc",
    },
    take: size,
    skip,
  });

  const totalFleets = await prismaClient.fleet.count({
    where: whereClause,
  });

  return {
    data: fleets.map(({ fleetId, model, licensePlate }) => ({
      fleetId,
      model,
      licensePlate,
    })),
    paging: {
      page,
      totalItem: totalFleets,
      totalPage: Math.ceil(totalFleets / size),
    },
  };
}

async function getLogs(request) {
  const { fleetId, changeType, date, page, size } = validate(
    getLogsValidation,
    request
  );

  const skip = (page - 1) * size;

  const filters = [];

  if (fleetId) {
    await getFleetByConstraints({
      fleetId,
    });

    filters.push({
      fleetId,
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

  const fleetsLogs = await prismaClient.fleetLog.findMany({
    select: {
      fleetLogId: true,
      Fleet: {
        select: {
          fleetId: true,
          model: true,
          licensePlate: true,
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
      fleetLogId: "desc",
    },

    take: size,
    skip,
  });

  const totalFleetsLogs = await prismaClient.fleetLog.count({
    where: {
      AND: whereClause,
    },
  });

  return {
    data: fleetsLogs.map(
      ({
        fleetLogId,
        Fleet: fleet,
        User: user,
        changeType,
        oldValue,
        newValue,
        createdAt,
      }) => ({
        fleetLogId,
        fleet: {
          fleetId: fleet.fleetId,
          model: fleet.model,
          licensePlate: fleet.licensePlate,
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
      totalItem: totalFleetsLogs,
      totalPage: Math.ceil(totalFleetsLogs / size),
    },
  };
}

async function create(req, userId) {
  let { model, licensePlate } = validate(createValidation, req);

  model = sanitize(model);
  licensePlate = sanitize(licensePlate);

  model = model.toUpperCase();

  await getFleetByConstraints(
    {
      licensePlate,
    },
    null,
    400,
    "Nomor polisi armada sudah digunakan",
    (fleet, status, message) => {
      if (fleet) {
        throw new ResponseError(status, message);
      }
    }
  );

  const fleet = await prismaClient.fleet.create({
    data: {
      model,
      licensePlate,
    },

    select: {
      fleetId: true,
      model: true,
      licensePlate: true,
    },
  });

  createFleetLog(fleet.fleetId, userId, "CREATE", null, fleet);
}

async function update(request, userId) {
  const { fleetId, model, licensePlate } = validate(updateValidation, request);

  let sanitizedModel = model ? sanitize(model) : null;
  const sanitizedLicensePlate = licensePlate ? sanitize(licensePlate) : null;

  sanitizedModel = sanitizedModel.toUpperCase();

  const exisitingFleet = await getFleetByConstraints({
    fleetId,
  });

  const changes = {};

  if (sanitizedModel && sanitizedModel !== exisitingFleet.model) {
    await getFleetByConstraints(
      {
        model: sanitizedModel,
      },
      null,
      409,
      "Model armada sudah digunakan",
      (fleet, status, message) => {
        if (fleet) {
          throw new ResponseError(status, message);
        }
      }
    );

    changes.model = sanitizedModel;
  }

  if (
    sanitizedLicensePlate &&
    sanitizedLicensePlate !== exisitingFleet.licensePlate
  ) {
    await getFleetByConstraints(
      {
        licensePlate: sanitizedLicensePlate,
      },
      null,
      409,
      "Nomor polisi armada sudah digunakan",
      (fleet, status, message) => {
        if (fleet) {
          throw new ResponseError(status, message);
        }
      }
    );

    changes.licensePlate = sanitizedLicensePlate;
  }

  if (Object.keys(changes).length === 0) {
    throw new ResponseError(409, "Tidak ada perubahan yang teridentifikasi");
  }

  const updatedFleet = await prismaClient.fleet.update({
    where: {
      fleetId,
    },
    data: changes,
    select: {
      fleetId: true,
      model: true,
      licensePlate: true,
    },
  });

  createFleetLog(fleetId, userId, "UPDATE", exisitingFleet, updatedFleet);

  return updatedFleet;
}

export default {
  getFleetByConstraints,
  get,
  getAll,
  getLogs,
  create,
  update,
};
