import { Router } from 'express';
import { CartController } from '../controllers';
import { validateRequest } from '../middlewares/validate-request.middleware';
import {
	createCartBodySchema,
	clearCartSchema,
	removeItemSchema,
	updateCartQuantitiesParamsSchema,
	updateCartQuantitiesBodySchema
} from '../validators/cart.validator';

const CartRouter = Router();
const controller = new CartController();

CartRouter.get('/view/:customerId', controller.viewCart.bind(controller));
CartRouter.post('/add', controller.addCart.bind(controller));
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
 *       400:
 *         description: Bad Request - Cart is not active
 *       404:
 *         description: Not Found - Cart item or cart not found
 */

CartRouter.delete(
	'/item/:cartItemId',
	validateRequest({ params: removeItemSchema }),
	controller.removeItem.bind(controller)
);

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
 *                 minimum: 1
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
	validateRequest({ params: updateCartQuantitiesParamsSchema, body: updateCartQuantitiesBodySchema }),
	controller.updateCartQuantities.bind(controller)
);
export default CartRouter;
