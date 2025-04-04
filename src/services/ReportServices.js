import prismaClient from "../utils/Database.js";
import { getOutgoingGoodsValidation } from "../validations/ReportValidations.js";
import validate from "../validations/Validation.js";
import CustomerServices from "./CustomerServices.js";
import ItemServices from "./ItemServices.js";

async function getOutgoingItems(req) {
  const { customerId, itemId, date, limit, sort } = validate(
    getOutgoingGoodsValidation,
    req
  );

  let query = `
      SELECT 
          i.itemId,
          i.name AS itemName,
          SUM(sdoi.quantity) AS totalShippedQuantity
      FROM items i
      JOIN delivery_orders_items doi ON i.itemId = doi.itemId
      JOIN shipment_deliveries_orders_items sdoi ON doi.deliveryOrderItemId = sdoi.deliveryOrderItemId
      JOIN shipment_deliveries_orders sdo ON sdoi.shipmentDeliveryOrderId = sdo.shipmentDeliveryOrderId
      JOIN shipments s ON sdo.shipmentId = s.shipmentId
      JOIN delivery_orders do ON doi.deliveryOrderId = do.deliveryOrderId
      WHERE 1=1
    `;

  const params = [];

  if (customerId) {
    CustomerServices.getCustomerByConstraints({ customerId });
    query += ` AND do.customerId = ?`;
    params.push(customerId);
  }

  if (itemId) {
    ItemServices.getItemByConstraints({ itemId });

    query += ` AND i.itemId = ?`;
    params.push(itemId);
  }

  if (date?.startDate && date?.endDate) {
    if (new Date(date.startDate) > new Date(date.endDate)) {
      throw new ResponseError(400, "Start date cannot be later than end date.");
    }

    query += ` AND s.createdAt BETWEEN ? AND ?`;
    params.push(new Date(date.startDate), new Date(date.endDate));
  }

  query += `
      GROUP BY i.itemId, i.name
      ORDER BY totalShippedQuantity ${sort}
      ${limit ? `LIMIT ?` : ""};
    `;

  if (limit) {
    params.push(limit);
  }

  const items = await prismaClient.$queryRawUnsafe(query, ...params);

  return items.map(({ itemId, itemName, totalShippedQuantity }) => {
    return {
      item: {
        itemId,
        name: itemName,
      },
      totalShippedQuantity,
    };
  });
}

export default {
  getOutgoingItems,
};
