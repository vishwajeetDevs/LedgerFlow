import Joi from "joi";

export const createRecordSchema = Joi.object({
  amount: Joi.number().required(),
  type: Joi.string().valid("income", "expense").required(),
  category_id: Joi.number().integer().required(),
  date: Joi.date().required(),
  notes: Joi.string().allow("", null),
});

export const updateRecordSchema = Joi.object({
  amount: Joi.number().required(),
  type: Joi.string().valid("income", "expense").required(),
  category_id: Joi.number().integer().required(),
  date: Joi.date().required(),
  notes: Joi.string().allow("", null),
});
