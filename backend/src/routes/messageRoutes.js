import express from 'express';
import { getMessagesByRequestId, createMessage } from '../controllers/messageController.js';

const router = express.Router();

// GET /api/messages/:requestId
router.get('/:requestId', getMessagesByRequestId);

// POST /api/messages
router.post('/', createMessage);

export default router;
