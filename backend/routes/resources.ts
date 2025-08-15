// backend/routes/resources.ts
import { Router } from 'express';
import { getTrending } from '../controllers/resourceController';
import protect from '../middleware/authMiddleware';

const router = Router();

router.get('/trending', protect, getTrending);

export default router;