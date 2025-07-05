import { Item } from '../models/item/item.entity';

export interface CreateItemData {
  name: string;
  description?: string;
  price: number;
  imagePath?: string;
  energyValCal?: number;
  notes?: string;
  isAvailable?: boolean;
}

export interface IItemRepository {
  createItem(data: CreateItemData): Promise<Item>;
  findItemById(itemId: number): Promise<Item | null>;
  updateItem(itemId: number, updateData: Partial<Item>): Promise<Item>;
  deleteItem(itemId: number): Promise<boolean>;
} 