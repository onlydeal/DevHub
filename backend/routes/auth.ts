// // backend/routes/auth.ts
// import { Router } from 'express';
// import { signup, login, refreshToken, resetPassword, updatePassword } from '../controllers/authController';
// import sanitizeInput from '../middleware/sanitizeMiddleware';

// const router = Router();

// router.post('/signup', sanitizeInput, signup);
// router.post('/login', sanitizeInput, login);
// router.post('/refresh', refreshToken);
// router.post('/reset', sanitizeInput, resetPassword);
// router.post('/update-password', sanitizeInput, updatePassword);

// export default router;




import express from 'express';
import { signup, login, refresh, resetPassword, updatePassword, updateProfile } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';
import sanitizeInput from '../middleware/sanitizeMiddleware';

const router = express.Router();

router.post('/signup', sanitizeInput, signup);
router.post('/login', sanitizeInput, login);
router.post('/refresh', refresh);
router.post('/reset', sanitizeInput, resetPassword);
router.post('/update-password', authMiddleware, sanitizeInput, updatePassword);
router.put('/profile', authMiddleware, sanitizeInput, updateProfile); // New route

export default router;