import Joi from "joi";

const getValidation = Joi.number().min(1).positive().required().messages({
  "number.base": "Id pengguna harus berupa angka",
  "number.min": "Id pengguna harus minimal 1",
  "number.positive": "Id pengguna harus berupa angka positif",
  "any.required": "Id pengguna diperlukan",
});

const getAllValidation = Joi.object({
  username: Joi.string().trim().optional().empty().messages({
    "string.base": "Username harus berupa string",
    "string.empty": "Username tidak boleh kosong",
  }),
  removedStatus: Joi.boolean().optional().default(false).messages({
    "boolean.base": "Status dihapus harus berupa boolean",
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

const getActivitiesValidation = Joi.object({
  activity: Joi.string()
    .optional()
    .trim()
    .valid("login_berhasil", "login_gagal")
    .empty()
    .messages({
      "string.base": "Aktifitas harus berupa string",
      "any.only":
        'Aktifitas harus berupa salah satu dari nilai berikut: "login_berhasil" atau "login_gagal"',
      "string.empty": "Aktifitas tidak boleh kosong",
    }),
  userId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id pengguna harus berupa angka",
    "number.min": "Id pengguna minimal 1",
    "number.positive": "Id pengguna harus berupa angka positif",
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
  username: Joi.string()
    .pattern(new RegExp(/^[A-z][A-z0-9-_]{3,50}$/))
    .required()
    .messages({
      "string.pattern.base":
        "Nama pengguna harus berupa alfanumerik dan panjangnya antara 3 hingga 50 karakter.",
      "any.required": "Nama pengguna diperlukan",
    }),

  password: Joi.string()
    .pattern(
      new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/)
    )
    .required()
    .messages({
      "string.pattern.base":
        "Kata sandi harus menyertakan huruf besar dan kecil, angka, dan karakter khusus.",
      "any.required": "Kata sandi diperlukan",
    }),
  roleId: Joi.number().min(1).positive().required().messages({
    "number.base": "Id peran harus berupa angka",
    "number.min": "Id peran harus minimal 1",
    "number.positive": "Id peran harus berupa angka positif",
    "any.required": "Id peran diperlukan",
  }),
});

const updateValidation = Joi.object({
  userId: Joi.number().min(1).positive().required().messages({
    "number.base": "Id pengguna harus berupa angka",
    "number.min": "Id pengguna minimal 1",
    "number.positive": "Id pengguna harus berupa angka positif",
    "any.required": "Id pengguna diperlukan",
  }),
  roleId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id peran harus berupa angka",
    "number.min": "Id peran harus minimal 1",
    "number.positive": "Id peran harus berupa angka positif",
  }),

  username: Joi.string()
    .pattern(new RegExp(/^[A-z][A-z0-9-_]{3,50}$/))
    .optional()
    .empty()
    .messages({
      "string.pattern.base":
        "Nama pengguna harus berupa alfanumerik dan panjangnya antara 3 hingga 50 karakter.",
    }),

  password: Joi.string()
    .pattern(
      new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/)
    )
    .optional()
    .allow(null)
    .messages({
      "string.pattern.base":
        "Kata sandi harus menyertakan huruf besar dan kecil, angka, dan karakter khusus.",
    }),
});

const getLogsValidation = Joi.object({
  userId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id pengguna harus berupa angka",
    "number.min": "Id pengguna minimal 1",
    "number.positive": "Id pengguna harus berupa angka positif",
    "any.required": "Id pengguna diperlukan",
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

export {
  getValidation,
  getAllValidation,
  getActivitiesValidation,
  createValidation,
  updateValidation,
  getLogsValidation,
};
