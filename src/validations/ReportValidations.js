import Joi from "joi";

const getOutgoingGoodsValidation = Joi.object({
  itemId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id Barang harus berupa angka",
    "number.min": "Id Barang minimal 1",
    "number.positive": "Id Barang harus berupa angka positif",
    "any.required": "Id Barang diperlukan",
  }),
  customerId: Joi.number().min(1).positive().optional().messages({
    "number.base": "Id Kustomer harus berupa angka",
    "number.min": "Id Kustomer minimal 1",
    "number.positive": "Id Kustomer harus berupa angka positif",
    "any.required": "Id Kustomer diperlukan",
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
  sort: Joi.string().valid("ASC", "DESC").default("DESC").optional().messages({
    "string.base": "Sort harus berupa string",
    "any.only": "Sort hanya bisa 'ASC' atau 'DESC'",
  }),
  limit: Joi.number().integer().positive().optional().messages({
    "number.base": "Limit harus berupa angka",
    "number.integer": "Limit harus berupa angka bulat",
    "number.positive": "Limit harus berupa angka positif",
  }),
});

export { getOutgoingGoodsValidation };
