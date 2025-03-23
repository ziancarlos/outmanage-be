import sanitize from "sanitize-html";
import prismaClient from "../utils/Database.js";
import validate from "../validations/Validation.js";
import FleetServices from "./FleetServices.js";
import DeliveryOrderServices from "./DeliveryOrderServices.js";
import {
  createValidation,
  getAllValidation,
  getLogsValidation,
  getValidation,
  saveImageValidation,
  updateValidation,
} from "../validations/shipmentValidations.js";
import ResponseError from "../errors/ResponseError.js";

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
  prisma = prismaClient
) {
  return await prisma.shipmentLog.create({
    data: {
      shipmentId,
      userId,
      changeType,
      details,
    },
  });
}

async function getAll(request) {
  let {
    deliveryOrderId,
    licensePlate,
    status,
    shipmentType,
    removedStatus,
    date,
    page,
    size,
  } = validate(getAllValidation, request);

  const skip = (page - 1) * size;

  const filtersAnd = [];
  const filtersOr = [];

  if (deliveryOrderId) {
    await CustomerServices.getCustomerByConstraints({ deliveryOrderId });

    filtersAnd.push({
      ShipmentDeliveryOrder: {
        some: {
          deliveryOrderId: deliveryOrderId,
        },
      },
    });
  }

  if (licensePlate) {
    filtersOr.push({
      licensePlate: {
        contains: licensePlate,
      },
    });

    filtersOr.push({
      Fleet: {
        licensePlate: {
          contains: licensePlate, // Partial match on licensePlate
        },
      },
    });
  }

  if (shipmentType) {
    if (shipmentType === "JEMPUT") {
      filtersAnd.push({
        licensePlate: { not: null },
      });
    } else if (shipmentType === "ANTAR") {
      filtersAnd.push({
        fleetId: { not: null },
      });
    } else if (shipmentType === "BELUM-DITENTUKAN") {
      filtersAnd.push({
        licensePlate: null,
        fleetId: null,
      });
    }
  }

  if (removedStatus) {
    filtersAnd.push({
      deleteAt: {
        not: null,
      },
    });
  }

  if (status === "SELESAI") {
    filtersAnd.push({
      loadGoodsPicture: {
        not: null,
      },
    });
  } else if (status === "PENDING") {
    filtersAnd.push({
      loadGoodsPicture: null,
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

    filtersAnd.push({
      createdAt: {
        gte: startDate.toISOString(),
        lte: endDate.toISOString(),
      },
    });
  }

  const whereClause = {
    AND: [...filtersAnd, ...(filtersOr.length > 0 ? [{ OR: filtersOr }] : [])],
  };

  const shipments = await prismaClient.shipment.findMany({
    select: {
      shipmentId: true,
      internalNotes: true,
      loadGoodsPicture: true,
      licensePlate: true,
      Fleet: {
        select: {
          fleetId: true,
          licensePlate: true,
        },
      },
      ShipmentDeliveryOrder: {
        select: {
          shipmentDeliveryOrderId: true,
          deliveryOrderId: true,
        },
      },
      createdAt: true,
    },

    where: whereClause,

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
        internalNotes,
        loadGoodsPicture,
        licensePlate,
        Fleet: fleet,
        ShipmentDeliveryOrder: shipmentDeliveryOrder,
        createdAt,
      }) => ({
        shipmentId,
        internalNotes,
        status: loadGoodsPicture ? "SELESAI" : "PENDING",
        shipmentType: licensePlate
          ? "JEMPUT"
          : fleet?.fleetId
          ? "ANTAR"
          : "BELUM DITENTUKAN",
        licensePlate,
        fleet: !!fleet?.fleetId
          ? {
              fleetId: fleet.fleetId,
              licensePlate: fleet.licensePlate,
            }
          : null,
        shipmentDeliveryOrder: shipmentDeliveryOrder.map(
          ({ shipmentDeliveryOrderId, deliveryOrderId }) => {
            return {
              shipmentDeliveryOrderId,
              deliveryOrderId,
            };
          }
        ),
        createdAt,
      })
    ),

    paging: {
      page,
      totalItem: totalShipments,
      totalPage: Math.ceil(totalShipments / size),
    },
  };
}

