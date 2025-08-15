// backend/middleware/rateLimitMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URI });
client.connect();

const rateLimit = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction): Promise<void> => {
  const key = `rate:${req.user ? req.user.id : req.ip}`;
  const count = await client.incr(key);
  if (count === 1) await client.expire(key, 60);
  if (count > 10) {
    res.status(429).json({ msg: 'Too many requests' });
    return;
  }
  next();
};

export default rateLimit;