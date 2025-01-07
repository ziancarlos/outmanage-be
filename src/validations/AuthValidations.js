import Joi from "joi";

const loginValidation = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Nama pengguna diperlukan",
  }),
  password: Joi.string().required().messages({
    "any.required": "Kata sandi diperlukan",
  }),
});

const refreshValidation = Joi.string().required().messages({
  "any.required": "Token penyegaran diperlukan",
});

export { loginValidation, refreshValidation };
