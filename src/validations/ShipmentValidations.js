import Joi from "joi";

const getValidation = Joi.number().min(1).positive().required().messages({
  "number.base": "Id pengiriman harus berupa angka",
  "number.min": "Id pengiriman minimal 1",
  "number.positive": "Id pengiriman harus berupa angka positif",
  "any.required": "Id pengiriman diperlukan",
});

const getAllValidation = Joi.object({
  customerId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id kustomer harus berupa angka",
    "number.min": "Id kustomer minimal 1",
    "number.positive": "Id kustomer harus berupa angka positif",
    "any.required": "Id kustomer diperlukan",
  }),
  shipmentTypeId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id tipe pengiriman harus berupa angka",
    "number.min": "Id tipe pengiriman minimal 1",
    "number.positive": "Id tipe pengiriman harus berupa angka positif",
    "any.required": "Id tipe pengiriman diperlukan",
  }),
  licensePlate: Joi.string().trim().optional().empty().messages({
    "string.base": "Plat kendaraan harus berupa string",
    "string.empty": "Plat kendaraan tidak boleh kosong",
  }),
  address: Joi.string().trim().optional().empty().messages({
    "string.base": "Alamat harus berupa string",
    "string.empty": "Alamat tidak boleh kosong",
  }),

  status: Joi.string()
    .optional()
    .valid("UNPROCESSED", "PROCESSED", "COMPLETED")
    .empty()
    .messages({
      "string.base": "Status harus berupa string",
      "any.only":
        'Status  harus berupa salah satu dari nilai berikut: "UNPROCESSED" atau "PROCESSED" atau "COMPLETED"',
      "string.empty": "Status  tidak boleh kosong",
    }),

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
  shipmentId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id pengiriman harus berupa angka",
    "number.min": "Id pengiriman minimal 1",
    "number.positive": "Id pengiriman harus berupa angka positif",
    "any.required": "Id pengiriman diperlukan",
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
  details: Joi.string().trim().optional().empty().messages({
    "string.base": "Detil harus berupa string",
    "string.empty": "Detil tidak boleh kosong",
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
    "number.base": "Id kustomer harus berupa angka",
    "number.min": "Id kustomer minimal 1",
    "number.positive": "Id kustomer harus berupa angka positif",
    "any.required": "Id kustomer diperlukan",
  }),
  shipmentTypeId: Joi.number().min(1).positive().required().messages({
    "number.base": "Id tipe pengiriman harus berupa angka",
    "number.min": "Id tipe pengiriman minimal 1",
    "number.positive": "Id tipe pengiriman harus berupa angka positif",
    "any.required": "Id tipe pengiriman diperlukan",
  }),
  licensePlate: Joi.string()
    .regex(/^[A-Z]{1,2} \d{1,4} [A-Z]{1,3}$/)
    .optional()
    .messages({
      "string.base": "Plat nomor harus berupa string",
      "string.pattern.base":
        "Plat nomor harus mengikuti format: AA 1234 BBB (misalnya, AB 1234 CD)",
      "any.required": "Plat nomor diperlukan",
    }),

  address: Joi.string().optional().min(3).max(60000).empty().trim().messages({
    "string.base": "Alamat harus berupa string",
    "string.min":
      "Alamat tidak boleh kosong atau tidak boleh lebih kecil 3 karakter",
    "string.empty": "Alamat tidak boleh kosong",
    "string.max": "Alamat tidak boleh lebih besar dari 60,000 karakter",
    "any.requried": "Alamat diperlukan",
  }),
  internalNotes: Joi.string()
    .optional()
    .min(3)
    .max(60000)
    .empty()
    .trim()
    .messages({
      "string.base": "Catatan internal harus berupa string",
      "string.min":
        "Catatan internal tidak boleh kosong atau tidak boleh lebih kecil 3 karakter",
      "string.empty": "Catatan internal tidak boleh kosong",
      "string.max":
        "Catatan internal tidak boleh lebih besar dari 60,000 karakter",
      "any.requried": "Catatan internal diperlukan",
    }),

  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.number().integer().min(1).positive().required().messages({
          "number.base": "Id barang harus berupa angka",
          "number.integer": "Id barang must be an integer",
          "number.min": "Id barang tidak boleh lebih kecil dari 1 karakter",
          "number.positive": "Id barang harus berupa angka positif",
        }),
        quantity: Joi.number().integer().min(1).positive().required().messages({
          "number.base": "Kuantitas harus berupa angka",
          "number.integer": "Kuantitas must be an integer",
          "number.min": "Kuantitas tidak boleh lebih kecil dari 1 karakter",
          "number.positive": "Kuantitas harus berupa angka positif",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Barang harus berupa array",
      "array.min": "Setidaknya harus satu barang diperlukkan",
      "array.includesRequiredUnknowns":
        "Setiap barang harus menyertakan id barang dan kuantitas",
    }),
});

