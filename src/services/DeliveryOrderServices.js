import sanitize from "sanitize-html";
import ResponseError from "../errors/ResponseError.js";
import prismaClient from "../utils/Database.js";
import {
  getAllValidation,
  getLogsValidation,
  getValidation,
  createValidation,
  updateValidation,
} from "../validations/DeliveryOrderValidations.js";
import validate from "../validations/Validation.js";
import CustomerServices from "./CustomerServices.js";
import ItemServices from "./ItemServices.js";

async function getDeliveryOrderByConstraints(
  where,
  select = null,
  status = 404,
  message = "DO tidak ditemukan",
  check = (deliveryOrder, status, message) => {
    if (!deliveryOrder) {
      throw new ResponseError(status, message);
    }
  }
) {
  const deliveryOrder = await prismaClient.deliveryOrder.findFirst({
    where,

    select: select
      ? select
      : {
          deliveryOrderId: true,
          customerId: true,
          address: true,
          internalNotes: true,
        },
  });

  check(deliveryOrder, status, message);

  return deliveryOrder;
}

async function createDeliveryOrderLog(
  deliveryOrderId,
  userId,
  changeType,
  details,
  prisma = prismaClient
) {
  return await prisma.deliveryOrderLog.create({
    data: {
      deliveryOrderId,
      userId,
      changeType,
      details,
    },
  });
}

async function getQuantityStatusById(deliveryOrderId, prisma = prismaClient) {
  return await prisma.$queryRawUnsafe(
    `SELECT
  doi.deliveryOrderItemId,
  doi.itemId,
  i.name,
  doi.quantity AS originalQuantity,
  (doi.quantity - COALESCE(SUM(sdoi.quantity), 0)) AS pendingQuantity,
  COALESCE(SUM(CASE WHEN s.loadGoodsPicture IS NOT NULL THEN sdoi.quantity ELSE 0 END), 0) AS completedQuantity,
  COALESCE(SUM(CASE WHEN s.loadGoodsPicture IS NULL THEN sdoi.quantity ELSE 0 END), 0) AS processQuantity
FROM
    delivery_orders_items doi
LEFT JOIN
    shipment_deliveries_orders_items sdoi 
        ON doi.deliveryOrderItemId = sdoi.deliveryOrderItemId 
LEFT JOIN
    shipment_deliveries_orders sdo 
        ON sdoi.shipmentDeliveryOrderId = sdo.shipmentDeliveryOrderId 
LEFT JOIN
    shipments s 
        ON sdo.shipmentId = s.shipmentId 
        AND s.deletedAt IS NULL
LEFT JOIN
      items i
        ON doi.itemId = i.itemId
WHERE
    doi.deliveryOrderId = ?
    AND s.deletedAt IS NULL    
GROUP BY  doi.deliveryOrderItemId, doi.itemId, doi.quantity;`,
    deliveryOrderId
  );
}

async function updateStatus(deliveryOrders, prisma) {
  await Promise.all(
    deliveryOrders.map(async ({ deliveryOrderId }) => {
      const deliveryOrderItems = await getQuantityStatusById(
        deliveryOrderId,
        prisma
      );

      if (!deliveryOrderItems.length) return;

      const allCompleted = deliveryOrderItems.every(
        (item) => item.completedQuantity == item.originalQuantity
      );
      const allProcessed = deliveryOrderItems.every(
        (item) => item.processQuantity === item.originalQuantity
      );
      const allPending = deliveryOrderItems.every(
        (item) => item.pendingQuantity === item.originalQuantity
      );
      const hasCompleted = deliveryOrderItems.some(
        (item) => item.completedQuantity === item.originalQuantity
      );
      const hasProcessed = deliveryOrderItems.some(
        (item) => item.processQuantity === item.originalQuantity
      );

      let newStatus = "PROSES"; // Default status

      if (allCompleted) newStatus = "SELESAI";
      else if (allProcessed) newStatus = "PROSES";
      else if (allPending) newStatus = "PENDING";
      else if (hasCompleted || hasProcessed) newStatus = "PROSES";

      await prisma.deliveryOrder.update({
        where: { deliveryOrderId },
        data: { status: newStatus },
      });
    })
  );
}

