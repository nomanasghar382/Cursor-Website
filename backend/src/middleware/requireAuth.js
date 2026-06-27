import { verifyToken } from '../utils/auth.js';
import { readDb } from '../utils/storage.js';

export async function requireAuth(request, response, next) {
  try {
    const authorization = request.headers.authorization ?? '';
    const [, token] = authorization.split(' ');

    if (!token) {
      return response.status(401).json({ message: 'Missing bearer token.' });
    }

    const payload = verifyToken(token);
    const db = await readDb();
    const user = db.users.find((entry) => entry.id === payload.sub);

    if (!user) {
      return response.status(401).json({ message: 'Invalid token user.' });
    }

    request.authUser = user;
    return next();
  } catch {
    return response.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function requireRole(...roles) {
  return (request, response, next) => {
    const userRole = request.authUser?.role;
    if (!roles.includes(userRole)) {
      return response.status(403).json({ message: 'Insufficient permissions.' });
    }
    return next();
  };
}
