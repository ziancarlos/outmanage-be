import DashboardServices from "../services/DashboardServices.js";

async function getTotalCustomer(_, res, next) {
  try {
    const result = await DashboardServices.getTotalCustomer();

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}
async function getTotalItem(_, res, next) {
  try {
    const result = await DashboardServices.getTotalItem();

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}
async function getActiveDO(_, res, next) {
  try {
    const result = await DashboardServices.getActiveDO();

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}
async function getTotalFleet(_, res, next) {
  try {
    const result = await DashboardServices.getTotalFleet();

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}
async function getActiveShipment(_, res, next) {
  try {
    const result = await DashboardServices.getActiveShipment();

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
}

export default {
  getTotalCustomer,
  getTotalItem,
  getActiveDO,
  getTotalFleet,
  getActiveShipment,
};
