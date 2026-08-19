import { Router } from 'express';
import { createReview, getUserReviews, getReviewsByRequest } from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createReview);
router.get('/user/:userId', getUserReviews);
router.get('/request/:requestId', getReviewsByRequest);

export default router;
