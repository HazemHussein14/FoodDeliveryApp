// Placeholder for AddressDto
export interface AddressDto {
  addressLine1: string;
  addressLine2?: string;
  city: string;
}

export interface CustomerResponseDto {
  customerId: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  birthDate?: Date;
  gender?: string;
  isActive: boolean;
  addresses: AddressDto[];
  createdAt: Date;
  updatedAt: Date;
} 