export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  birthDate?: Date;
  gender?: 'male' | 'female';
  address?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
  };
} 