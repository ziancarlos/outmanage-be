import Joi from "joi";

const getValidation = Joi.number().min(1).positive().required().messages({
  "number.base": "Id DO harus berupa angka",
  "number.min": "Id DO minimal 1",
  "number.positive": "Id DO harus berupa angka positif",
  "any.required": "Id DO diperlukan",
});

const getAllValidation = Joi.object({
  customerId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id Kustomer harus berupa angka",
    "number.min": "Id Kustomer minimal 1",
    "number.positive": "Id Kustomer harus berupa angka positif",
    "any.required": "Id Kustomer diperlukan",
  }),
  status: Joi.string()
    .optional()
    .valid("SELESAI", "PROSES", "PENDING")
    .empty()
    .messages({
      "string.base": "Status harus berupa string",
      "any.only":
        'Status harus berupa salah satu dari nilai berikut: "SELESAI" atau "PROSES" atau "PENDING',
      "string.empty": "Status tidak boleh kosong",
    }),
  removedStatus: Joi.boolean().optional().messages({
    "boolean.base": "removedStatus harus berupa true atau false",
  }),
  date: Joi.object({
    startDate: Joi.date().iso().required().messages({
      "date.base": "Tanggal mulai harus merupakan tanggal ISO yang valid",
      "date.isoDate":
        "Tanggal mulai harus dalam format tanggal ISO (YYYY-MM-DD)",
      "any.required": "Tanggal mulai diperlukan.",
    }),
    endDate: Joi.date()
      .iso()
      .greater(Joi.ref("startDate"))
      .required()
      .messages({
        "date.base": "Tanggal selesai harus merupakan tanggal ISO yang valid",
        "date.isoDate":
          "Tanggal selesai harus dalam format tanggal ISO (YYYY-MM-DD)",
        "date.greater":
          "Tanggal Mulai tidak boleh lebih lambat dari Tanggal Selesai.",
      }),
  }).optional(),

  page: Joi.number().min(1).positive().default(1).messages({
    "number.base": "Halaman harus berupa angka",
    "number.min": "Halaman harus minimal 1",
    "number.positive": "Halaman harus berupa angka positif",
  }),
  size: Joi.number().min(1).positive().max(100).default(10).messages({
    "number.base": "Ukuran harus berupa angka",
    "number.min": "Ukuran harus minimal 1",
    "number.positive": "Ukuran harus berupa angka positif",
    "number.max": "Ukuran tidak boleh lebih besar dari 100",
  }),
});

const getLogsValidation = Joi.object({
  deliveryOrderId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id DO harus berupa angka",
    "number.min": "Id DO minimal 1",
    "number.positive": "Id DO harus berupa angka positif",
    "any.required": "Id DO diperlukan",
  }),
  changeType: Joi.string()
    .optional()
    .valid("UPDATE", "CREATE", "DELETE")
    .empty()
    .messages({
      "string.base": "Tipe perubahaan harus berupa string",
      "any.only":
        'Tipe perubahaan  harus berupa salah satu dari nilai berikut: "CREATE" atau "UPDATE" atau "DELETE"',
      "string.empty": "Tipe perubahaan  tidak boleh kosong",
    }),
  date: Joi.object({
    startDate: Joi.date().iso().required().messages({
      "date.base": "Tanggal mulai harus merupakan tanggal ISO yang valid",
      "date.isoDate":
        "Tanggal mulai harus dalam format tanggal ISO (YYYY-MM-DD)",
      "any.required": "Tanggal mulai diperlukan.",
    }),
    endDate: Joi.date()
      .iso()
      .greater(Joi.ref("startDate"))
      .required()
      .messages({
        "date.base": "Tanggal selesai harus merupakan tanggal ISO yang valid",
        "date.isoDate":
          "Tanggal selesai harus dalam format tanggal ISO (YYYY-MM-DD)",
        "date.greater":
          "Tanggal Mulai tidak boleh lebih lambat dari Tanggal Selesai.",
      }),
  }).optional(),
  page: Joi.number().min(1).positive().default(1).messages({
    "number.base": "Halaman harus berupa angka",
    "number.min": "Halaman harus minimal 1",
    "number.positive": "Halaman harus berupa angka positif",
  }),
  size: Joi.number().min(1).positive().max(100).default(10).messages({
    "number.base": "Ukuran harus berupa angka",
    "number.min": "Ukuran harus minimal 1",
    "number.positive": "Ukuran harus berupa angka positif",
    "number.max": "Ukuran tidak boleh lebih besar dari 100",
  }),
});

