import express from 'express';
import {
  loginUser,
  signupUser,
  updateUserProfile,
  getUserById,
  getAllUsers,
  getLeaderboard,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', signupUser);
router.get('/', getAllUsers);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUserById);
router.put('/:id', updateUserProfile);

export default router;
