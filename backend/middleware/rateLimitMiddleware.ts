// backend/middleware/rateLimitMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

const rateLimit = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction): Promise<void> => {
  const key = `rate:${req.user ? req.user.id : req.ip}`;
  const count = await redisClient.incr(key);
  if (count === 1) await redisClient.expire(key, 60);
  if (count > 10) {
    res.status(429).json({ msg: 'Too many requests' });
    return;
  }
  next();
};

export default rateLimit;