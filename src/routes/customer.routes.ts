import { Router } from 'express';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { CustomerController } from '../controllers/customer.controller';
import {
	deactivateCustomerSchema,
	viewCustomerOrderStatus,
	submitCustomerFeedbackValidations,
	viewCustomerOrderHistory,
	addAddressSchema,
	updateAddressSchema,
	deleteAddressSchema,
	getAddressSchema,
	getAllAddressesSchema,
	setDefaultAddressSchema,
	setPreferredPaymentMethodSchema
} from '../validators/customer.validator';

const customerRouter = Router();
const customerController = new CustomerController();

/**
 * @swagger
 * tags:
 *   - name: Customer
 *     description: Customer management
 *   - name: Address
 *     description: Customer address management
 */

/**
 * @swagger
 * /customers/{customerId}/deactivate:
 *   post:
 *     summary: Deactivate a customer account
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the customer to deactivate
 *     responses:
 *       200:
 *         description: Customer deactivated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */
customerRouter.post('/:customerId/deactivate', isAuthenticated, validateRequest({ params: deactivateCustomerSchema }), customerController.deactivte.bind(customerController));

/**
 * @swagger
 * /customers/{customerId}/orders/{orderId}/status:
 *   get:
 *     summary: View the status of a specific order
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ID
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The order's ID
 *     responses:
 *       200:
 *         description: Order status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer or Order not found
 */
customerRouter.get(
	'/:customerId/orders/:orderId/status',
	isAuthenticated,
	validateRequest({ params: viewCustomerOrderStatus }),
	customerController.viewOrderStatus.bind(customerController)
);

/**
 * @swagger
 * /customers/{customerId}/orders/{orderId}/feedback:
 *   post:
 *     summary: Submit feedback for an order
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ID
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The order's ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 format: float
 *                 description: Rating for the order (e.g., 4.5)
 *               comment:
 *                 type: string
 *                 description: Feedback comment
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer or Order not found
 */
customerRouter.post(
	'/:customerId/orders/:orderId/feedback',
	isAuthenticated,
	validateRequest(submitCustomerFeedbackValidations),
	customerController.submitOrderFeedback.bind(customerController)
);

/**
 * @swagger
 * /customers/{customerId}/orders/history:
 *   get:
 *     summary: View customer's order history
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ID
 *     responses:
 *       200:
 *         description: Order history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */
customerRouter.get(
	'/:customerId/orders/history',
	isAuthenticated,
	validateRequest({ params: viewCustomerOrderHistory }),
	customerController.viewOrderHistory.bind(customerController)
);

/**
 * @swagger
 * /customers/{customerId}/addresses:
 *   post:
 *     summary: Add a new address for a customer
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address added successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */
customerRouter.post('/:customerId/addresses', isAuthenticated, validateRequest(addAddressSchema), customerController.addAddress.bind(customerController));

/**
 * @swagger
 * /customers/{customerId}/addresses/{addressId}:
 *   put:
 *     summary: Update a customer's address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ID
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: The address's ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer or Address not found
 */
customerRouter.put('/:customerId/addresses/:addressId', isAuthenticated, validateRequest(updateAddressSchema), customerController.updateAddress.bind(customerController));

/**
 * @swagger
 * /customers/{customerId}/addresses/{addressId}:
 *   delete:
 *     summary: Delete a customer's address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ID
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: The address's ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer or Address not found
 */
customerRouter.delete(
	'/:customerId/addresses/:addressId',
	isAuthenticated,
	validateRequest({ params: deleteAddressSchema }),
	customerController.deleteAddress.bind(customerController)
);

/**
 * @swagger
 * /customers/{customerId}/addresses/{addressId}:
 *   get:
 *     summary: Get a specific address for a customer
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ID
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: The address's ID
 *     responses:
 *       200:
 *         description: Address retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer or Address not found
 */
customerRouter.get('/:customerId/addresses/:addressId', isAuthenticated, validateRequest({ params: getAddressSchema }), customerController.getAddress.bind(customerController));

/**
 * @swagger
 * /customers/{customerId}/addresses:
 *   get:
 *     summary: Get all addresses for a customer
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ID
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */
customerRouter.get('/:customerId/addresses', isAuthenticated, validateRequest({ params: getAllAddressesSchema }), customerController.getAllAddresses.bind(customerController));

/**
 * @swagger
 * /customers/{customerId}/addresses/{addressId}/set-default:
 *   patch:
 *     summary: Set a default address for a customer
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ID
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: The address's ID to set as default
 *     responses:
 *       200:
 *         description: Default address set successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer or Address not found
 */
customerRouter.patch(
	'/:customerId/addresses/:addressId/set-default',
	isAuthenticated,
	validateRequest({ params: setDefaultAddressSchema }),
	customerController.setDefaultAddress.bind(customerController)
);

/**
 * @swagger
 * /customers/{customerId}/preferred-payment-method:
 *   patch:
 *     summary: Set preferred payment method for a customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *                 description: The ID of the preferred payment method
 *     responses:
 *       200:
 *         description: Preferred payment method set successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer or Payment method not found
 */
customerRouter.patch(
	'/:customerId/preferred-payment-method',
	isAuthenticated,
	validateRequest(setPreferredPaymentMethodSchema),
	customerController.setPreferredPaymentMethod.bind(customerController)
);

export default customerRouter;
