import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (!payload.sub) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }
    req.userId = payload.sub;
    next();
  } catch (err) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'auth_failed',
        reason: err instanceof Error ? err.message : 'Unknown error',
      }),
    );
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
