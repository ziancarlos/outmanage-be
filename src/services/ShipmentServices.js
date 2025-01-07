import ResponseError from "../errors/ResponseError.js";
import prismaClient from "../utils/Database.js";
import validate from "../validations/validation.js";
import ShipmentTypeService from "./ShipmentTypeServices.js";
import {
  getValidation,
  getAllValidation,
  getLogsValidation,
  createValidation,
  updateValidation,
} from "../validations/ShipmentValidations.js";
import { updateStatusValidation } from "../validations/ShipmentValidations.js";

async function getShipmentByConstraints(
  where,
  select = null,
  status = 404,
  message = "Pengiriman tidak ditemukan",
  check = (shipment, status, message) => {
    if (!shipment) {
      throw new ResponseError(status, message);
    }
  }
) {
  const shipment = await prismaClient.shipment.findFirst({
    where,

    select: select
      ? select
      : {
          shipmentId: true,
          shipmentTypeId: true,
          status: true,
          licensePlate: true,
          address: true,
          internalNotes: true,
        },
  });

  check(shipment, status, message);

  return shipment;
}

async function createShipmentLog(
  shipmentId,
  userId,
  changeType,
  details,
  prisma = null
) {
  const prismaInstance = prisma || prismaClient;

  return prismaInstance.shipmentLog.create({
    data: {
      shipmentId,
      userId,
      changeType,
      details,
    },
  });
}

async function get(shipmentIdInput) {
  let {
    shipmentId,
    ShipmentType: shipmentType,
    ShipmentItems: shipmentItems,
    status,
    licensePlate,
    address,
    internalNotes,
  } = await getShipmentByConstraints(
    {
      shipmentId: validate(getValidation, shipmentIdInput),
    },
    {
      shipmentId: true,
      ShipmentType: {
        select: {
          shipmentTypeId: true,
          name: true,
        },
      },
      ShipmentItems: {
        select: {
          shipmentHasItemId: true,
          Item: {
            select: {
              itemId: true,
              name: true,
            },
          },
          quantity: true,
        },
      },
      status: true,
      licensePlate: true,
      address: true,
      internalNotes: true,
    }
  );

  return {
    shipmentId,
    shipmentType: {
      shipmentTypeId: shipmentType.shipmentTypeId,
      name: shipmentType.name,
    },
    items: {
      ...shipmentItems.map(({ shipmentHasItemId, Item: item, quantity }) => {
        return {
          shipmentHasItemId,
          item: {
            itemId: item.itemId,
            name: item.name,
          },
          quantity,
        };
      }),
    },
    status,
    licensePlate,
    address,
    internalNotes,
  };
}

async function getAll(request) {
  let { shipmentTypeId, status, licensePlate, address, page, size } = validate(
    getAllValidation,
    request
  );

  licensePlate = sanitize(licensePlate);
  address = sanitize(address);

  const skip = (page - 1) * size;

  const filtersAnd = []; // For `AND` conditions
  const filtersOr = []; // For `OR` conditions

  if (licensePlate) {
    filtersOr.push({
      licensePlate: {
        contains: licensePlate,
      },
    });
  }

  if (address) {
    filtersOr.push({
      address: {
        contains: address,
      },
    });
  }

  if (status) {
    filtersAnd.push({ status }); // Add to `AND` filters
  }

  if (shipmentTypeId) {
    await ShipmentTypeService.getShipmentTypeByConstraints({
      shipmentTypeId,
    });

    filtersAnd.push({ shipmentTypeId }); // Add to `AND` filters
  }

  const whereClause = {
    AND: [...filtersAnd, ...(filtersOr.length > 0 ? [{ OR: filtersOr }] : [])],
  };

  const shipments = await prismaClient.shipment.findMany({
    where: whereClause,

    select: {
      shipmentId: true,
      ShipmentType: {
        select: {
          shipmentTypeId: true,
          name: true,
        },
      },
      status: true,
      licensePlate: true,
      address: true,
      internalNotes: true,
    },
    orderBy: {
      shipmentId: "desc",
    },
    take: size,
    skip,
  });

  const totalShipments = await prismaClient.shipment.count({
    where: whereClause,
  });

  return {
    data: shipments.map(
      ({
        shipmentId,
        ShipmentType: shipmentType,
        status,
        licensePlate,
        address,
        internalNotes,
      }) => ({
        shipmentId,
        shipmentType: {
          shipmentTypeId: shipmentType.shipmentTypeId,
          name: shipmentType.name,
        },
        status,
        licensePlate,
        address,
        internalNotes,
      })
    ),
    paging: {
      page,
      totalItem: totalShipments,
      totalPage: Math.ceil(totalShipments / size),
    },
  };
}

