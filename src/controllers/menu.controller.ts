import { Request, Response, Router } from 'express';
import { MenuService } from '../services/menu.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { sendResponse } from '../utils/sendResponse';

// Placeholder authentication/authorization middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => next();
const isRestaurantOwner = (req: Request, res: Response, next: Function) => next();

const router = Router();

// Assume menuService is instantiated and injected properly
const menuService = new MenuService(
  {} as any, // menuRepo
  {} as any, // itemService
  {} as any, // fileService
  {} as any, // cacheService
  {} as any, // validator
  {} as any  // logger
);

// POST /restaurants/:restaurantId/menus
router.post('/restaurants/:restaurantId/menus', isAuthenticated, isRestaurantOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId, 10);
    const menuData: CreateMenuDto = req.body;
    const result = await menuService.createMenu(restaurantId, menuData);
    sendResponse(res, 201, 'Menu created successfully', result);
  } catch (err: any) {
    sendResponse(res, 400, err.message || 'Menu creation failed');
  }
});

// GET /restaurants/:restaurantId/menus
router.get('/restaurants/:restaurantId/menus', async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId, 10);
    const result = await menuService.getRestaurantMenus(restaurantId);
    sendResponse(res, 200, 'Menus fetched', result);
  } catch (err: any) {
    sendResponse(res, 404, err.message || 'Menus not found');
  }
});

// PUT /restaurants/:restaurantId/menus/:menuId
router.put('/restaurants/:restaurantId/menus/:menuId', isAuthenticated, isRestaurantOwner, async (req: Request, res: Response) => {
  try {
    const menuId = parseInt(req.params.menuId, 10);
    const updateData: UpdateMenuDto = req.body;
    const result = await menuService.updateMenu(menuId, updateData);
    sendResponse(res, 200, 'Menu updated', result);
  } catch (err: any) {
    sendResponse(res, 400, err.message || 'Menu update failed');
  }
});

// POST /restaurants/:restaurantId/menus/:menuId/items
router.post('/restaurants/:restaurantId/menus/:menuId/items', isAuthenticated, isRestaurantOwner, async (req: Request, res: Response) => {
  try {
    const menuId = parseInt(req.params.menuId, 10);
    const itemData = req.body;
    const result = await menuService.addItemToMenu(menuId, itemData);
    sendResponse(res, 201, 'Item added to menu', result);
  } catch (err: any) {
    sendResponse(res, 400, err.message || 'Add item to menu failed');
  }
});

export default router; 