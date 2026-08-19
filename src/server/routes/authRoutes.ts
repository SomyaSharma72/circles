import { Router } from 'express';
import {
  signup,
  login,
  getMe,
  updateProfile,
  getUserById,
  searchNeighbors,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/neighbors/search', searchNeighbors);
router.get('/neighbors', searchNeighbors);
router.get('/user/:id', getUserById);
router.put('/profile', protect, updateProfile);
router.post('/profile-setup', protect, updateProfile);
router.post('/block/:userId', protect, blockUser);
router.post('/unblock/:userId', protect, unblockUser);
router.get('/blocked', protect, getBlockedUsers);

export default router;
