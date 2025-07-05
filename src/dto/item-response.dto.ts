export interface ItemResponseDto {
  itemId: number;
  name: string;
  description: string;
  price: number;
  imagePath: string;
  energyValCal: number;
  notes: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
} 