import { Router } from 'express';
import { signup, login, getMe, updateProfile, getUserById } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/user/:id', getUserById);
router.put('/profile', protect, updateProfile);

export default router;
