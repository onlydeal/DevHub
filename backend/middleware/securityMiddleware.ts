// backend/middleware/securityMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URI });
client.connect();

const checkBlocked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const key = `block:${req.ip}`;
  const blocked = await client.get(key);
  if (blocked) {
    res.status(403).json({ msg: 'IP blocked due to suspicious activity' });
    return;
  }
  next();
};

export default checkBlocked;