const updateValidation = Joi.object({
  shipmentId: Joi.number().min(1).positive().required().messages({
    "number.base": "Id pengiriman harus berupa angka",
    "number.min": "Id pengiriman minimal 1",
    "number.positive": "Id pengiriman harus berupa angka positif",
    "any.required": "Id pengiriman diperlukan",
  }),
  customerId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id kustomer harus berupa angka",
    "number.min": "Id kustomer minimal 1",
    "number.positive": "Id kustomer harus berupa angka positif",
    "any.required": "Id kustomer diperlukan",
  }),
  shipmentTypeId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id tipe pengiriman harus berupa angka",
    "number.min": "Id tipe pengiriman minimal 1",
    "number.positive": "Id tipe pengiriman harus berupa angka positif",
    "any.required": "Id tipe pengiriman diperlukan",
  }),
  licensePlate: Joi.string()
    .regex(/^[A-Z]{1,2} \d{1,4} [A-Z]{1,3}$/)
    .optional()
    .messages({
      "string.base": "Plat nomor harus berupa string",
      "string.pattern.base":
        "Plat nomor harus mengikuti format: AA 1234 BBB (misalnya, AB 1234 CD)",
      "any.required": "Plat nomor diperlukan",
    }),

  address: Joi.string().optional().min(3).max(60000).empty().trim().messages({
    "string.base": "Alamat harus berupa string",
    "string.min":
      "Alamat tidak boleh kosong atau tidak boleh lebih kecil 3 karakter",
    "string.empty": "Alamat tidak boleh kosong",
    "string.max": "Alamat tidak boleh lebih besar dari 60,000 karakter",
    "any.requried": "Alamat diperlukan",
  }),
  internalNotes: Joi.string()
    .optional()
    .min(3)
    .max(60000)
    .empty()
    .trim()
    .messages({
      "string.base": "Catatan internal harus berupa string",
      "string.min":
        "Catatan internal tidak boleh kosong atau tidak boleh lebih kecil 3 karakter",
      "string.empty": "Catatan internal tidak boleh kosong",
      "string.max":
        "Catatan internal tidak boleh lebih besar dari 60,000 karakter",
      "any.requried": "Catatan internal diperlukan",
    }),

  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.number().integer().min(1).positive().required().messages({
          "number.base": "Id barang barang harus berupa angka",
          "number.integer": "Id barang barang must be an integer",
          "number.min":
            "Id barang barang tidak boleh lebih kecil dari 1 karakter",
          "number.positive": "Id barang barang harus berupa angka positif",
        }),
        quantity: Joi.number().integer().min(1).positive().required().messages({
          "number.base": "Kuantitas harus berupa angka",
          "number.integer": "Kuantitas must be an integer",
          "number.min": "Kuantitas tidak boleh lebih kecil dari 1 karakter",
          "number.positive": "Kuantitas harus berupa angka positif",
        }),
      })
    )
    .min(1)
    .optional()
    .unique((a, b) => a.itemId === b.itemId) // Check for unique itemId
    .messages({
      "array.base": "Barang harus berupa array",
      "array.min": "Setidaknya harus satu barang diperlukkan",
      "array.includesRequiredUnknowns":
        "Setiap barang harus menyertakan id barang dan kuantitas",
      "array.unique": "Id barang tidak boleh duplikat", // Custom message for uniqueness
    }),
});

const updateStatusValidation = Joi.object({
  shipmentId: Joi.number().min(1).positive().required().messages({
    "number.base": "Id pengiriman harus berupa angka",
    "number.min": "Id pengiriman minimal 1",
    "number.positive": "Id pengiriman harus berupa angka positif",
    "any.required": "Id pengiriman diperlukan",
  }),

  status: Joi.string()
    .required()
    .valid("PROCESSED", "COMPLETED")
    .empty()
    .messages({
      "string.base": "Status harus berupa string",
      "any.only":
        'Status  harus berupa salah satu dari nilai berikut: "PROCESSED" atau "COMPLETED"',
      "string.empty": "Status tidak boleh kosong",
      "any.required": "Status diperlukan",
    }),
});

export {
  getValidation,
  getAllValidation,
  getLogsValidation,
  createValidation,
  updateValidation,
  updateStatusValidation,
};
