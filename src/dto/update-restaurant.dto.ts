export interface UpdateRestaurantDto {
  name?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status?: 'open' | 'busy' | 'pause' | 'closed';
} 