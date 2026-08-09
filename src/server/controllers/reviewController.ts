import { Response } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review';
import User from '../models/User';
import FavorRequest from '../models/Request';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../sockets/socketHandler';
import { mockStore } from '../services/mockStore';

const isDBConnected = () => mongoose.connection.readyState === 1;

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Not authenticated' });

    const { requestId, revieweeId, rating, comment } = req.body;

    if (!requestId || !revieweeId || !rating || !comment) {
      return res.status(400).json({ error: 'Request, recipient, rating (1-5), and comment are required' });
    }

    if (req.user.id === revieweeId) {
      return res.status(400).json({ error: 'You cannot review yourself' });
    }

    if (isDBConnected()) {
      try {
        const requestDoc = await FavorRequest.findById(requestId);
        if (requestDoc) {
          const review = await Review.create({
            request: requestId,
            reviewer: req.user.id,
            reviewee: revieweeId,
            rating: Number(rating),
            comment,
          });

          const userReviews = await Review.find({ reviewee: revieweeId });
          const avgRating = userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length;

          const revieweeUser = await User.findById(revieweeId);
          if (revieweeUser) {
            const completedCount = revieweeUser.completedFavors || 0;
            const newTrustScore = Math.max(
              50,
              Math.min(100, Math.round(100 + (avgRating - 4) * 10 + completedCount * 2))
            );
            revieweeUser.trustScore = newTrustScore;
            await revieweeUser.save();
          }

          const populatedReview = await Review.findById(review._id)
            .populate('reviewer', 'name avatarUrl trustScore')
            .populate('reviewee', 'name avatarUrl trustScore');

          try {
            const io = getIO();
            io.to(`user:${revieweeId}`).emit('review:created', populatedReview);
          } catch (sErr) {
            console.warn('Socket notice:', sErr);
          }

          return res.status(201).json(populatedReview);
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed in createReview, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const createdRev = mockStore.createReview({
      request: requestId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      rating: Number(rating),
      comment,
    });

    try {
      const io = getIO();
      io.to(`user:${revieweeId}`).emit('review:created', createdRev);
    } catch (sErr) {
      console.warn('Socket notice:', sErr);
    }

    return res.status(201).json(createdRev);
  } catch (err: any) {
    console.error('Create review error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit neighbor review' });
  }
};

export const getUserReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (isDBConnected()) {
      try {
        const reviews = await Review.find({ reviewee: userId })
          .populate('reviewer', 'name avatarUrl trustScore neighborhood')
          .populate('request', 'title category')
          .sort({ createdAt: -1 });

        return res.json(reviews);
      } catch (dbErr) {
        console.warn('MongoDB query failed in getUserReviews, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const reviews = mockStore.findReviewsByUser(userId);
    return res.json(reviews);
  } catch (err: any) {
    console.error('Get user reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};
