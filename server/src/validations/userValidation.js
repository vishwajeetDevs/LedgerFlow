import Joi from "joi";

export const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role_id: Joi.number().required(),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role_id: Joi.number().valid(1, 2, 3).required(),
  is_active: Joi.boolean().required(),
});

export const changePasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required(),
});
