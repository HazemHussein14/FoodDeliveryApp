import { Menu } from '../models/menu/menu.entity';
import { MenuItem } from '../models/menu/menu-item.entity';

export interface CreateMenuData {
  restaurantId: number;
  menuTitle: string;
  isActive?: boolean;
}

export interface IMenuRepository {
  createMenu(data: CreateMenuData): Promise<Menu>;
  findMenuById(menuId: number): Promise<Menu | null>;
  findMenusByRestaurant(restaurantId: number): Promise<Menu[]>;
  updateMenu(menuId: number, updateData: Partial<Menu>): Promise<Menu>;
  deleteMenu(menuId: number): Promise<boolean>;
  addItemToMenu(menuId: number, itemId: number): Promise<MenuItem>;
  removeItemFromMenu(menuId: number, itemId: number): Promise<boolean>;
} 