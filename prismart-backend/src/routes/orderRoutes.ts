import { Router } from 'express';
import { checkout, getUserOrders } from '../controllers/orderController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Protected order routes
router.post('/checkout', authenticateToken, checkout);
router.get('/', authenticateToken, getUserOrders);

export default router;
