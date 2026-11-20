import { Router } from 'express';
import { register, login, socialLogin, getMe, logout, updateProfile } from '../controllers/authController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/social', socialLogin);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);

export default router;
