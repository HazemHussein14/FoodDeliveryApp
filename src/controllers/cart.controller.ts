import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import HttpStatusCodes from 'http-status-codes';
import { CartService } from '../services/cart.service';

export class CartController {
    private cartService = new CartService();
}
