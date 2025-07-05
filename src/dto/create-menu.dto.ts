export interface CreateMenuDto {
  menuTitle: string;
  items?: CreateItemDto[];
}

export interface CreateItemDto {
  name: string;
  description?: string;
  price: number;
  energyValCal?: number;
  notes?: string;
  image?: File;
} 