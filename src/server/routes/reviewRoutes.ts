import { Router } from 'express';
import { createReview, getUserReviews } from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createReview);
router.get('/user/:userId', getUserReviews);

export default router;
