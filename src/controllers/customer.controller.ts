import { Router, Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendResponse } from '../utils/sendResponse';

const router = Router();
const customerService = new CustomerService(/* inject dependencies as needed */);

router.post('/register', async (req: Request, res: Response) => {
  try {
    const result = await customerService.registerCustomer(req.body.email, req.body);
    sendResponse(res, 201, 'Customer registered', result);
  } catch (err: any) {
    sendResponse(res, 400, err.message || 'Registration failed');
  }
});

router.get('/:customerId', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    const result = await customerService.getCustomerProfile(customerId);
    sendResponse(res, 200, 'Customer profile', result);
  } catch (err: any) {
    sendResponse(res, 404, err.message || 'Customer not found');
  }
});

router.put('/:customerId', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    const result = await customerService.updateCustomerProfile(customerId, req.body);
    sendResponse(res, 200, 'Customer updated', result);
  } catch (err: any) {
    sendResponse(res, 400, err.message || 'Update failed');
  }
});

export default router; 