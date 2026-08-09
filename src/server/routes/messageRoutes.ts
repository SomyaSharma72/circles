import { Router } from 'express';
import { getMessagesByRequest, getUserConversations, sendMessage } from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/conversations', protect, getUserConversations);
router.get('/:requestId', protect, getMessagesByRequest);
router.post('/', protect, sendMessage);
router.post('/:requestId', protect, sendMessage);

export default router;
