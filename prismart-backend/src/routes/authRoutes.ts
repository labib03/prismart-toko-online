import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, updateProfile);

export default router;
