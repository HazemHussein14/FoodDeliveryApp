import Joi from 'joi';

export const idSchema = Joi.number().integer().positive().required().messages({
	'number.base': '{{#label}} must be a valid number',
	'number.integer': '{{#label}} must be an integer',
	'number.positive': '{{#label}} must be positive',
	'any.required': '{{#label}} is required'
});
