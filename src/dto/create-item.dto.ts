export interface CreateItemDto {
  name: string;
  description?: string;
  price: number;
  imagePath?: string;
  energyValCal?: number;
  notes?: string;
  isAvailable?: boolean;
} 