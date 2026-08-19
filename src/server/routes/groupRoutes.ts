import { Router } from 'express';
import {
  getGroups,
  getGroupById,
  createGroup,
  joinGroup,
  leaveGroup,
  deleteGroup,
  getGroupMessages,
  sendGroupMessage,
} from '../controllers/groupController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getGroups);
router.post('/', protect, createGroup);
router.get('/:id', protect, getGroupById);
router.delete('/:id', protect, deleteGroup);
router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);
router.get('/:id/messages', protect, getGroupMessages);
router.post('/:id/messages', protect, sendGroupMessage);

export default router;
