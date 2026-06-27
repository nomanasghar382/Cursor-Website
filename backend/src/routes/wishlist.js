import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getOrCreateWishlist } from '../utils/cart.js';
import { withDb } from '../utils/storage.js';

const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

wishlistRouter.get('/', async (request, response) => {
  return withDb(async (db) => {
    const wishlist = getOrCreateWishlist(db, request.authUser.id);
    return response.status(200).json({ productIds: wishlist.productIds });
  });
});

wishlistRouter.post('/:productId', async (request, response) => {
  const { productId } = request.params;

  return withDb(async (db) => {
    const exists = db.products.some((entry) => entry.id === productId);
    if (!exists) {
      return response.status(404).json({ message: 'Product not found.' });
    }

    const wishlist = getOrCreateWishlist(db, request.authUser.id);
    if (!wishlist.productIds.includes(productId)) {
      wishlist.productIds.push(productId);
    }

    return response.status(200).json({ productIds: wishlist.productIds });
  });
});

wishlistRouter.delete('/:productId', async (request, response) => {
  const { productId } = request.params;

  return withDb(async (db) => {
    const wishlist = getOrCreateWishlist(db, request.authUser.id);
    wishlist.productIds = wishlist.productIds.filter((entry) => entry !== productId);
    return response.status(200).json({ productIds: wishlist.productIds });
  });
});

export default wishlistRouter;
