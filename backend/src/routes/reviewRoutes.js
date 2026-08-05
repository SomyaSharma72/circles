import express from 'express';
import { createReview, getReviewsForUser } from '../controllers/reviewController.js';

const router = express.Router();

// POST /api/reviews
router.post('/', createReview);

// GET /api/reviews/user/:userId
router.get('/user/:userId', getReviewsForUser);

export default router;
