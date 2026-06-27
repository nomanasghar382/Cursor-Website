import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth.js';
import { cartToResponse, getOrCreateCart } from '../utils/cart.js';
import { withDb } from '../utils/storage.js';

const checkoutRouter = Router();

const checkoutSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  city: z.string().min(2),
  country: z.string().min(2),
  cardNumber: z.string().min(8),
});

checkoutRouter.use(requireAuth);

checkoutRouter.post('/create', async (request, response) => {
  const parsed = checkoutSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: 'Invalid checkout payload.', errors: parsed.error.flatten() });
  }

  return withDb(async (db) => {
    const cart = getOrCreateCart(db, request.authUser.id);
    const snapshot = cartToResponse(cart, db.products);

    if (snapshot.summary.itemCount === 0) {
      return response.status(400).json({ message: 'Cart is empty.' });
    }

    const order = {
      id: `order_${randomUUID()}`,
      userId: request.authUser.id,
      status: 'confirmed',
      items: snapshot.items,
      summary: snapshot.summary,
      shipping: {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        city: parsed.data.city,
        country: parsed.data.country,
      },
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(order);
    cart.items = [];

    return response.status(201).json({ order, message: 'Order confirmed.' });
  });
});

checkoutRouter.get('/orders', async (request, response) => {
  return withDb(async (db) => {
    const orders = db.orders.filter((order) => order.userId === request.authUser.id);
    return response.status(200).json({ orders });
  });
});

export default checkoutRouter;
