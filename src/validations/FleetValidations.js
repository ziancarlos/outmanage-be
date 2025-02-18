const getValidation = Joi.number().min(1).positive().required().messages({
  "number.base": "Id armada harus berupa angka",
  "number.min": "Id armada minimal 1",
  "number.positive": "Id armada harus berupa angka positif",
  "any.required": "Id armada diperlukan",
});

const getAllValidation = Joi.object({
  model: Joi.string().trim().optional().empty().messages({
    "string.base": "Model harus berupa string",
    "string.empty": "Model tidak boleh kosong",
  }),
  licensePlate: Joi.string().trim().optional().empty().messages({
    "string.base": "Nomor polisi harus berupa string",
    "string.empty": "Nomor polisi tidak boleh kosong",
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
  fleetId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id armada harus berupa angka",
    "number.min": "Id armada minimal 1",
    "number.positive": "Id armada harus berupa angka positif",
    "any.required": "Id armada diperlukan",
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
  model: Joi.string().required().min(3).max(100).empty().trim().messages({
    "string.base": "Model harus berupa string",
    "string.min": "Model tidak boleh lebih kecil dari 3 karakter",
    "string.empty": "Model tidak boleh kosong",
    "string.max": "Model tidak boleh lebih besar dari 100 karakter",
    "any.required": "Model diperlukan",
  }),

  licensePlate: Joi.string()
    .regex(/^[A-Z]{1,2} \d{1,4} [A-Z]{1,3}$/)
    .required()
    .messages({
      "string.base": "Nomor polisi harus berupa string",
      "string.pattern.base":
        "Nomor polisi harus mengikuti format: AA 1234 BBB (misalnya, AB 1234 CD)",
      "any.required": "Nomor polisi diperlukan",
    }),
});

const updateValidation = Joi.object({
  fleetId: Joi.number().min(1).positive().required().messages({
    "number.base": "Id armada harus berupa angka",
    "number.min": "Id armada minimal 1",
    "number.positive": "Id armada harus berupa angka positif",
    "any.required": "Id armada diperlukan",
  }),

  model: Joi.string().optional().min(3).max(100).empty().trim().messages({
    "string.base": "Model harus berupa string",
    "string.min": "Model tidak boleh lebih kecil dari 3 karakter",
    "string.empty": "Model tidak boleh kosong",
    "string.max": "Model tidak boleh lebih besar dari 100 karakter",
    "any.required": "Model diperlukan",
  }),

  licensePlate: Joi.string()
    .regex(/^[A-Z]{1,2} \d{1,4} [A-Z]{1,3}$/)
    .optional()
    .messages({
      "string.base": "Nomor polisi harus berupa string",
      "string.pattern.base":
        "Nomor polisi harus mengikuti format: AA 1234 BBB (misalnya, AB 1234 CD)",
      "any.required": "Nomor polisi diperlukan",
    }),
});

export {
  getAllValidation,
  getLogsValidation,
  getValidation,
  createValidation,
  updateValidation,
};
