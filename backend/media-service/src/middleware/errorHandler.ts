import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      error: err.message,
      stack: err.stack,
    }),
  );

  res.status(500).json({ error: 'Internal server error' });
}
