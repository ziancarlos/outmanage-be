import prismaClient from "../utils/Database.js";

async function getTotalCustomer() {
  const totalCustomers = await prismaClient.customer.count();

  return {
    totalCustomers,
  };
}

async function getTotalItem() {
  const totalItems = await prismaClient.item.count();

  return {
    totalItems,
  };
}

async function getActiveDO() {
  const totalDOs = await prismaClient.deliveryOrder.count({
    where: {
      deletedAt: null,
    },
  });

  return {
    totalDOs,
  };
}

async function getTotalFleet() {
  const totalFleets = await prismaClient.fleet.count();

  return {
    totalFleets,
  };
}

async function getActiveShipment() {
  const totalShipment = await prismaClient.shipment.count({
    where: {
      deletedAt: null,
    },
  });

  return {
    totalShipment,
  };
}

export default {
  getTotalCustomer,
  getTotalItem,
  getActiveDO,
  getTotalFleet,
  getActiveShipment,
};
