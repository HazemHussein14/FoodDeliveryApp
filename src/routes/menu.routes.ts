import { Router } from 'express';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { MenuController } from '../controllers';
import {
	addItemsToMenuBodySchema,
	createMenuBodySchema,
	menuParamSchema,
	restaurantParamSchema,
	deleteMenuBodySchema,
	setDefaultMenuBodySchema,
	searchMenuItemsQuerySchema,
	menuItemParamSchema,
	removeMenuItemBodySchema
} from '../validators';

const MenuRouter = Router();
const menuController = new MenuController();

MenuRouter.post(
	'/',
	validateRequest({ body: createMenuBodySchema }),
	menuController.createRestaurantMenu.bind(menuController)
);

MenuRouter.get(
	'/:menuId',
	validateRequest({ params: menuParamSchema }),
	menuController.getRestaurantMenuById.bind(menuController)
);

MenuRouter.get('/', menuController.getRestaurantMenus.bind(menuController));

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
	'/items',
	validateRequest({ body: addItemsToMenuBodySchema }),
	menuController.addItemsToRestaurantMenu.bind(menuController)
);

MenuRouter.delete(
	'/items/:itemId',
	validateRequest({ body: removeMenuItemBodySchema }),
	menuController.removeItemFromRestaurantMenu.bind(menuController)
);
export default MenuRouter;
