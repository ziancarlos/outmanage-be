import Joi from "joi";

const getValidation = Joi.number().min(1).positive().required().messages({
  "number.base": "Id barang harus berupa angka",
  "number.min": "Id barang minimal 1",
  "number.positive": "Id barang harus berupa angka positif",
  "any.required": "Id barang diperlukan",
});

const getAllValidation = Joi.object({
  name: Joi.string().trim().optional().empty().messages({
    "string.base": "Nama harus berupa string",
    "string.empty": "Nama tidak boleh kosong",
  }),
  stockKeepingUnit: Joi.string().trim().optional().empty().messages({
    "string.base": "Sku harus berupa string",
    "string.empty": "Sku tidak boleh kosong",
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
  itemId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id barang harus berupa angka",
    "number.min": "Id barang minimal 1",
    "number.positive": "Id barang harus berupa angka positif",
    "any.required": "Id barang diperlukan",
  }),
  changeType: Joi.string()
    .optional()
    .valid("UPDATE", "CREATE")
    .empty()
    .messages({
      "string.base": "Tipe perubahaan harus berupa string",
      "any.only":
        'Tipe perubahaan  harus berupa salah satu dari nilai berikut: "CREATE" atau "UPDATE"',
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
  name: Joi.string().required().min(3).max(150).empty().trim().messages({
    "string.base": "Nama harus berupa string",
    "string.min": "Nama tidak boleh lebih kecil dari 3 karakter",
    "string.empty": "Nama tidak boleh kosong",
    "string.max": "Nama tidak boleh lebih besar dari 150 karakter",
    "any.required": "Nama diperlukan",
  }),
  stockKeepingUnit: Joi.string()
    .required()
    .min(3)
    .max(30)
    .empty()
    .trim()
    .messages({
      "string.base": "Sku harus berupa string",
      "string.min": "Sku tidak boleh lebih kecil dari 1 karakter",
      "string.empty": "Sku tidak boleh kosong",
      "string.max": "Sku tidak boleh lebih besar dari 5 karakter",
      "any.required": "Sku diperlukan",
    }),
});

const updateValidation = Joi.object({
  itemId: Joi.number().min(1).positive().required().messages({
    "number.base": "Id barang harus berupa angka",
    "number.min": "Id barang minimal 1",
    "number.positive": "Id barang harus berupa angka positif",
    "any.required": "Id barang diperlukan",
  }),
  name: Joi.string().optional().min(3).max(150).empty().trim().messages({
    "string.base": "Nama harus berupa string",
    "string.min": "Nama tidak boleh lebih kecil dari 3 karakter",
    "string.empty": "Nama tidak boleh kosong",
    "string.max": "Nama tidak boleh lebih besar dari 150 karakter",
    "any.required": "Nama diperlukan",
  }),
  stockKeepingUnit: Joi.string()
    .optional()
    .min(3)
    .max(30)
    .empty()
    .trim()
    .messages({
      "string.base": "Sku harus berupa string",
      "string.min": "Sku tidak boleh lebih kecil dari 1 karakter",
      "string.empty": "Sku tidak boleh kosong",
      "string.max": "Sku tidak boleh lebih besar dari 5 karakter",
      "any.required": "Sku diperlukan",
    }),
});

export {
  getAllValidation,
  getLogsValidation,
  getValidation,
  createValidation,
  updateValidation,
};
