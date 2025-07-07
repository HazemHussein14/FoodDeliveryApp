import { Router } from 'express';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { MenuController } from '../controllers';
import {
	addItemsToMenuBodySchema,
	createMenuBodySchema,
	menuParamSchema,
	restaurantParamSchema,
	deleteMenuBodySchema,
	setDefaultMenuBodySchema
} from '../validators';
const RestaurantRouter = Router();

const menuController = new MenuController();

RestaurantRouter.post(
	'/:restaurantId/menus',
	validateRequest({
		body: createMenuBodySchema,
		params: restaurantParamSchema
	}),
	menuController.createRestaurantMenu.bind(menuController)
);

RestaurantRouter.post(
	'/:restaurantId/menus/:menuId/items',
	validateRequest({ body: addItemsToMenuBodySchema, params: menuParamSchema }),
	menuController.addItemsToRestaurantMenu.bind(menuController)
);

RestaurantRouter.get(
	'/:restaurantId/menus/:menuId',
	validateRequest({ params: menuParamSchema }),
	menuController.getRestaurantMenuById.bind(menuController)
);

RestaurantRouter.get(
	'/:restaurantId/menus',
	validateRequest({ params: restaurantParamSchema }),
	menuController.getRestaurantMenus.bind(menuController)
);

RestaurantRouter.get(
	'/menu/history',
	// validateRequest({ body: menuController.getRestaurantMenuHistorySchema }),
	menuController.getRestaurantMenuHistory.bind(menuController)
);

RestaurantRouter.patch(
	'/:restaurantId/menus/:menuId/default',
	validateRequest({ params: menuParamSchema, body: setDefaultMenuBodySchema }),
	menuController.setDefaultRestaurantMenu.bind(menuController)
);

RestaurantRouter.put(
	'/menu',
	// validateRequest({ body: menuController.updateRestaurantMenuSchema }),
	menuController.updateRestaurantMenu.bind(menuController)
);

RestaurantRouter.delete(
	'/:restaurantId/menus/:menuId',
	validateRequest({ params: menuParamSchema, body: deleteMenuBodySchema }),
	menuController.deleteRestaurantMenu.bind(menuController)
);

RestaurantRouter.get(
	'/menu/search',
	// validateRequest({ body: menuController.searchForMenuItemsSchema }),
	menuController.searchForMenuItems.bind(menuController)
);

export default RestaurantRouter;
