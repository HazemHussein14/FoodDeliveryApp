import { Router } from 'express';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { MenuController } from '../controllers';
import { createMenuBodySchema, restaurantParamSchema } from '../validators';
const RestaurantRouter = Router();

const menuController = new MenuController();

RestaurantRouter.post(
	'/:restaurantId/menus',
	validateRequest({ body: createMenuBodySchema, params: restaurantParamSchema }),
	menuController.createRestaurantMenu.bind(menuController)
);

RestaurantRouter.get(
	'/menu',
	// validateRequest({ body: menuController.getRestaurantMenuSchema }),
	menuController.getRestaurantMenu.bind(menuController)
);

RestaurantRouter.get(
	'/menu/history',
	// validateRequest({ body: menuController.getRestaurantMenuHistorySchema }),
	menuController.getRestaurantMenuHistory.bind(menuController)
);

RestaurantRouter.get(
	'/menu/default',
	// validateRequest({ body: menuController.setDefaultRestaurantMenuSchema }),
	menuController.setDefaultRestaurantMenu.bind(menuController)
);

RestaurantRouter.put(
	'/menu',
	// validateRequest({ body: menuController.updateRestaurantMenuSchema }),
	menuController.updateRestaurantMenu.bind(menuController)
);

RestaurantRouter.delete(
	'/menu',
	// validateRequest({ body: menuController.deleteRestaurantMenuSchema }),
	menuController.deleteRestaurantMenu.bind(menuController)
);

RestaurantRouter.get(
	'/menu/search',
	// validateRequest({ body: menuController.searchForMenuItemsSchema }),
	menuController.searchForMenuItems.bind(menuController)
);

export default RestaurantRouter;
