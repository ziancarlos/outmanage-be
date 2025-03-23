import ResponseError from "../errors/ResponseError.js";
import prismaClient from "../utils/Database.js";
import validate from "../validations/Validation.js";
import {
  getAllValidation,
  getLogsValidation,
  getValidation,
  createValidation,
  updateValidation,
} from "../validations/CustomerValidations.js";
import sanitize from "sanitize-html";

async function getCustomerByConstraints(
  where,
  select = null,
  status = 404,
  message = "Kustomer tidak ditemukan",
  check = (customer, status, message) => {
    if (!customer) {
      throw new ResponseError(status, message);
    }
  }
) {
  const customer = await prismaClient.customer.findFirst({
    where,

    select: select
      ? select
      : {
          customerId: true,
          name: true,
        },
  });

  check(customer, status, message);

  return customer;
}

async function createCustomerLog(
  customerId,
  userId,
  changeType,
  oldValue = null,
  newValue
) {
  return await prismaClient.customerLog.create({
    data: {
      customerId,
      userId,
      changeType,
      oldValue,
      newValue,
    },
  });
}

async function get(customerIdInput) {
  let { customerId, name } = await getCustomerByConstraints({
    customerId: validate(getValidation, customerIdInput),
  });

  return {
    customerId,
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

  const whereClause = filters.length > 0 ? { AND: filters } : {};

  const customers = await prismaClient.customer.findMany({
    where: whereClause,
    select: {
      customerId: true,
      name: true,
    },
    orderBy: {
      customerId: "desc",
    },
    take: size,
    skip,
  });

  const totalCustomers = await prismaClient.customer.count({
    where: whereClause,
  });

  return {
    data: customers.map(({ customerId, name }) => ({
      customerId,
      name,
    })),
    paging: {
      page,
      totalItem: totalCustomers,
      totalPage: Math.ceil(totalCustomers / size),
    },
  };
}

async function getLogs(request) {
  const { customerId, changeType, date, page, size } = validate(
    getLogsValidation,
    request
  );

  const skip = (page - 1) * size;

  const filters = [];

  if (customerId) {
    await getCustomerByConstraints({
      customerId,
    });

    filters.push({
      customerId,
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

  const whereClause = filters.length > 0 ? { AND: filters } : {};

  const customersLogs = await prismaClient.customerLog.findMany({
    select: {
      customerLogId: true,
      Customer: {
        select: {
          customerId: true,
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
      customerLogId: "desc",
    },

    take: size,
    skip,
  });

  const totalCustomersLogs = await prismaClient.customerLog.count({
    where: {
      AND: whereClause,
    },
  });

  return {
    data: customersLogs.map(
      ({
        customerLogId,
        Customer: customer,
        User: user,
        changeType,
        oldValue,
        newValue,
        createdAt,
      }) => ({
        customerLogId,
        customer: {
          customerId: customer.customerId,
          name: customer.name,
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
      totalItem: totalCustomersLogs,
      totalPage: Math.ceil(totalCustomersLogs / size),
    },
  };
}

async function create(req, userId) {
  let { name } = validate(createValidation, req);

  name = sanitize(name);
  name = name.toUpperCase();

  await getCustomerByConstraints(
    {
      name,
    },
    null,
    400,
    "Nama customer sudah digunakan",
    (customer, status, message) => {
      if (customer) {
        throw new ResponseError(status, message);
      }
    }
  );

  const customer = await prismaClient.customer.create({
    data: {
      name,
    },

    select: {
      customerId: true,
      name: true,
    },
  });

  createCustomerLog(customer.customerId, userId, "CREATE", null, customer);
}

async function update(request, userId) {
  const { customerId, name } = validate(updateValidation, request);

  let sanitizedName = name ? sanitize(name) : null;

  sanitizedName = sanitizedName.toUpperCase();

  const exisitingCustomer = await getCustomerByConstraints({
    customerId,
  });

  const changes = {};

  if (sanitizedName && sanitizedName !== exisitingCustomer.name) {
    await getCustomerByConstraints(
      {
        name: sanitizedName,
      },
      null,
      409,
      "Nama customer sudah digunakan",
      (customer, status, message) => {
        if (customer) {
          throw new ResponseError(status, message);
        }
      }
    );

    changes.name = sanitizedName;
  }

  if (Object.keys(changes).length === 0) {
    throw new ResponseError(409, "Tidak ada perubahan yang teridentifikasi");
  }

  const updatedCustomer = await prismaClient.customer.update({
    where: {
      customerId,
    },
    data: changes,
    select: {
      customerId: true,
      name: true,
    },
  });

  createCustomerLog(
    customerId,
    userId,
    "UPDATE",
    exisitingCustomer,
    updatedCustomer
  );

  return updatedCustomer;
}

export default {
  getCustomerByConstraints,
  get,
  getAll,
  getLogs,
  create,
  update,
};
