export interface CreateRestaurantDto {
  ownerData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  restaurantData: {
    name: string;
    commercialRegistrationNumber: string;
    vatNumber: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
  };
  settings?: {
    serviceFeePercentage?: number;
    deliveryFeePercentage?: number;
  };
} 