async function get(deliveryOrderIdInput) {
  let [deliveryOrder, deliveryOrderItems] = await Promise.all([
    getDeliveryOrderByConstraints(
      {
        deliveryOrderId: validate(getValidation, deliveryOrderIdInput),
      },
      {
        deliveryOrderId: true,
        Customer: {
          select: {
            customerId: true,
            name: true,
          },
        },
        ShipmentDeliveryOrder: {
          select: {
            shipmentDeliveryOrderId: true,
            deliveryOrderId: true,
            Shipment: {
              select: {
                shipmentId: true,
                loadGoodsPicture: true,
              },
            },
          },
        },
        status: true,
        address: true,
        internalNotes: true,
        deletedAt: true,
      }
    ),
    getQuantityStatusById(deliveryOrderIdInput),
  ]);

  const {
    deliveryOrderId,
    Customer: customer,
    ShipmentDeliveryOrder: shipmentDeliveryOrder,
    address,
    internalNotes,
    deletedAt,
    status,
  } = deliveryOrder;

  return {
    deliveryOrderId,
    customer,
    address,
    internalNotes,
    status,
    deletedAt,
    shipmentDeliveryOrder,
    deliveryOrderItems: deliveryOrderItems.map((item) => ({
      deliveryOrderItemId: item.deliveryOrderItemId,
      item: {
        itemId: item.itemId,
        name: item.name,
      },
      orderedQuantity: item.originalQuantity,
      pendingQuantity: item.pendingQuantity,
      completedQuantity: item.completedQuantity,
      processQuantity: item.processQuantity,
    })),
  };
}

