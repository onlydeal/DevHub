// backend/routes/posts.ts
import { Router } from 'express';
import { createPost, getFeed, searchPosts, addComment, getComments } from '../controllers/postController';
import protect from '../middleware/authMiddleware';
import sanitizeInput from '../middleware/sanitizeMiddleware';

const router = Router();

router.post('/', protect, sanitizeInput, createPost);
router.get('/feed', getFeed);
router.get('/search', searchPosts);
router.post('/comment', protect, sanitizeInput, addComment);
router.get('/comments', getComments);

export default router;