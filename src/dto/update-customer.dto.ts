export interface UpdateCustomerDto {
  name?: string;
  phone?: string;
  birthDate?: Date;
  gender?: 'male' | 'female';
} 