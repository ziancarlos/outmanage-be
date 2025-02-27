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

async function get(deliveryOrderIdInput) {
  let {
    deliveryOrderId,
    Customer: customer,
    ShipmentDeliveryOrder: shipmentDeliveryOrder,
    address,
    internalNotes,
    deletedAt,
    status,
  } = await getDeliveryOrderByConstraints(
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
  );

  const deliveryOrderItems = await prismaClient.$queryRawUnsafe(
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

  return {
    deliveryOrderId,
    customer,
    address,
    internalNotes,
    status,
    deliveryOrderItems: deliveryOrderItems.map((item) => {
      return {
        deliveryOrderItemId: item.deliveryOrderItemId,
        item: {
          itemId: item.itemId,
          name: item.name,
        },
        orderedQuantity: item.originalQuantity,
        pendingQuantity: item.pendingQuantity,
        completedQuantity: item.completedQuantity,
        processQuantity: item.processQuantity,
      };
    }),
    shipmentDeliveryOrder,
    deletedAt,
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

    where: {
      AND: filters,
    },

    orderBy: {
      deliveryOrderId: "desc",
    },

    take: size,
    skip,
  });

  const totalDeliveryOrders = await prismaClient.deliveryOrder.count({
    where: {
      AND: filters,
    },
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
      `Menambahkan DO baru dengan Kustomer C${customerId}; Alamat: ${
        address || "Tidak diberikan alamat"
      }; Catatan Internal: ${
        internalNotes || "Tidak diberikan catatan internal"
      }.`,
      prisma
    );

    await Promise.all(
      deliveryOrder.DeliveryOrderItems.map(({ itemId, quantity }) =>
        createDeliveryOrderLog(
          deliveryOrder.deliveryOrderId,
          userId,
          "CREATE",
          `Menambahkan barang pada DO dengan Barang I${itemId}; Kuantitas: ${quantity}`,
          prisma
        )
      )
    );
  });
}

async function update(req, userId) {
  let { deliveryOrderId, customerId, address, internalNotes, items } = validate(
    updateValidation,
    req
  );

  address = address ? sanitize(address) : null;
  internalNotes = internalNotes ? sanitize(internalNotes) : null;

  const [deliveryOrder, deliveryOrderItems] = await Promise.all([
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

  const changes = {};

  if (customerId && customerId !== deliveryOrder.customerId) {
    await CustomerServices.getCustomerByConstraints({
      customerId,
    });

    changes.customerId = customerId;
  }

  if (address && address !== deliveryOrder.address) {
    changes.address = address;
  }

  if (internalNotes && internalNotes !== deliveryOrder.internalNotes) {
    changes.internalNotes = internalNotes;
  }

  const createdItems = [];
  const removedItems = [];
  const updatedItems = [];
  if (items.length > 0) {
    await checkItemsValid(items);

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
        if (existingItem.completedQuantity || existingItem.processQuantity) {
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

    // Collect changes for items (created, removed, updated)
    if (createdItems.length > 0) {
      changes.createdItems = createdItems;
    }

    if (removedItems.length > 0) {
      changes.removedItems = removedItems;
    }

    if (updatedItems.length > 0) {
      changes.updatedItems = updatedItems;
    }
  }

  if (Object.keys(changes).length === 0) {
    throw new ResponseError(409, "Tidak ada perubahan yang teridentifikasi");
  }

  // Start the transaction to update the delivery order
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
            data: createdItems.map(({ itemId, quantity }) => ({
              itemId,
              quantity,
            })),
          },
          deleteMany: {
            itemId: { in: removedItems.map((item) => item.itemId) },
          },
          updateMany: updatedItems.map(({ itemId, quantity }) => ({
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

    // Prepare log entriesq
    const logPromises = [];

    if (changes.customerId || changes.address || changes.internalNotes) {
      logPromises.push(
        createDeliveryOrderLog(
          deliveryOrder.deliveryOrderId,
          userId,
          "UPDATE",
          `Mengubah ${
            changes.customerId
              ? `Kustomer dari ${deliveryOrder.customerId} menjadi ${changes.customerId};`
              : ""
          }
         ${
           changes.address
             ? `Alamat dari ${deliveryOrder.address} menjadi ${changes.address};`
             : ""
         }
         ${
           changes.internalNotes
             ? `Catatan internal dari ${deliveryOrder.internalNotes} menjadi ${changes.internalNotes};`
             : ""
         }`,
          prisma
        )
      );
    }

    if (changes.createdItems && changes.createdItems.length > 0) {
      logPromises.push(
        ...changes.createdItems.map(({ itemId, quantity }) =>
          createDeliveryOrderLog(
            deliveryOrder.deliveryOrderId,
            userId,
            "CREATE",
            `Menambahkan barang pada DO dengan Barang I${itemId}; Kuantitas: ${quantity}`,
            prisma
          )
        )
      );
    }

    if (changes.updatedItems && changes.updatedItems.length > 0) {
      logPromises.push(
        ...changes.updatedItems.map(({ itemId, quantity }) =>
          createDeliveryOrderLog(
            deliveryOrder.deliveryOrderId,
            userId,
            "UPDATE",
            `Mengubah kuantitas barang pada Barang I${itemId}; Kuantitas: ${quantity}`,
            prisma
          )
        )
      );
    }

    if (changes.removedItems && changes.removedItems.length > 0) {
      logPromises.push(
        ...changes.removedItems.map(({ itemId }) =>
          createDeliveryOrderLog(
            deliveryOrder.deliveryOrderId,
            userId,
            "DELETE",
            `Menghapus barang pada Barang I${itemId};`,
            prisma
          )
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
};
