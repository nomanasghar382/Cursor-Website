import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { createToken, sanitizeUser, verifyToken } from '../utils/auth.js';
import { readDb, withDb } from '../utils/storage.js';

const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['buyer', 'seller']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

authRouter.post('/register', async (request, response) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: 'Invalid registration payload.', errors: parsed.error.flatten() });
  }

  const { name, email, password, role } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  return withDb(async (db) => {
    const existing = db.users.find((user) => user.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return response.status(409).json({ message: 'User already exists.' });
    }

    const user = {
      id: `user_${randomUUID()}`,
      name,
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 10),
      role: role ?? 'buyer',
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);

    const token = createToken(user);
    return response.status(201).json({ token, user: sanitizeUser(user) });
  });
});

authRouter.post('/login', async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: 'Invalid login payload.', errors: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  return withDb(async (db) => {
    const user = db.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return response.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return response.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = createToken(user);
    return response.status(200).json({ token, user: sanitizeUser(user) });
  });
});

authRouter.post('/demo', async (_request, response) => {
  return withDb(async (db) => {
    let user = db.users.find((entry) => entry.email === 'demo@nexora.ai');

    if (!user) {
      user = {
        id: 'demo-user',
        name: 'Demo Shopper',
        email: 'demo@nexora.ai',
        passwordHash: await bcrypt.hash('demo-pass', 10),
        role: 'buyer',
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    }

    const token = createToken(user);
    return response.status(200).json({ token, user: sanitizeUser(user) });
  });
});

authRouter.get('/me', async (request, response) => {
  const authorization = request.headers.authorization ?? '';
  const [, token] = authorization.split(' ');

  if (!token) {
    return response.status(401).json({ message: 'Missing bearer token.' });
  }

  try {
    const payload = verifyToken(token);
    const db = await readDb();
    const user = db.users.find((entry) => entry.id === payload.sub);
    if (!user) {
      return response.status(401).json({ message: 'Invalid token user.' });
    }
    return response.status(200).json({ user: sanitizeUser(user) });
  } catch {
    return response.status(401).json({ message: 'Invalid token.' });
  }
});

export default authRouter;
