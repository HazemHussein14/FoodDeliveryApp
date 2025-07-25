import { Router } from 'express';
import { CartController } from '../controllers';
import { validateRequest } from '../middlewares/validate-request.middleware';
import {
	createCartBodySchema,
	clearCartSchema,
	removeItemParamsSchema,
	removeItemBodySchema,
	updateCartQuantitiesParamsSchema,
	updateCartQuantitiesBodySchema,
	addCartItemSchema
} from '../validators/cart.validator';
import { isAuthenticated } from '../middlewares/auth.middleware';

const CartRouter = Router();
const controller = new CartController();

// CartRouter.get('/view/:customerId', controller.viewCart.bind(controller));
CartRouter.get('/view', isAuthenticated, controller.viewCart.bind(controller));

CartRouter.post('/add-item', validateRequest({ body: addCartItemSchema }), controller.addItem.bind(controller));
/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management APIs
 */

// Assuming user is logged in
// TODO: Implement Auth middlewares

/**
 * @swagger
 * /cart/item/{cartItemId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     description: Removes a specific menu item from the user's shopping cart and updates cart totals
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart item to remove
 *     responses:
 *       200:
 *         description: Item successfully removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/globalResponse'
 *       404:
 *         description: Not Found - Cart item or cart not found or Customer Not Found
 *       403:
 *         description: Forbidden - Customer does not own the cart
 *       400:
 *         description: Bad Request - Cart Item does not belong to the cart or Cart Item does not belong to the cart
 *       401:
 *         description: Unauthorized - User is not authenticated
 *
 */
CartRouter.delete('/item/:cartItemId', isAuthenticated, validateRequest({ params: removeItemParamsSchema, body: removeItemBodySchema }), controller.removeItem.bind(controller));

CartRouter.delete('/:cartId', validateRequest({ params: clearCartSchema }), controller.clearCart.bind(controller));

/**
 * @swagger
 * /cart/{cartId}/update-cart-quantities/{cartItemId}:
 *   patch:
 *     summary: Update quantity for a specific cart item
 *     description: Updates the quantity of a given cart item in a specific cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 example: 3
 *                 description: The new quantity for the cart item
 *     responses:
 *       200:
 *         description: Quantity successfully updated
 *       400:
 *         description: Bad Request - Invalid quantity or cart is inactive
 *       404:
 *         description: Not Found - Cart or cart item not found
 */
CartRouter.put(
	'/:cartId/update-cart-quantities/:cartItemId',
	isAuthenticated,
	validateRequest({ params: updateCartQuantitiesParamsSchema, body: updateCartQuantitiesBodySchema }),
	controller.updateCartItemQuantity.bind(controller)
);

export default CartRouter;
