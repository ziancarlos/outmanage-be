import Joi from "joi";

const getValidation = Joi.number().min(1).positive().required().messages({
  "number.base": "Id peran harus berupa angka",
  "number.min": "Id peran minimal 1",
  "number.positive": "Id peran harus berupa angka positif",
  "any.required": "Id peran diperlukan",
});

const createValidation = Joi.object({
  name: Joi.string().required().min(3).max(50).empty().trim().messages({
    "string.base": "Nama harus berupa string",
    "string.min": "Nama tidak boleh lebih kecil dari 3 karakter",
    "string.empty": "Nama tidak boleh kosong",
    "string.max": "Nama tidak boleh lebih besar dari 50 karakter",
    "any.required": "Nama diperlukan",
  }),
});
const updateValidation = Joi.object({
  roleId: Joi.number().min(1).positive().required().messages({
    "number.base": "Id peran harus berupa angka",
    "number.min": "Id peran minimal 1",
    "number.positive": "Id peran harus berupa angka positif",
    "any.required": "Id peran diperlukan",
  }),

  name: Joi.string().required().min(3).max(50).empty().trim().messages({
    "string.base": "Nama harus berupa string",
    "string.min": "Nama tidak boleh lebih kecil dari 3 karakter",
    "string.empty": "Nama tidak boleh kosong",
    "string.max": "Nama tidak boleh lebih besar dari 50 karakter",
    "any.required": "Nama diperlukan",
  }),
});

const updatePermissionsValidation = Joi.object({
  roleId: Joi.number().min(1).positive().required().messages({
    "number.base": "Id peran harus berupa angka",
    "number.min": "Id peran minimal 1",
    "number.positive": "Id peran harus berupa angka positif",
    "any.required": "Id peran diperlukan",
  }),
  permissions: Joi.array()
    .min(1)
    .items(
      Joi.object({
        permissionId: Joi.number().min(1).positive().required().messages({
          "any.required": "Id izin diperlukan",
          "number.base": "Id izin harus berupa angka",
          "number.min": "Id izin minimal 1",
          "number.positive": "Id izin harus berupa angka positif",
        }),

        related: Joi.number().valid(0, 1).required().messages({
          "any.required": "Status relasi diperlukan",
          "number.base": "Status relasi harus berupa angka",
          "any.only": "Status relasi harus berupa 0 atau 1",
        }),
      }).required()
    )
    .required()
    .messages({
      "array.min": "Izin harus memiliki setidaknya 1 item",
      "array.base": "Izin harus berupa array",
      "any.required": "Izin diperlukan",
    }),
});

export {
  getValidation,
  createValidation,
  updateValidation,
  updatePermissionsValidation,
};
