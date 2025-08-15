// backend/middleware/securityMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

const checkBlocked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const key = `block:${req.ip}`;
  const blocked = await redisClient.get(key);
  if (blocked) {
    res.status(403).json({ msg: 'IP blocked due to suspicious activity' });
    return;
  }
  next();
};

export default checkBlocked;