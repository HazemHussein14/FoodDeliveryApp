import Joi from 'joi';
import { idSchema } from './shared.validator';
import { AddItemsToMenuRequestDTO, CreateMenuRequestDTO } from '../dto/menu.dto';

export const restaurantParamSchema = Joi.object({
	restaurantId: idSchema.label('Restaurant ID')
});

export const menuParamSchema = Joi.object({
	menuId: idSchema.label('Menu ID')
});

export const createMenuBodySchema = Joi.object<CreateMenuRequestDTO>({
	menuTitle: Joi.string().trim().min(1).max(100).required()
});

export const addItemsToMenuBodySchema = Joi.object<AddItemsToMenuRequestDTO>({
	items: Joi.array().items(idSchema.label('Item ID')).min(1).required()
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

export const menuItemParamSchema = Joi.object({
	restaurantId: idSchema.label('Restaurant ID'),
	menuId: idSchema.label('Menu ID'),
	itemId: idSchema.label('Item ID')
});

export const removeMenuItemBodySchema = Joi.object({
	userId: idSchema.label('User ID')
});
