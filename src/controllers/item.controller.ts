import { Request, Response, Router } from 'express';
import { ItemService } from '../services/item.service';
import { UpdateItemDto } from '../dto/update-item.dto';
import { sendResponse } from '../utils/sendResponse';

// Placeholder authentication/authorization middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => next();
const isRestaurantOwner = (req: Request, res: Response, next: Function) => next();

const router = Router();

// Assume itemService is instantiated and injected properly
const itemService = new ItemService(
  {} as any, // itemRepo
  {} as any, // fileService
  {} as any, // cacheService
  {} as any  // validator
);

// PUT /items/:itemId
router.put('/items/:itemId', isAuthenticated, isRestaurantOwner, async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    const updateData: UpdateItemDto = req.body;
    const result = await itemService.updateItem(itemId, updateData);
    sendResponse(res, 200, 'Item updated', result);
  } catch (err: any) {
    sendResponse(res, 400, err.message || 'Item update failed');
  }
});

// PUT /items/:itemId/availability
router.put('/items/:itemId/availability', isAuthenticated, isRestaurantOwner, async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    const { isAvailable } = req.body;
    const result = await itemService.updateItem(itemId, { isAvailable });
    sendResponse(res, 200, 'Item availability updated', result);
  } catch (err: any) {
    sendResponse(res, 400, err.message || 'Item availability update failed');
  }
});

// PUT /items/:itemId/image
router.put('/items/:itemId/image', isAuthenticated, isRestaurantOwner, async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    // In a real app, use multer or similar to handle file upload
    // const image = req.file as any; // Placeholder
    const imagePath = await itemService.updateItemImage(itemId, undefined);
    sendResponse(res, 200, 'Item image updated', { imagePath });
  } catch (err: any) {
    sendResponse(res, 400, err.message || 'Item image update failed');
  }
});

export default router; 