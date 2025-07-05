export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

export class CustomerValidator {
  validateRegistrationData(data: CreateCustomerDto): ValidationResult {
    // Comprehensive validation logic goes here
    return { valid: true };
  }

  validateUpdateData(data: UpdateCustomerDto): ValidationResult {
    // Update validation logic goes here
    return { valid: true };
  }
} 