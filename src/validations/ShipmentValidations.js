import Joi from "joi";

const getValidation = Joi.number().min(1).positive().required().messages({
  "number.base": "Id Pengiriman harus berupa angka",
  "number.min": "Id Pengiriman minimal 1",
  "number.positive": "Id Pengiriman harus berupa angka positif",
  "any.required": "Id Pengiriman diperlukan",
});

const createValidation = Joi.object({
  internalNotes: Joi.string().optional().min(3).max(60000).trim().messages({
    "string.base": "Catatan internal harus berupa string",
    "string.min": "Catatan internal tidak boleh lebih kecil dari 3 karakter",
    "string.empty": "Catatan internal tidak boleh kosong",
    "string.max":
      "Catatan internal tidak boleh lebih besar dari 60.000 karakter",
    "any.required": "Catatan internal diperlukan",
  }),

  licensePlate: Joi.string()
    .regex(/^[A-Z]{1,2} \d{1,4} [A-Z]{1,3}$/)
    .messages({
      "string.base": "Nomor polisi harus berupa string",
      "string.pattern.base":
        "Nomor polisi harus mengikuti format: AA 1234 BBB (misalnya, AB 1234 CD)",
      "any.required": "Nomor polisi diperlukan",
    }),

  fleetId: Joi.number().min(1).positive().messages({
    "number.base": "Id armada harus berupa angka",
    "number.min": "Id armada minimal 1",
    "number.positive": "Id armada harus berupa angka positif",
    "any.required": "Id armada diperlukan",
  }),

  deliveryOrders: Joi.array()
    .items(
      Joi.object({
        deliveryOrderId: Joi.number().min(1).positive().required().messages({
          "number.base": "Id DO harus berupa angka",
          "number.min": "Id DO minimal 1",
          "number.positive": "Id DO harus berupa angka positif",
          "any.required": "Id DO diperlukan",
        }),
        address: Joi.string().optional().min(3).max(60000).trim().messages({
          "string.base": "Alamat harus berupa string",
          "string.min": "Alamat tidak boleh lebih kecil dari 3 karakter",
          "string.empty": "Alamat tidak boleh kosong",
          "string.max": "Alamat tidak boleh lebih besar dari 60.000 karakter",
          "any.required": "Alamat diperlukan",
        }),

        shipmentDeliveryOrderType: Joi.string()
          .optional()
          .valid("RUMAH", "KANTOR", "GUDANG", "EKSPEDISI", "LAINNYA")
          .empty()
          .messages({
            "string.base": "Tipe pengiriman DO harus berupa string",
            "any.only":
              'Tipe pengiriman DO harus berupa salah satu dari nilai berikut: "RUMAH", "KANTOR", "GUDANG", "LAINNYA" atau "EKSPEDISI"',
            "string.empty": "Tipe pengiriman DO tidak boleh kosong",
          }),
        items: Joi.array()
          .items(
            Joi.object({
              deliveryOrderItemId: Joi.number()
                .integer()
                .min(1)
                .positive()
                .required()
                .messages({
                  "number.base": "Id barang DO harus berupa angka",
                  "number.integer": "Id barang DO must be an integer",
                  "number.min": "Id barang DO harus lebih besar dari 0",
                  "number.positive": "Id barang DO harus berupa angka positif",
                }),
              quantity: Joi.number()
                .integer()
                .min(1)
                .positive()
                .required()
                .messages({
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
              if (seenItemIds.has(item.deliveryOrderItemId)) {
                return helpers.error("array.unique", {
                  id: item.deliveryOrderItemId,
                });
              }
              seenItemIds.add(item.deliveryOrderItemId);
            }

            return value;
          })
          .messages({
            "array.base": "Barang DO harus berupa array",
            "array.min": "Setidaknya harus satu barang diperlukkan",
            "array.includesRequiredUnknowns":
              "Setiap barang harus menyertakan inventaris, kuantitas, dan harga",
            "array.unique": "deliveryOrderItemId {{#id}} tidak boleh duplikat",
          }),
      })
    )
    .min(1)
    .messages({
      "array.min": "Setidaknya harus ada satu Delivery Order",
    })
    .optional(),
}).xor("licensePlate", "fleetId"); // Hanya salah satu yang boleh ada

const getAllValidation = Joi.object({
  deliveryOrderId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id DO harus berupa angka",
    "number.min": "Id DO minimal 1",
    "number.positive": "Id DO harus berupa angka positif",
    "any.required": "Id DO diperlukan",
  }),
  licensePlate: Joi.string().optional().messages({
    "string.base": "Nomor polisi harus berupa string",
    "string.pattern.base":
      "Nomor polisi harus mengikuti format: AA 1234 BBB (misalnya, AB 1234 CD)",
  }),
  status: Joi.string().optional().valid("SELESAI", "PENDING").empty().messages({
    "string.base": "Status harus berupa string",
    "any.only":
      'Status harus berupa salah satu dari nilai berikut: "SELESAI" atau "PENDING',
    "string.empty": "Status tidak boleh kosong",
  }),
  shipmentType: Joi.string()
    .optional()
    .valid("ANTAR", "JEMPUT", "BELUM-DITENTUKAN")
    .empty()
    .messages({
      "string.base": "Status harus berupa string",
      "any.only":
        'Status harus berupa salah satu dari nilai berikut: "ANTAR" atau "JEMPUT" atau "BELUM-DITENTUKAN"',
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
  shipmentId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id Pengiriman harus berupa angka",
    "number.min": "Id Pengiriman minimal 1",
    "number.positive": "Id Pengiriman harus berupa angka positif",
    "any.required": "Id Pengiriman diperlukan",
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

const saveImageValidation = Joi.object({
  shipmentId: Joi.number().min(1).positive().required().messages({
    "number.base": "Id Pengiriman harus berupa angka",
    "number.min": "Id Pengiriman minimal 1",
    "number.positive": "Id Pengiriman harus berupa angka positif",
    "any.required": "Id Pengiriman diperlukan",
  }),
  imageUrl: Joi.string().uri().required().messages({
    "string.empty": "Image URL tidak boleh kosong",
    "string.uri": "Format Image URL tidak valid",
    "any.required": "Image URL wajib diisi",
  }),
});

export {
  getValidation,
  getAllValidation,
  createValidation,
  getLogsValidation,
  saveImageValidation,
};
