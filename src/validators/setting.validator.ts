import Joi from 'joi';

export const settingValidator = {
	upsertSetting: Joi.object({
		key: Joi.string().required().min(1).max(100),
		value: Joi.any().required()
	})
};