async function getLogs(request) {
  const { shipmentId, changeType, details, date, page, size } = validate(
    getLogsValidation,
    request
  );

  const skip = (page - 1) * size;

  const filters = [];

  if (shipmentId) {
    await getShipmentByConstraints({
      shipmentId,
    });

    filters.push({
      shipmentId,
    });
  }

  if (changeType) {
    filters.push({
      changeType,
    });
  }

  if (details) {
    filters.push({
      details: {
        contains: details,
      },
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

  const shipmentsLogs = await prismaClient.shipmentLog.findMany({
    select: {
      shipmentId: true,
      Shipment: {
        select: {
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
      details: true,
      createdAt: true,
    },

    where: {
      AND: whereClause,
    },

    orderBy: {
      shipmentLogId: "desc",
    },

    take: size,
    skip,
  });

  const totalShipmentsLogs = await prismaClient.shipmentLog.count({
    where: {
      AND: whereClause,
    },
  });

  return {
    data: shipmentsLogs.map(
      ({
        shipmentLogId,
        Shipment: shipment,
        User: user,
        changeType,
        details,
        createdAt,
      }) => ({
        shipmentLogId,
        shipment: {
          shipmentId: shipment.shipmentId,
          name: shipment.name,
        },
        user: {
          userId: user.userId,
          username: user.username,
        },
        changeType,
        details,
        createdAt,
      })
    ),

    paging: {
      page,
      totalItem: totalShipmentsLogs,
      totalPage: Math.ceil(totalShipmentsLogs / size),
    },
  };
}

async function create(request, userId) {
  let { shipmentTypeId, licensePlate, address, internalNotes, items } =
    validate(createValidation, request);

  licensePlate = sanitize(licensePlate) || null;
  address = sanitize(address) || null;
  internalNotes = sanitize(internalNotes) || null;

  await ShipmentTypeService.getShipmentTypeByConstraints({ shipmentTypeId });

  const itemIds = items.map((item) => item.itemId);
  const itemQuantities = new Map(
    items.map((item) => [item.itemId, item.quantity])
  );

  const existingItems = await prisma.item.findMany({
    where: {
      itemId: { in: itemIds },
    },
    select: { itemId: true },
  });

  const existingItemIds = new Set(existingItems.map((item) => item.itemId));
  const missingItemIds = itemIds.filter((id) => !existingItemIds.has(id));

  if (missingItemIds.length > 0) {
    throw new ResponseError(
      404,
      `Barang yang Anda masukkan tidak ditemukan: ${missingItemIds.join(", ")}.`
    );
  }

  return await prismaClient.$transaction(async (prisma) => {
    // Create the shipment record
    const { shipmentId, shipmentTypeId, licensePlate, address, internalNotes } =
      await prisma.shipment.create({
        data: {
          shipmentTypeId,
          licensePlate,
          address,
          internalNotes,
        },
      });

    const shipmentItemsData = Array.from(itemQuantities.entries()).map(
      ([itemId, quantity]) => {
        createShipmentLog(
          shipmentId,
          userId,
          "CREATE",
          `Barang I${itemId} dengan kuantitas ${quantity} telah ditambahkan ke pengiriman ini.`,
          prisma
        );
        return {
          shipmentId: shipmentId,
          itemId,
          quantity,
        };
      }
    );

    await prisma.shipmentItems.createMany({
      data: shipmentItemsData,
      skipDuplicates: true,
    });

    createShipmentLog(
      shipmentId,
      userId,
      "CREATE",
      `Tipe Pengeluaran dengan ST${shipmentTypeId}. Plat kendaraan yang menjemput: ${licensePlate}. Alamat pengiriman: ${address}. Catatan internal: ${internalNotes}.`,
      prisma
    );
  });
}

async function update(request, userId) {
  let {
    shipmentId,
    shipmentTypeId,
    licensePlate,
    address,
    internalNotes,
    items,
  } = validate(updateValidation, request);

  licensePlate = sanitize(licensePlate) || null;
  address = sanitize(address) || null;
  internalNotes = sanitize(internalNotes) || null;

  const initialShipment = await getShipmentByConstraints(
    {
      shipmentId,
    },
    {
      shipmentId: true,
      shipmentTypeId: true,
      ShipmentItems: {
        select: {
          shipmentHasItemId: true,
          itemId: true,
          quantity: true,
        },
      },
      status: true,
      licensePlate: true,
      address: true,
      internalNotes: true,
    }
  );

  // Check if all items exist in the database
  await checkItemsExistence(items);

  // Get the changes
  const changes = getChanges(
    initialShipment,
    shipmentTypeId,
    licensePlate,
    address,
    internalNotes,
    items
  );

  if (Object.keys(changes).length === 0) {
    throw new ResponseError(409, "Tidak ada perubahan yang teridentifikasi");
  }

  return await prismaClient.$transaction(async (prisma) => {
    await updateShipmentDetails(
      shipmentId,
      changes,
      initialShipment,
      userId,
      prisma
    );

    await handleItemUpdates(shipmentId, changes, userId, prisma);
  });
}

async function updateStatus(req, userId) {
  const { shipmentId, status } = validate(updateStatusValidation, req);
  const shipment = await getShipmentByConstraints({ shipmentId });

  const validTransitions = {
    UNPROCESSED: "PROCESSED",
    PROCESSED: "COMPLETED",
  };

  if (shipment.status === "COMPLETED") {
    throw new ResponseError(400, `Status pengiriman sudah selesai.`);
  }

  if (validTransitions[shipment.status] !== status) {
    throw new ResponseError(
      400,
      `Transisi status tidak valid dari ${shipment.status} menjadi ${status}`
    );
  }

  createShipmentLog(
    shipmentId,
    userId,
    "UPDATE",
    `Berhasil mengubah status pengiriman dari ${shipment.status} menjadi ${status}`
  );

  return await prismaClient.shipment.update({
    where: { shipmentId },
    data: { status },
  });
}

function getChanges(
  initialShipment,
  shipmentTypeId,
  licensePlate,
  address,
  internalNotes,
  items
) {
  const changes = {};

  // Check for changes in shipment details
  if (shipmentTypeId && shipmentTypeId !== initialShipment.shipmentTypeId) {
    changes.shipmentTypeId = shipmentTypeId;
  }
  if (licensePlate && licensePlate !== initialShipment.licensePlate) {
    changes.licensePlate = licensePlate;
  }
  if (address && address !== initialShipment.address) {
    changes.address = address;
  }
  if (internalNotes && internalNotes !== initialShipment.internalNotes) {
    changes.internalNotes = internalNotes;
  }

  const currentItemIds = items.map((item) => item.itemId);
  const initialItemMap = new Map(
    initialShipment.ShipmentItems.map((item) => [item.itemId, item])
  );

  const addedItems = [];
  const removedItems = [];
  const quantityChangedItems = [];

  items.forEach((item) => {
    const initialItem = initialItemMap.get(item.itemId);
    if (!initialItem) {
      addedItems.push(item);
    } else if (initialItem.quantity !== item.quantity) {
      quantityChangedItems.push(item);
    }
  });

  initialShipment.ShipmentItems.forEach((item) => {
    if (!currentItemIds.includes(item.itemId)) {
      removedItems.push(item);
    }
  });

  if (
    addedItems.length > 0 ||
    removedItems.length > 0 ||
    quantityChangedItems.length > 0
  ) {
    changes.items = { addedItems, removedItems, quantityChangedItems };
  }

  return changes;
}

async function handleItemUpdates(shipmentId, changes, userId, prisma) {
  if (changes.items) {
    const { addedItems, removedItems, quantityChangedItems } = changes.items;

    if (addedItems.length > 0) {
      const shipmentItemsData = addedItems.map((item) => {
        createShipmentLog(
          shipmentId,
          userId,
          "UPDATE",
          `Telah ditambahkan barang pengiriman I${item.itemId} dengan kuantitas ${item.quantity}`,
          prisma
        );

        return {
          shipmentId,
          itemId: item.itemId,
          quantity: item.quantity,
        };
      });
      await prisma.shipmentItems.createMany({
        data: shipmentItemsData,
        skipDuplicates: true,
      });
    }

    // Handle removed items
    if (removedItems.length > 0) {
      const removedItemIds = removedItems.map((item) => {
        createShipmentLog(
          shipmentId,
          userId,
          "UPDATE",
          `Telah dihapus barang pengiriman I${item.itemId} `,
          prisma
        );

        return item.itemId;
      });
      await prisma.shipmentItems.deleteMany({
        where: {
          shipmentId,
          itemId: { in: removedItemIds },
        },
      });
    }

    // Handle quantity changes
    for (const item of quantityChangedItems) {
      createShipmentLog(
        shipmentId,
        userId,
        "UPDATE",
        `Telah diubah kuantitas barang pengiriman I${item.itemId} `,
        prisma
      );

      await prisma.shipmentItems.update({
        where: {
          shipmentId,
          itemId: item.itemId,
        },
        data: { quantity: item.quantity },
      });
    }
  }
}

async function updateShipmentDetails(
  shipmentId,
  changes,
  initialShipment,
  userId,
  prisma
) {
  if (
    changes.shipmentTypeId ||
    changes.licensePlate ||
    changes.address ||
    changes.internalNotes
  ) {
    await prisma.shipment.update({
      where: { shipmentId },
      data: {
        shipmentTypeId:
          changes.shipmentTypeId || initialShipment.shipmentTypeId,
        licensePlate: changes.licensePlate || initialShipment.licensePlate,
        address: changes.address || initialShipment.address,
        internalNotes: changes.internalNotes || initialShipment.internalNotes,
      },
    });

    createShipmentLog(
      shipmentId,
      userId,
      "UPDATE",
      `Telah diperbarui ${
        changes.shipmentTypeId &&
        `Tipe pengeluaran menjadi ST${changes.shipmentTypeId}.`
      } ${
        changes.licensePlate &&
        `Plat kendaraan yang menjemput menjadi ${changes.licensePlate}.`
      } ${changes.address && `Alamat pengiriman ${changes.address}.`} ${
        changes.internalNotes && `Catatan Internal: ${changes.internalNotes}.`
      }`,
      prisma
    );
  }
}

async function checkItemsExistence(items) {
  const itemIds = items.map((item) => item.itemId);
  const existingItems = await prisma.item.findMany({
    where: { itemId: { in: itemIds } },
    select: { itemId: true },
  });

  const existingItemIds = new Set(existingItems.map((item) => item.itemId));
  const missingItems = items.filter(
    (item) => !existingItemIds.has(item.itemId)
  );

  if (missingItems.length > 0) {
    throw new ResponseError(
      404,
      `Barang dengan ID berikut tidak ditemukan di database: ${missingItems
        .map((item) => `I${item.itemId}`)
        .join(", ")}.`
    );
  }
}
export default {
  get,
  getAll,
  getLogs,
  create,
  update,
  updateStatus,
};
