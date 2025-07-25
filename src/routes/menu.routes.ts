import { Router } from 'express';
import { validateRequest, isAuthenticated, isActiveRestaurant } from '../middlewares';
import { MenuController } from '../controllers';
import {
	addItemsToMenuBodySchema,
	createMenuBodySchema,
	menuParamSchema,
	deleteMenuBodySchema,
	searchMenuItemsQuerySchema,
	removeMenuItemParamsSchema
} from '../validators';

const MenuRouter = Router();
const menuController = new MenuController();

MenuRouter.post(
	'/',
	isAuthenticated,
	isActiveRestaurant,
	validateRequest({ body: createMenuBodySchema }),
	menuController.createMenu.bind(menuController)
);

MenuRouter.get(
	'/:menuId',
	validateRequest({ params: menuParamSchema }),
	menuController.getMenuByIdWithItemDetails.bind(menuController)
);

MenuRouter.get('/', isAuthenticated, isActiveRestaurant, menuController.getRestaurantMenus.bind(menuController));

MenuRouter.patch(
	'/:menuId/default',
	isAuthenticated,
	isActiveRestaurant,
	validateRequest({ params: menuParamSchema }),
	menuController.setDefaultRestaurantMenu.bind(menuController)
);

MenuRouter.put(
	'/:menuId',
	isAuthenticated,
	isActiveRestaurant,
	validateRequest({ body: createMenuBodySchema, params: menuParamSchema }),
	menuController.updateRestaurantMenu.bind(menuController)
);

MenuRouter.delete(
	'/:menuId',
	isAuthenticated,
	isActiveRestaurant,
	validateRequest({ params: menuParamSchema }),
	menuController.deleteRestaurantMenu.bind(menuController)
);

MenuRouter.get(
	'/:menuId/search',
	validateRequest({ params: menuParamSchema, query: searchMenuItemsQuerySchema }),
	menuController.searchForMenuItems.bind(menuController)
);

// Menu Items routes
MenuRouter.post(
	'/:menuId/items',
	isAuthenticated,
	isActiveRestaurant,
	validateRequest({ params: menuParamSchema, body: addItemsToMenuBodySchema }),
	menuController.addItemsToMenu.bind(menuController)
);

MenuRouter.delete(
	'/:menuId/items/:itemId',
	isAuthenticated,
	isActiveRestaurant,
	validateRequest({ params: removeMenuItemParamsSchema }),
	menuController.removeItemFromMenu.bind(menuController)
);
export default MenuRouter;
