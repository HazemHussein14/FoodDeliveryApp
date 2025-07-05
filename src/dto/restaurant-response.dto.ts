export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export interface RestaurantSettingsDto {
  serviceFeePercentage?: number;
  deliveryFeePercentage?: number;
}

export interface OwnerDto {
  userId: number;
  name: string;
  email: string;
  phone: string;
}

export interface RestaurantResponseDto {
  restaurantId: number;
  userId: number;
  name: string;
  logoUrl: string;
  bannerUrl: string;
  location: LocationData;
  status: string;
  commercialRegistrationNumber: string;
  vatNumber: string;
  isActive: boolean;
  settings: RestaurantSettingsDto;
  owner: OwnerDto;
  createdAt: Date;
  updatedAt: Date;
} 