async function getAll(request) {
  let {
    customerId,
    deliveryOrderId,
    status,
    removedStatus,
    name,
    date,
    page,
    size,
  } = validate(getAllValidation, request);

  const skip = (page - 1) * size;

  const filters = [];

  if (customerId) {
    await CustomerServices.getCustomerByConstraints({ customerId });

    filters.push({ customerId });
  }

  if (deliveryOrderId) {
    filters.push({
      some: {
        deliveryOrderId: {
          contains: deliveryOrderId,
        },
      },
    });
  }

  if (name) {
    filters.push({
      Customer: {
        some: {
          name: {
            contains: name,
          },
        },
      },
    });
  }

  if (removedStatus) {
    filters.push({
      deleteAt: {
        not: null,
      },
    });
  }

  if (status) {
    filters.push({
      status,
    });
  }

  if (date) {
    if (!date.startDate || !date.endDate) {
      throw new ResponseError(400, "Tanggal mulai dan selesai diperlukan.");
    }

    if (new Date(date.startDate) > new Date(date.endDate)) {
      throw new ResponseError(
        400,
        "Tanggal mulai tidak boleh lebih lambat dari tanggal selesai."
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

  const deliveryOrders = await prismaClient.deliveryOrder.findMany({
    select: {
      deliveryOrderId: true,
      Customer: {
        select: {
          customerId: true,
          name: true,
        },
      },
      status: true,
      createdAt: true,
    },

    where: whereClause,

    orderBy: {
      deliveryOrderId: "desc",
    },

    take: size,
    skip,
  });

  const totalDeliveryOrders = await prismaClient.deliveryOrder.count({
    where: whereClause,
  });

  return {
    data: deliveryOrders.map(
      ({ deliveryOrderId, Customer: customer, status, createdAt }) => ({
        deliveryOrderId,
        customer: {
          customerId: customer.customerId,
          name: customer.name,
        },
        status,
        createdAt,
      })
    ),

    paging: {
      page,
      totalItem: totalDeliveryOrders,
      totalPage: Math.ceil(totalDeliveryOrders / size),
    },
  };
}

async function getLogs(request) {
  const { deliveryOrderId, changeType, details, date, page, size } = validate(
    getLogsValidation,
    request
  );

  const skip = (page - 1) * size;

  const filters = [];

  if (deliveryOrderId) {
    await getDeliveryOrderByConstraints({
      deliveryOrderId,
    });

    filters.push({
      deliveryOrderId,
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

  if (details) {
    filters.push({
      details: {
        contains: details,
      },
    });
  }

  const deliveryOrdersLogs = await prismaClient.deliveryOrderLog.findMany({
    select: {
      deliveryOrderLogId: true,
      deliveryOrderId: true,
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
      AND: filters,
    },

    orderBy: {
      deliveryOrderId: "desc",
    },

    take: size,
    skip,
  });

  const totalDeliveryOrders = await prismaClient.deliveryOrderLog.count({
    where: {
      AND: filters,
    },
  });

  return {
    data: deliveryOrdersLogs.map(
      ({
        deliveryOrderLogId,
        deliveryOrderId,
        User: user,
        changeType,
        details,
        createdAt,
      }) => ({
        deliveryOrderLogId,
        deliveryOrderId,
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
      totalItem: totalDeliveryOrders,
      totalPage: Math.ceil(totalDeliveryOrders / size),
    },
  };
}

async function checkItemsValid(items) {
  await Promise.all(
    items.map(async ({ itemId }) => {
      await ItemServices.getItemByConstraints({ itemId });
    })
  );
}

async function create(req, userId) {
  let { customerId, address, internalNotes, items } = validate(
    createValidation,
    req
  );

  address = sanitize(address);
  internalNotes = sanitize(internalNotes);

  await CustomerServices.getCustomerByConstraints({
    customerId,
  });

  await checkItemsValid(items);

  await prismaClient.$transaction(async (prisma) => {
    const request = {
      customerId,
      DeliveryOrderItems: {
        createMany: {
          data: items.map(({ itemId, quantity }) => ({ itemId, quantity })),
        },
      },
      ...(address && { address }),
      ...(internalNotes && { internalNotes }),
    };

    const deliveryOrder = await prisma.deliveryOrder.create({
      data: request,
      select: {
        customerId: true,
        deliveryOrderId: true,
        address: true,
        internalNotes: true,
        DeliveryOrderItems: {
          select: {
            deliveryOrderItemId: true,
            itemId: true,
            quantity: true,
          },
        },
      },
    });

    await createDeliveryOrderLog(
      deliveryOrder.deliveryOrderId,
      userId,
      "CREATE",
      `📦 Membuat DO Baru\n` +
        `• Pelanggan: C-${customerId}\n` +
        `• Alamat: ${address || "Alamat tidak dicantumkan"}\n` +
        `• Catatan: ${internalNotes || "Tidak ada catatan tambahan"}`,
      prisma
    );

    await Promise.all(
      deliveryOrder.DeliveryOrderItems.map(
        ({ deliveryOrderItemId, itemId, quantity }) =>
          createDeliveryOrderLog(
            deliveryOrder.deliveryOrderId,
            userId,
            "CREATE",
            `📋 Menambahkan Barang\n` +
              `• DOI-${deliveryOrderItemId}\n` +
              `• Barang I-${itemId}\n` +
              `• Kuantitas: ${quantity.toLocaleString()} unit`,
            prisma
          )
      )
    );
  });
}

async function getUpdateChanges(
  items,
  informations,
  initialDeliveryOrder,
  deliveryOrderItems
) {
  const changes = await getInformationChanges(
    informations,
    initialDeliveryOrder
  );

  if (items.length > 0) {
    await checkItemsValid(items, deliveryOrderItems);

    Object.assign(
      changes,
      await getUpdateItemsChanges(items, deliveryOrderItems)
    );
  }

  if (Object.keys(changes).length === 0) {
    throw new ResponseError(409, "Tidak ada perubahan yang teridentifikasi");
  }

  return changes;
}

async function getUpdateItemsChanges(items, deliveryOrderItems) {
  const createdItems = [];
  const removedItems = [];
  const updatedItems = [];

  // Check for created items (items that are not already in the existing order)

  items.forEach((targetedItem) => {
    const itemExists = deliveryOrderItems.some(
      (item) => item.itemId === targetedItem.itemId
    );

    if (!itemExists) {
      createdItems.push(targetedItem);
    }
  });

  // Check for removed items (items that are in the existing order but not in the new list)
  deliveryOrderItems.forEach((existingItem) => {
    const itemExists = items.some(
      (targetedItem) => targetedItem.itemId === existingItem.itemId
    );

    if (!itemExists) {
      if (
        existingItem.completedQuantity > 0 ||
        existingItem.processQuantity > 0
      ) {
        throw new ResponseError(
          400,
          "Barang sudah diproses sebagian atau pengirimannya telah selesai, tidak dapat menghapus barang dari DO"
        );
      }

      removedItems.push(existingItem);
    }
  });

  // Check for updated items (items that are already in the order but have changed)
  items.forEach((targetedItem) => {
    const existingItem = deliveryOrderItems.find(
      (item) => item.itemId === targetedItem.itemId
    );

    if (
      existingItem &&
      existingItem.originalQuantity !== targetedItem.quantity
    ) {
      if (
        parseInt(existingItem.processQuantity) +
          parseInt(existingItem.completedQuantity) >
        targetedItem.quantity
      ) {
        throw new ResponseError(
          400,
          "Jumlah barang yang sudah diproses atau dikirim kurang dari jumlah yang diubah."
        );
      }
      updatedItems.push(targetedItem);
    }
  });

  return {
    createdItems,
    removedItems,
    updatedItems,
  };
}

async function getInformationChanges(
  { customerId, address, internalNotes },
  initialDeliveryOrder
) {
  const changes = {};
  if (customerId && customerId !== initialDeliveryOrder.customerId) {
    await CustomerServices.getCustomerByConstraints({
      customerId,
    });

    changes.customerId = customerId;
  }

  if (address && address !== initialDeliveryOrder.address) {
    changes.address = address;
  }

  if (internalNotes && internalNotes !== initialDeliveryOrder.internalNotes) {
    changes.internalNotes = internalNotes;
  }

  return changes;
}

async function createUpdateInformationLog(changes, initialDeliveryOrder) {
  const changesLog = [];

  if (changes.customerId) {
    changesLog.push(
      `• Kustomer: [C-${initialDeliveryOrder.customerId}] ➔ [C-${changes.customerId}]`
    );
  }

  if (changes.address) {
    const oldAddress = initialDeliveryOrder.address || "Tidak ada alamat";
    const newAddress = changes.address || "Tidak ada alamat";
    changesLog.push(`• Alamat: ${oldAddress} ➔ ${newAddress}`);
  }

  if (changes.internalNotes) {
    const oldNotes = initialDeliveryOrder.internalNotes || "Tidak ada catatan";
    const newNotes = changes.internalNotes || "Tidak ada catatan";
    changesLog.push(`• Catatan: "${oldNotes}" ➔ "${newNotes}"`);
  }

  return changesLog;
}

async function createUpdateItemsLog(
  changes,
  deliveryOrder,
  userId,
  prisma,
  deliveryOrderItems
) {
  const logPromises = [];
  if (changes.createdItems && changes.createdItems.length > 0) {
    logPromises.push(
      ...changes.createdItems.map(({ itemId, quantity }) =>
        createDeliveryOrderLog(
          deliveryOrder.deliveryOrderId,
          userId,
          "CREATE",
          `📦 Menambahkan Barang Baru\n` +
            `• Barang: I-${itemId}\n` +
            `• Jumlah: ${quantity.toLocaleString()} unit`,
          prisma
        )
      )
    );
  }

  if (changes.updatedItems && changes.updatedItems.length > 0) {
    logPromises.push(
      ...changes.updatedItems.map(({ itemId, quantity }) => {
        const oldQuantity =
          deliveryOrderItems.find((i) => i.itemId === itemId)
            ?.originalQuantity || 0;

        return createDeliveryOrderLog(
          deliveryOrder.deliveryOrderId,
          userId,
          "UPDATE",
          `🔄 Mengubah Jumlah Barang\n` +
            `• Barang: I-${itemId}\n` +
            `• Jumlah: ${oldQuantity.toLocaleString()} ➔ ${quantity.toLocaleString()} unit`,
          prisma
        );
      })
    );
  }

  if (changes.removedItems && changes.removedItems.length > 0) {
    logPromises.push(
      ...changes.removedItems.map(({ itemId, originalQuantity }) =>
        createDeliveryOrderLog(
          deliveryOrder.deliveryOrderId,
          userId,
          "DELETE",
          `🗑️ Menghapus Barang\n` +
            `• Barang: I-${itemId}\n` +
            `• Jumlah sebelumnya: ${originalQuantity.toLocaleString()} unit`,
          prisma
        )
      )
    );
  }

  return logPromises;
}

async function update(req, userId) {
  let { deliveryOrderId, customerId, address, internalNotes, items } = validate(
    updateValidation,
    req
  );

  address = address ? sanitize(address) : null;
  internalNotes = internalNotes ? sanitize(internalNotes) : null;

  const [initialDeliveryOrder, deliveryOrderItems] = await Promise.all([
    getDeliveryOrderByConstraints(
      {
        deliveryOrderId,
      },
      {
        deliveryOrderId: true,
        customerId: true,
        address: true,
        internalNotes: true,
      }
    ),
    prismaClient.$queryRawUnsafe(
      `SELECT
      doi.deliveryOrderItemId,
      doi.itemId,
      doi.quantity AS originalQuantity,
      (doi.quantity - COALESCE(SUM(sdoi.quantity), 0)) AS pendingQuantity,
      COALESCE(SUM(CASE WHEN s.loadGoodsPicture IS NOT NULL THEN sdoi.quantity ELSE 0 END), 0) AS completedQuantity,
      COALESCE(SUM(CASE WHEN s.loadGoodsPicture IS NULL THEN sdoi.quantity ELSE 0 END), 0) AS processQuantity      
    FROM
        delivery_orders_items doi
    LEFT JOIN
        shipment_deliveries_orders_items sdoi 
            ON doi.deliveryOrderItemId = sdoi.deliveryOrderItemId 
    LEFT JOIN
        shipment_deliveries_orders sdo 
            ON sdoi.shipmentDeliveryOrderId = sdo.shipmentDeliveryOrderId 
    LEFT JOIN
        shipments s 
            ON sdo.shipmentId = s.shipmentId 
            AND s.deletedAt IS NULL
    WHERE
        doi.deliveryOrderId = ?
        AND s.deletedAt IS NULL    
    GROUP BY
        doi.deliveryOrderItemId, doi.itemId, doi.quantity;`,
      deliveryOrderId
    ),
  ]);

  const changes = await getUpdateChanges(
    items,
    {
      customerId,
      address,
      internalNotes,
    },
    initialDeliveryOrder,
    deliveryOrderItems
  );

  // Start the transaction to update the delivery order
  await prismaClient.$transaction(async (prisma) => {
    // Update the delivery order
    const deliveryOrder = await prisma.deliveryOrder.update({
      where: { deliveryOrderId: deliveryOrderId },
      data: {
        ...(changes.customerId && { customerId: changes.customerId }),
        ...(changes.address && { address: changes.address }),
        ...(changes.internalNotes && { internalNotes: changes.internalNotes }),

        // Handle created, removed, and updated items
        DeliveryOrderItems: {
          createMany: {
            data: changes.createdItems.map(({ itemId, quantity }) => ({
              itemId,
              quantity,
            })),
          },
          deleteMany: {
            itemId: { in: changes.removedItems.map((item) => item.itemId) },
          },
          updateMany: changes.updatedItems.map(({ itemId, quantity }) => ({
            where: { itemId }, // Match by itemId
            data: { quantity }, // Update quantity
          })),
        },
      },
      select: {
        customerId: true,
        deliveryOrderId: true,
        address: true,
        internalNotes: true,
        DeliveryOrderItems: {
          select: {
            deliveryOrderItemId: true,
            itemId: true,
            quantity: true,
          },
        },
      },
    });

    await updateStatus([{ deliveryOrderId }], prisma);

    // Prepare log entries
    const logPromises = await createUpdateItemsLog(
      changes,
      deliveryOrder,
      userId,
      prisma,
      deliveryOrderItems
    );

    if (changes.customerId || changes.address || changes.internalNotes) {
      const changesLog = await createUpdateInformationLog(
        changes,
        initialDeliveryOrder
      );

      logPromises.push(
        createDeliveryOrderLog(
          deliveryOrder.deliveryOrderId,
          userId,
          "UPDATE",
          `✏️ Memperbarui Informasi Pesanan \n` + changesLog.join("\n"),
          prisma
        )
      );
    }

    // Wait for all log insertions to complete before transaction commits
    await Promise.all(logPromises);
  });
}

export default {
  get,
  getAll,
  getLogs,
  create,
  update,
  getDeliveryOrderByConstraints,
  getQuantityStatusById,
  updateStatus,
};