const createValidation = Joi.object({
  customerId: Joi.number().min(1).positive().required().messages({
    "number.base": "Id Kustomer harus berupa angka",
    "number.min": "Id Kustomer minimal 1",
    "number.positive": "Id Kustomer harus berupa angka positif",
    "any.required": "Id Kustomer diperlukan",
  }),
  address: Joi.string().optional().min(3).max(60000).trim().messages({
    "string.base": "Alamat harus berupa string",
    "string.min": "Alamat tidak boleh lebih kecil dari 3 karakter",
    "string.empty": "Alamat tidak boleh kosong",
    "string.max": "Alamat tidak boleh lebih besar dari 60.000 karakter",
    "any.required": "Alamat diperlukan",
  }),
  internalNotes: Joi.string().optional().min(3).max(60000).trim().messages({
    "string.base": "Catatan internal harus berupa string",
    "string.min": "Catatan internal tidak boleh lebih kecil dari 3 karakter",
    "string.empty": "Catatan internal tidak boleh kosong",
    "string.max":
      "Catatan internal tidak boleh lebih besar dari 60.000 karakter",
    "any.required": "Catatan internal diperlukan",
  }),
  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.number().integer().min(1).positive().required().messages({
          "number.base": "Id barang harus berupa angka",
          "number.integer": "Id barang must be an integer",
          "number.min": "Id barang harus lebih besar dari 0",
          "number.positive": "Id barang harus berupa angka positif",
        }),
        quantity: Joi.number().integer().min(1).positive().required().messages({
          "number.base": "Kuantitas harus berupa angka",
          "number.integer": "Kuantitas must be an integer",
          "number.min": "Kuantitas harus lebih besar dari 0",
          "number.positive": "Kuantitas harus berupa angka positif",
        }),
      })
    )
    .min(1)
    .required()
    .custom((value, helpers) => {
      const seenItemIds = new Set();

      for (const item of value) {
        if (seenItemIds.has(item.itemId)) {
          return helpers.error("array.unique", { id: item.itemId });
        }
        seenItemIds.add(item.itemId);
      }

      return value;
    })
    .messages({
      "array.base": "Barang harus berupa array",
      "array.min": "Setidaknya harus satu barang diperlukkan",
      "array.includesRequiredUnknowns":
        "Setiap barang harus menyertakan inventaris, kuantitas, dan harga",
      "array.unique": "ItemId {{#id}} tidak boleh duplikat", // Custom error message
    }),
});

const updateValidation = Joi.object({
  deliveryOrderId: Joi.number().min(1).positive().required().messages({
    "number.base": "Id DO harus berupa angka",
    "number.min": "Id DO minimal 1",
    "number.positive": "Id DO harus berupa angka positif",
    "any.required": "Id DO diperlukan",
  }),
  customerId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id Kustomer harus berupa angka",
    "number.min": "Id Kustomer minimal 1",
    "number.positive": "Id Kustomer harus berupa angka positif",
    "any.required": "Id Kustomer diperlukan",
  }),
  address: Joi.string().optional().min(3).max(60000).trim().messages({
    "string.base": "Alamat harus berupa string",
    "string.min": "Alamat tidak boleh lebih kecil dari 3 karakter",
    "string.empty": "Alamat tidak boleh kosong",
    "string.max": "Alamat tidak boleh lebih besar dari 60.000 karakter",
    "any.required": "Alamat diperlukan",
  }),
  internalNotes: Joi.string().optional().min(3).max(60000).trim().messages({
    "string.base": "Catatan internal harus berupa string",
    "string.min": "Catatan internal tidak boleh lebih kecil dari 3 karakter",
    "string.empty": "Catatan internal tidak boleh kosong",
    "string.max":
      "Catatan internal tidak boleh lebih besar dari 60.000 karakter",
    "any.required": "Catatan internal diperlukan",
  }),
  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.number().integer().min(1).positive().required().messages({
          "number.base": "Id barang harus berupa angka",
          "number.integer": "Id barang must be an integer",
          "number.min": "Id barang harus lebih besar dari 0",
          "number.positive": "Id barang harus berupa angka positif",
        }),
        quantity: Joi.number().integer().min(1).positive().required().messages({
          "number.base": "Kuantitas harus berupa angka",
          "number.integer": "Kuantitas must be an integer",
          "number.min": "Kuantitas harus lebih besar dari 0",
          "number.positive": "Kuantitas harus berupa angka positif",
        }),
      })
    )
    .min(1)
    .optional()
    .custom((value, helpers) => {
      const seenItemIds = new Set();

      for (const item of value) {
        if (seenItemIds.has(item.itemId)) {
          return helpers.error("array.unique", { id: item.itemId });
        }
        seenItemIds.add(item.itemId);
      }

      return value;
    })
    .messages({
      "array.base": "Barang harus berupa array",
      "array.min": "Setidaknya harus satu barang diperlukkan",
      "array.includesRequiredUnknowns":
        "Setiap barang harus menyertakan inventaris, kuantitas, dan harga",
      "array.unique": "ItemId {{#id}} tidak boleh duplikat", // Custom error message
    }),
});
export {
  getAllValidation,
  getLogsValidation,
  getValidation,
  createValidation,
  updateValidation,
};
