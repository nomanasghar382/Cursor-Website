import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth.js';
import { cartToResponse, getOrCreateCart } from '../utils/cart.js';
import { withDb } from '../utils/storage.js';

const cartRouter = Router();

const addItemSchema = z.object({
  productId: z.string().min(2),
  quantity: z.number().int().min(1).max(20).optional(),
});

const patchItemSchema = z.object({
  quantity: z.number().int().min(0).max(99).optional(),
  quantityDelta: z.number().int().min(-20).max(20).optional(),
});

cartRouter.use(requireAuth);

cartRouter.get('/', async (request, response) => {
  return withDb(async (db) => {
    const cart = getOrCreateCart(db, request.authUser.id);
    return response.status(200).json(cartToResponse(cart, db.products));
  });
});

cartRouter.post('/items', async (request, response) => {
  const parsed = addItemSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: 'Invalid cart payload.', errors: parsed.error.flatten() });
  }

  const { productId, quantity = 1 } = parsed.data;

  return withDb(async (db) => {
    const product = db.products.find((entry) => entry.id === productId);
    if (!product) {
      return response.status(404).json({ message: 'Product not found.' });
    }

    const cart = getOrCreateCart(db, request.authUser.id);
    const item = cart.items.find((entry) => entry.productId === productId);
    if (item) {
      item.quantity = Math.min(item.quantity + quantity, 99);
    } else {
      cart.items.push({ productId, quantity });
    }

    return response.status(200).json(cartToResponse(cart, db.products));
  });
});

cartRouter.patch('/items/:productId', async (request, response) => {
  const parsed = patchItemSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: 'Invalid cart patch payload.', errors: parsed.error.flatten() });
  }

  return withDb(async (db) => {
    const cart = getOrCreateCart(db, request.authUser.id);
    const item = cart.items.find((entry) => entry.productId === request.params.productId);
    if (!item) {
      return response.status(404).json({ message: 'Cart item not found.' });
    }

    if (typeof parsed.data.quantity === 'number') {
      item.quantity = parsed.data.quantity;
    } else if (typeof parsed.data.quantityDelta === 'number') {
      item.quantity += parsed.data.quantityDelta;
    }

    if (item.quantity <= 0) {
      cart.items = cart.items.filter((entry) => entry.productId !== request.params.productId);
    }

    return response.status(200).json(cartToResponse(cart, db.products));
  });
});

cartRouter.delete('/items/:productId', async (request, response) => {
  return withDb(async (db) => {
    const cart = getOrCreateCart(db, request.authUser.id);
    cart.items = cart.items.filter((entry) => entry.productId !== request.params.productId);
    return response.status(200).json(cartToResponse(cart, db.products));
  });
});

cartRouter.post('/demo', async (request, response) => {
  return withDb(async (db) => {
    const demoIds = ['nx-watch-pro', 'nx-audio-halo', 'nx-lumen-lamp'];
    const cart = getOrCreateCart(db, request.authUser.id);
    cart.items = demoIds.map((id) => ({ productId: id, quantity: 1 }));
    return response.status(200).json(cartToResponse(cart, db.products));
  });
});

export default cartRouter;
