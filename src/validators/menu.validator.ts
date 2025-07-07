import Joi from 'joi';
import { idSchema } from './shared.validator';
import { AddItemsToMenuRequestDTO, CreateMenuRequestDTO } from '../dto/menu.dto';

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

export const addItemsToMenuBodySchema = Joi.object<AddItemsToMenuRequestDTO>({
	userId: idSchema.label('User ID'),
	items: Joi.array()
		.items(
			Joi.object({
				itemId: idSchema.label('Item ID')
			})
		)
		.min(1)
		.required()
});

export const deleteMenuBodySchema = Joi.object({
	userId: idSchema.label('User ID')
});

export const setDefaultMenuBodySchema = Joi.object({
	userId: idSchema.label('User ID')
});

export const searchMenuItemsQuerySchema = Joi.object({
	query: Joi.string().min(3).required()
});
