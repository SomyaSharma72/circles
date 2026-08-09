import { Router } from 'express';
import {
  createRequest,
  getRequests,
  getNearbyRequests,
  getRecommendations,
  getRequestById,
  acceptRequest,
  completeRequest,
  matchSkills,
} from '../controllers/requestController';
import { getMessagesByRequest, sendMessage } from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/nearby', getNearbyRequests);
router.get('/recommendations', protect, getRecommendations);
router.get('/', getRequests);
router.post('/', protect, createRequest);
router.get('/:id', getRequestById);
router.post('/:id/accept', protect, acceptRequest);
router.post('/:id/complete', protect, completeRequest);
router.get('/:id/match-skills', matchSkills);
router.get('/:id/messages', protect, getMessagesByRequest);
router.post('/:id/messages', protect, sendMessage);

export default router;
