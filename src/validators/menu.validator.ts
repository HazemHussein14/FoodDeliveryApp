import Joi from 'joi';
import { idSchema } from './shared.validator';
import { CreateMenuRequestDTO } from '../dto/menu.dto';

export const restaurantParamSchema = Joi.object({
	restaurantId: idSchema.label('Restaurant ID')
});

export const menuParamSchema = Joi.object({
	restaurantId: idSchema.label('Restaurant ID'),
	menuId: idSchema.label('Menu ID')
});

export const createMenuBodySchema = Joi.object<CreateMenuRequestDTO>({
	userId: idSchema.label('User ID'),
	menuTitle: Joi.string().trim().min(1).max(100).required()
});
