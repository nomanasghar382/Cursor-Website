import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { readDb, withDb } from '../utils/storage.js';

const productsRouter = Router();

const productPayloadSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  price: z.number().positive(),
  rating: z.number().min(0).max(5),
  stock: z.number().int().min(0),
  badge: z.string().min(2),
  aiMatch: z.number().min(0).max(100),
  description: z.string().min(6),
  gradient: z.string().min(2),
});

function applyFilters(products, { search = '', category = 'All', sort = 'featured' }) {
  let result = [...products];
  const query = search.trim().toLowerCase();

  if (category && category !== 'All') {
    result = result.filter((product) => product.category === category);
  }

  if (query) {
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.badge.toLowerCase().includes(query),
    );
  }

  if (sort === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'ai-match') {
    result.sort((a, b) => b.aiMatch - a.aiMatch);
  } else {
    result.sort((a, b) => b.aiMatch - a.aiMatch || b.rating - a.rating);
  }

  return result;
}

productsRouter.get('/', async (request, response) => {
  const db = await readDb();
  const products = applyFilters(db.products, {
    search: String(request.query.search ?? ''),
    category: String(request.query.category ?? 'All'),
    sort: String(request.query.sort ?? 'featured'),
  });

  return response.status(200).json({ products, count: products.length });
});

productsRouter.get('/:productId', async (request, response) => {
  const db = await readDb();
  const product = db.products.find((entry) => entry.id === request.params.productId);

  if (!product) {
    return response.status(404).json({ message: 'Product not found.' });
  }

  return response.status(200).json({ product });
});

productsRouter.post('/', requireAuth, requireRole('admin'), async (request, response) => {
  const parsed = productPayloadSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: 'Invalid product payload.', errors: parsed.error.flatten() });
  }

  return withDb(async (db) => {
    const slug = parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const id = `${slug}-${randomUUID().slice(0, 8)}`;
    const product = { id, ...parsed.data };
    db.products.push(product);
    return response.status(201).json({ product });
  });
});

productsRouter.put('/:productId', requireAuth, requireRole('admin'), async (request, response) => {
  const parsed = productPayloadSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: 'Invalid product payload.', errors: parsed.error.flatten() });
  }

  return withDb(async (db) => {
    const product = db.products.find((entry) => entry.id === request.params.productId);
    if (!product) {
      return response.status(404).json({ message: 'Product not found.' });
    }

    Object.assign(product, parsed.data);
    return response.status(200).json({ product });
  });
});

productsRouter.delete('/:productId', requireAuth, requireRole('admin'), async (request, response) => {
  return withDb(async (db) => {
    const index = db.products.findIndex((entry) => entry.id === request.params.productId);
    if (index === -1) {
      return response.status(404).json({ message: 'Product not found.' });
    }

    db.products.splice(index, 1);
    db.carts.forEach((cart) => {
      cart.items = cart.items.filter((item) => item.productId !== request.params.productId);
    });
    db.wishlists.forEach((wishlist) => {
      wishlist.productIds = wishlist.productIds.filter((id) => id !== request.params.productId);
    });

    return response.status(200).json({ message: 'Product removed.' });
  });
});

export default productsRouter;