async function get(shipmentIdInput) {
  const {
    shipmentId,
    internalNotes,
    loadGoodsPicture,
    licensePlate,
    Fleet: fleet,
    ShipmentDeliveryOrder: shipmentDeliveryOrder,
    createdAt,
  } = await prismaClient.shipment.findUnique({
    select: {
      shipmentId: true,
      internalNotes: true,
      loadGoodsPicture: true,
      licensePlate: true,

      Fleet: {
        select: {
          fleetId: true,
          licensePlate: true,
        },
      },

      ShipmentDeliveryOrder: {
        select: {
          shipmentDeliveryOrderId: true,
          DeliveryOrder: {
            select: {
              deliveryOrderId: true,
              Customer: {
                select: {
                  customerId: true,
                  name: true,
                },
              },
            },
          },
          address: true,
          shipmentDeliveryOrderType: true,

          ShipmentDeliveryOrderItem: {
            select: {
              DeliveryOrderItems: {
                select: {
                  Item: {
                    select: {
                      itemId: true,
                      name: true,
                    },
                  },
                },
              },
              shipmentDeliveryOrderItemId: true,
              deliveryOrderItemId: true,
              quantity: true,
            },
          },
        },
      },
      createdAt: true,
    },

    where: {
      shipmentId: validate(getValidation, shipmentIdInput),
    },
  });

  return {
    shipmentId,
    internalNotes,
    status: !!loadGoodsPicture ? "SELESAI" : "PENDING",
    shipmentType: licensePlate
      ? "JEMPUT"
      : fleet?.fleetId
      ? "ANTAR"
      : "BELUM DITENTUKAN",
    loadGoodsPicture,
    licensePlate,
    fleet: fleet?.fleetId
      ? {
          fleetId: fleet.fleetId,
          licensePlate: fleet.licensePlate,
        }
      : null,
    shipmentDeliveryOrder: shipmentDeliveryOrder.map(
      ({
        shipmentDeliveryOrderId,
        DeliveryOrder: deliveryOrder,
        address,
        shipmentDeliveryOrderType,
        ShipmentDeliveryOrderItem: shipmentDeliveryOrderItem,
      }) => {
        return {
          shipmentDeliveryOrderId,
          deliveryOrderId: deliveryOrder.deliveryOrderId,
          customer: {
            customerId: deliveryOrder.Customer.customerId,
            name: deliveryOrder.Customer.name,
          },
          address,
          shipmentDeliveryOrderType,
          shipmentDeliveryOrderItem: shipmentDeliveryOrderItem.map(
            ({
              shipmentDeliveryOrderItemId,
              deliveryOrderItemId,
              quantity,
              DeliveryOrderItems: deliveryOrderItems,
            }) => {
              return {
                shipmentDeliveryOrderItemId,
                deliveryOrderItemId,
                item: {
                  itemId: deliveryOrderItems.Item.itemId,
                  name: deliveryOrderItems.Item.name,
                },
                quantity,
              };
            }
          ),
        };
      }
    ),
    createdAt,
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

  const shipmentLogs = await prismaClient.shipmentLog.findMany({
    select: {
      shipmentLogId: true,
      shipmentId: true,
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
      shipmentLogId: "desc",
    },

    take: size,
    skip,
  });

  const totalDeliveryOrders = await prismaClient.shipmentLog.count({
    where: {
      AND: filters,
    },
  });

  return {
    data: shipmentLogs.map(
      ({
        shipmentLogId,
        shipmentId,
        User: user,
        changeType,
        details,
        createdAt,
      }) => ({
        shipmentLogId,
        shipmentId,
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

async function create(req, userId) {
  let { internalNotes, licensePlate, fleetId, deliveryOrders } = validate(
    createValidation,
    req
  );

  const request = {};

  if (internalNotes) {
    request.internalNotes = sanitize(internalNotes);
  }

  if (licensePlate) {
    request.licensePlate = sanitize(licensePlate);
  }

  if (fleetId) {
    await FleetServices.getFleetByConstraints({ fleetId });
    request.fleetId = fleetId;
  }

  await checkDeliveryOrders(deliveryOrders);

  request.ShipmentDeliveryOrder = {
    create: deliveryOrders.map(
      ({ deliveryOrderId, address, shipmentDeliveryOrderType, items }) => {
        const shipmentData = {
          deliveryOrderId,
          shipmentDeliveryOrderType,
          ShipmentDeliveryOrderItem: {
            create: items.map(({ deliveryOrderItemId, quantity }) => ({
              deliveryOrderItemId,
              quantity,
            })),
          },
        };

        if (address) {
          shipmentData.address = address;
        }

        return shipmentData;
      }
    ),
  };

  await prismaClient.$transaction(async (prisma) => {
    const shipment = await prisma.shipment.create({
      data: request,
      select: {
        shipmentId: true,
        internalNotes: true,
        licensePlate: true,
        fleetId: true,
        createdAt: true,
        ShipmentDeliveryOrder: {
          select: {
            shipmentDeliveryOrderId: true,
            deliveryOrderId: true,
            address: true,
            shipmentDeliveryOrderType: true,
            ShipmentDeliveryOrderItem: {
              select: {
                shipmentDeliveryOrderItemId: true,
                deliveryOrderItemId: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    const promises = [
      createShipmentLog(
        shipment.shipmentId,
        userId,
        "CREATE",
        `📦 Membuat pengiriman baru\n` +
          `• Catatan internal: ${
            shipment.internalNotes || "Tidak ada catatan"
          }\n` +
          `${
            request.licensePlate
              ? `• Pengambilan dengan kendaraan: ${shipment.licensePlate}`
              : `• Pengantaran menggunakan armada: #${shipment.fleetId}`
          }`,
        prisma
      ),
    ];

    shipment.ShipmentDeliveryOrder.forEach(
      ({
        shipmentDeliveryOrderId,
        deliveryOrderId,
        address,
        shipmentDeliveryOrderType,
        ShipmentDeliveryOrderItem,
      }) => {
        promises.push(
          createShipmentLog(
            shipment.shipmentId,
            userId,
            "CREATE",
            `📝 Menambahkan pesanan dari DO-${deliveryOrderId}\n` +
              `• Alamat pengiriman: ${
                address || "Alamat tidak dicantumkan"
              }\n` +
              `• Jenis pengantaran: ${getDeliveryTypeName(
                shipmentDeliveryOrderType
              )}`,
            prisma
          )
        );

        ShipmentDeliveryOrderItem.forEach(
          ({ shipmentDeliveryOrderItemId, deliveryOrderItemId, quantity }) => {
            promises.push(
              createShipmentLog(
                shipment.shipmentId,
                userId,
                "CREATE",
                `📦 Menambahkan barang ke DO-${deliveryOrderId}\n` +
                  `• DOI-${deliveryOrderItemId}\n` +
                  `• Jumlah: ${quantity.toLocaleString()} unit`,
                prisma
              )
            );
          }
        );
      }
    );

    await Promise.all(promises);
  });
}

function getDeliveryTypeName(type) {
  const types = {
    RUMAH: "Ke Rumah",
    KANTOR: "Ke Kantor",
    GUDANG: "Ke Gudang",
    EKSPEDISI: "Via Ekspedisi",
    LAINNYA: "Lainnya",
  };
  return types[type] || "Tidak diketahui";
}

async function checkDeliveryOrders(deliveryOrders) {
  const promises = [];

  deliveryOrders.forEach(({ deliveryOrderId, items }) => {
    promises.push(
      DeliveryOrderServices.getDeliveryOrderByConstraints({ deliveryOrderId })
    );

    items.forEach((item) => {
      promises.push(
        DeliveryOrderServices.getDeliveryOrderByConstraints(
          {
            deliveryOrderId,
            DeliveryOrderItems: {
              some: { deliveryOrderItemId: item.deliveryOrderItemId }, // ✅ Use `some`
            },
          },
          null,
          404,
          "Barang DO tidak ditemukkan."
        )
      );
    });
  });

  await Promise.all(promises);
}

async function saveImage(request) {
  let { shipmentId, imageUrl } = validate(saveImageValidation, request);

  // Ensure shipment exists
  await getShipmentByConstraints({ shipmentId });

  await prismaClient.shipment.update({
    where: { shipmentId },
    data: { loadGoodsPicture: imageUrl },
  });
}

async function getImage(shipmentId) {
  const shipment = getShipmentByConstraints({
    shipmentId: validate(getValidation, shipmentId),
    loadGoodsPicture: {
      not: null,
    },
  });

  return shipment.loadGoodsPicture;
}

function trackChangesOfDeliveryOrders(deliveryOrders, shipment) {
  const createdSDOs = [];
  const removedSDOs = [];
  const updatedSDOs = [];

  if (deliveryOrders) {
    shipment.ShipmentDeliveryOrder.forEach((sdo) => {
      const sdoExists = deliveryOrders.some(
        (deliveryOrder) => deliveryOrder.deliveryOrderId === sdo.deliveryOrderId
      );

      if (!sdoExists) {
        removedSDOs.push(existingItem);
      }
    });

    // Process requested delivery orders
    for (const deliveryOrder of deliveryOrders) {
      const existingSDO = shipment.ShipmentDeliveryOrder.find(
        (sdo) => sdo.deliveryOrderId === deliveryOrder.deliveryOrderId
      );

      if (!existingSDO) {
        createdSDOs.push(deliveryOrder);
      } else {
        const sdoChanges = {};
        let hasChanges = false;

        // Check address changes

        if (deliveryOrder.address !== existingSDO.address) {
          sdoChanges.address = deliveryOrder.address;
          hasChanges = true;
        }

        // Check type changes
        if (
          deliveryOrder.shipmentDeliveryOrderType !==
          existingSDO.shipmentDeliveryOrderType
        ) {
          sdoChanges.shipmentDeliveryOrderType =
            deliveryOrder.shipmentDeliveryOrderType;
          hasChanges = true;
        }

        // Track item changes
        const createdItems = [];
        const removedItems = [];
        const updatedItems = [];

        // Identify removed items
        const existingItems = existingSDO.ShipmentDeliveryOrderItem;
        const requestedItems = deliveryOrder.items || [];

        existingItems.forEach((existingItem) => {
          const itemExists = requestedItems.some(
            (item) =>
              item.deliveryOrderItemId === existingItem.deliveryOrderItemId
          );
          if (!itemExists) {
            removedItems.push(existingItem);
          }
        });

        // Process requested items
        for (const requestedItem of requestedItems) {
          const existingItem = existingItems.find(
            (item) =>
              item.deliveryOrderItemId === requestedItem.deliveryOrderItemId
          );

          if (!existingItem) {
            createdItems.push(requestedItem);
          } else if (existingItem.quantity !== requestedItem.quantity) {
            updatedItems.push({
              shipmentDeliveryOrderItemId:
                existingItem.shipmentDeliveryOrderItemId,
              quantity: requestedItem.quantity,
            });
          }
        }

        updatedSDOs.push({
          existingSDO,
          sdoChanges,
          createdItems,
          removedItems,
          updatedItems,
          hasChanges:
            hasChanges ||
            createdItems.length > 0 ||
            removedItems.length > 0 ||
            updatedItems.length > 0,
        });
      }
    }
  }

  return { createdSDOs, removedSDOs, updatedSDOs };
}

async function update(req, userId) {
  let { shipmentId, internalNotes, licensePlate, fleetId, deliveryOrders } =
    validate(updateValidation, req);

  const changes = {};

  const shipment = await getShipmentByConstraints(
    { shipmentId },
    {
      internalNotes: true,
      licensePlate: true,
      fleetId: true,
      createdAt: true,
      ShipmentDeliveryOrder: {
        select: {
          shipmentDeliveryOrderId: true,
          deliveryOrderId: true,
          address: true,
          shipmentDeliveryOrderType: true,
          ShipmentDeliveryOrderItem: {
            select: {
              shipmentDeliveryOrderItemId: true,
              deliveryOrderItemId: true,
              quantity: true,
            },
          },
        },
      },
    }
  );

  if (internalNotes && internalNotes !== shipment.internalNotes) {
    changes.internalNotes = sanitize(internalNotes);
  }

  if (licensePlate && licensePlate !== shipment.licensePlate) {
    changes.licensePlate = sanitize(licensePlate);
    changes.fleetId = null;
  }

  if (fleetId && fleetId !== shipment.fleetId) {
    await FleetServices.getFleetByConstraints({ fleetId });
    changes.licensePlate = null;
    changes.fleetId = fleetId;
  }

  await checkDeliveryOrders(deliveryOrders);

  // Track changes for delivery orders
  const { createdSDOs, removedSDOs, updatedSDOs } =
    trackChangesOfDeliveryOrders(deliveryOrders, shipment);

  if (
    Object.keys(changes).length === 0 &&
    createdSDOs.length === 0 &&
    removedSDOs.length === 0 &&
    !updatedSDOs.some((sdo) => sdo.hasChanges)
  ) {
    throw new ResponseError(409, "Tidak ada perubahan yang teridentifikasi");
  }

  return await prismaClient.$transaction(async (prisma) => {
    // Update main shipment
    const updatedShipment = await prisma.shipment.update({
      where: { shipmentId },
      data: changes,
      include: {
        ShipmentDeliveryOrder: {
          include: {
            ShipmentDeliveryOrderItem: true,
          },
        },
      },
    });

    const logPromises = [];

    // Handle removed SDOs
    for (const sdo of removedSDOs) {
      await prisma.shipmentDeliveryOrder.delete({
        where: { shipmentDeliveryOrderId: sdo.shipmentDeliveryOrderId },
      });

      await prisma.shipmentDeliveryOrderItem.deleteMany({
        where: {
          shipmentDeliveryOrderId: sdo.shipmentDeliveryOrderId,
        },
      });

      logPromises.push(
        createShipmentLog(
          shipmentId,
          userId,
          "DELETE",
          `Menghapus pesanan dari DO-${sdo.deliveryOrderId}\n` +
            `• Alamat sebelumnya: ${sdo.address || "Tidak ada alamat"}\n` +
            `• Jenis sebelumnya: ${getDeliveryTypeName(
              sdo.shipmentDeliveryOrderType
            )}`,
          prisma
        )
      );
    }

    // Handle created SDOs
    for (const sdoData of createdSDOs) {
      const newSDO = await prisma.shipmentDeliveryOrder.create({
        data: {
          shipmentId,
          deliveryOrderId: sdoData.deliveryOrderId,
          address: sdoData.address,
          shipmentDeliveryOrderType: sdoData.shipmentDeliveryOrderType,
          ShipmentDeliveryOrderItem: {
            create: sdoData.items.map((item) => ({
              deliveryOrderItemId: item.deliveryOrderItemId,
              quantity: item.quantity,
            })),
          },
        },
        include: { ShipmentDeliveryOrderItem: true },
      });

      logPromises.push(
        createShipmentLog(
          shipmentId,
          userId,
          "CREATE",
          `📝 Menambahkan pesanan baru dari DO-${sdoData.deliveryOrderId}\n` +
            `• Alamat: ${sdoData.address || "Tidak dicantumkan"}\n` +
            `• Jenis pengantaran: ${getDeliveryTypeName(
              sdoData.shipmentDeliveryOrderType
            )}`,
          prisma
        )
      );

      for (const item of newSDO.ShipmentDeliveryOrderItem) {
        logPromises.push(
          createShipmentLog(
            shipmentId,
            userId,
            `📦 Menambahkan barang ke DO-${sdoData.deliveryOrderId}\n` +
              `• DOI-${item.deliveryOrderItemId}\n` +
              `• Jumlah: ${item.quantity.toLocaleString("")} unit`,
            prisma
          )
        );
      }
    }

    // Handle updated SDOs
    for (const updateData of updatedSDOs) {
      const {
        existingSDO,
        sdoChanges,
        createdItems,
        removedItems,
        updatedItems,
      } = updateData;

      // Update SDO metadata
      if (Object.keys(sdoChanges).length > 0) {
        await prisma.shipmentDeliveryOrder.update({
          where: {
            shipmentDeliveryOrderId: existingSDO.shipmentDeliveryOrderId,
          },
          data: sdoChanges,
        });

        const changeMessages = [];
        if (sdoChanges.address) {
          changeMessages.push(
            `Alamat: ${existingSDO.address || "Tidak ada"} ➔ ${
              sdoChanges.address
            }`
          );
        }

        if (sdoChanges.shipmentDeliveryOrderType) {
          changeMessages.push(
            `Jenis: ${getDeliveryTypeName(
              existingSDO.shipmentDeliveryOrderType
            )} ➔ ${getDeliveryTypeName(sdoChanges.shipmentDeliveryOrderType)}`
          );
        }

        logPromises.push(
          createShipmentLog(
            shipmentId,
            userId,
            "UPDATE",
            `✏️ Memperbarui pesanan DO-${existingSDO.deliveryOrderId}\n` +
              changeMessages.map((m) => `• ${m}`).join("\n"),
            prisma
          )
        );
      }

      // Handle removed items
      for (const item of removedItems) {
        await prisma.shipmentDeliveryOrderItem.delete({
          where: {
            shipmentDeliveryOrderItemId: item.shipmentDeliveryOrderItemId,
          },
        });
        logPromises.push(
          createShipmentLog(
            shipmentId,
            userId,
            "DELETE",
            `🗑️ Menghapus barang dari DO-${existingSDO.deliveryOrderId}\n` +
              `• DOI-${item.deliveryOrderItemId}\n` +
              `• Jumlah sebelumnya: ${item.quantity.toLocaleString()} unit`,
            prisma
          )
        );
      }

      // Handle created items
      for (const item of createdItems) {
        const newItem = await prisma.shipmentDeliveryOrderItem.create({
          data: {
            shipmentDeliveryOrderId: existingSDO.shipmentDeliveryOrderId,
            deliveryOrderItemId: item.deliveryOrderItemId,
            quantity: item.quantity,
          },
        });
        logPromises.push(
          createShipmentLog(
            shipmentId,
            userId,
            "CREATE",
            `📦 Menambahkan barang ke DO-${existingSDO.deliveryOrderId}\n` +
              `• DOI-${newItem.deliveryOrderItemId}\n` +
              `• Jumlah: ${newItem.quantity.toLocaleString()} unit`,
            prisma
          )
        );
      }

      // Handle updated items
      for (const item of updatedItems) {
        await prisma.shipmentDeliveryOrderItem.update({
          where: {
            shipmentDeliveryOrderItemId: item.shipmentDeliveryOrderItemId,
          },
          data: { quantity: item.quantity },
        });

        logPromises.push(
          createShipmentLog(
            shipmentId,
            userId,
            "UPDATE",
            `✏️ Memperbarui jumlah barang DO-${existingSDO.deliveryOrderId}\n` +
              `• DOI-${item.deliveryOrderItemId}\n` +
              `• Jumlah:  ${item.quantity.toLocaleString()} unit`,
            prisma
          )
        );
      }
    }

    await Promise.all(logPromises);
  });
}

export default {
  getShipmentByConstraints,
  getAll,
  get,
  getLogs,
  saveImage,
  getImage,
  create,
  update,
};
