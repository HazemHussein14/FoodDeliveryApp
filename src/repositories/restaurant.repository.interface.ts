import { Restaurant } from '../models/restaurant/restaurant.entity';
import { RestaurantSettings } from '../models/restaurant/restaurant-settings.entity';

export interface CreateRestaurantData {
  userId: number;
  name: string;
  commercialRegistrationNumber: string;
  vatNumber: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  logoUrl?: string;
  bannerUrl?: string;
}

export interface IRestaurantRepository {
  createRestaurant(data: CreateRestaurantData): Promise<Restaurant>;
  findRestaurantById(restaurantId: number): Promise<Restaurant | null>;
  updateRestaurant(restaurantId: number, updateData: Partial<Restaurant>): Promise<Restaurant>;
  deleteRestaurant(restaurantId: number): Promise<boolean>;
  findRestaurantsWithPagination(offset: number, limit: number): Promise<{ restaurants: Restaurant[]; total: number }>;
  getSettings(restaurantId: number): Promise<RestaurantSettings | null>;
  updateSettings(restaurantId: number, settings: Partial<RestaurantSettings>): Promise<RestaurantSettings>;
} 