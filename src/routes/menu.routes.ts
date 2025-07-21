import { Router } from 'express';
import { validateRequest, isAuthenticated, isActiveRestaurantOwner } from '../middlewares';
import { MenuController } from '../controllers';
import {
	addItemsToMenuBodySchema,
	createMenuBodySchema,
	menuParamSchema,
	deleteMenuBodySchema,
	setDefaultMenuBodySchema,
	searchMenuItemsQuerySchema,
	removeMenuItemBodySchema
} from '../validators';

const MenuRouter = Router();
const menuController = new MenuController();

MenuRouter.post(
	'/',
	isAuthenticated,
	isActiveRestaurantOwner,
	validateRequest({ body: createMenuBodySchema }),
	menuController.createRestaurantMenu.bind(menuController)
);

MenuRouter.get(
	'/:menuId',
	validateRequest({ params: menuParamSchema }),
	menuController.getMenuByIdWithItemDetails.bind(menuController)
);

MenuRouter.get('/', isAuthenticated, isActiveRestaurantOwner, menuController.getRestaurantMenus.bind(menuController));

MenuRouter.get(
	'/:menuId/history',
	// validateRequest({ body: menuController.getRestaurantMenuHistorySchema }),
	menuController.getRestaurantMenuHistory.bind(menuController)
);

MenuRouter.patch(
	'/:menuId/default',
	validateRequest({ body: setDefaultMenuBodySchema }),
	menuController.setDefaultRestaurantMenu.bind(menuController)
);

MenuRouter.put(
	'/:menuId',
	validateRequest({ body: createMenuBodySchema }),
	menuController.updateRestaurantMenu.bind(menuController)
);

MenuRouter.delete(
	'/:menuId',
	validateRequest({ body: deleteMenuBodySchema }),
	menuController.deleteRestaurantMenu.bind(menuController)
);

MenuRouter.get(
	'/search',
	validateRequest({ query: searchMenuItemsQuerySchema }),
	menuController.searchForMenuItems.bind(menuController)
);

// Menu Items routes
MenuRouter.post(
	'/:menuId/items',
	isAuthenticated,
	isActiveRestaurantOwner,
	validateRequest({ params: menuParamSchema, body: addItemsToMenuBodySchema }),
	menuController.addItemsToRestaurantMenu.bind(menuController)
);

MenuRouter.delete(
	'/items/:itemId',
	validateRequest({ body: removeMenuItemBodySchema }),
	menuController.removeItemFromRestaurantMenu.bind(menuController)
);
export default MenuRouter;
