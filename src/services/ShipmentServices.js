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
} from "../validations/shipmentValidations.js";

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

async function createDeliveryOrderLog(
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
    filtersAnd.push({
      licensePlate: {
        contains: licensePlate,
      },
      Fleet: {
        some: {
          licensePlate: {
            contains: licensePlate, // Partial match on licensePlate
          },
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
    } else if (shipmentType === "BELUM DITENTUKAN") {
      filtersAnd.push({
        licensePlate: null,
        Fleet: {
          fleetId: { not: null },
        },
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
          deliveryOrder: {
            deliveryOrderId: deliveryOrder.deliveryOrderId,
            customer: {
              customerId: deliveryOrder.Customer.customerId,
              name: deliveryOrder.Customer.name,
            },
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
      shipmentId: "desc",
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
  } else {
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
      createDeliveryOrderLog(
        shipment.shipmentId,
        userId,
        "CREATE",
        `Menambahkan Pengiriman baru dengan Catatan Internal ${
          shipment.internalNotes || "Tidak diberikan catatan internal"
        }; ${
          request.licensePlate
            ? `Dijemput dengan nomor polisi ${shipment.licensePlate}`
            : `Diantar dengan armada ${shipment.fleetId}`
        };`,
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
          createDeliveryOrderLog(
            shipment.shipmentId,
            userId,
            "CREATE",
            `Menambahkan SDO${shipmentDeliveryOrderId}; dengan DO${deliveryOrderId}; Alamat: ${
              address || "Tidak diberikan alamat"
            }; Tipe Pengiriman ${shipmentDeliveryOrderType};`,
            prisma
          )
        );

        ShipmentDeliveryOrderItem.forEach(
          ({ shipmentDeliveryOrderItemId, deliveryOrderItemId, quantity }) => {
            promises.push(
              createDeliveryOrderLog(
                shipment.shipmentId,
                userId,
                "CREATE",
                `Menambahkan DOI${deliveryOrderItemId} dan kuantitas ${quantity.toLocaleString()} ke SDOI${shipmentDeliveryOrderItemId};`,
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

export default {
  getShipmentByConstraints,
  getAll,
  get,
  getLogs,
  create,
  saveImage,
  getImage,
};
