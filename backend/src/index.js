import cors from 'cors';
import express from 'express';
import authRouter from './routes/auth.js';
import cartRouter from './routes/cart.js';
import checkoutRouter from './routes/checkout.js';
import productsRouter from './routes/products.js';
import wishlistRouter from './routes/wishlist.js';
import { readDb } from './utils/storage.js';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }),
);
app.use(express.json());

app.get('/api/health', async (_request, response) => {
  const db = await readDb();
  response.status(200).json({
    status: 'ok',
    products: db.products.length,
    users: db.users.length,
  });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/cart', cartRouter);
app.use('/api/checkout', checkoutRouter);

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`NEXORA backend running on http://localhost:${PORT}`);
});
