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
      return res.status(400).json({ error: 'Request ID, recipient ID, rating (1-5), and review comment are required' });
    }

    if (req.user.id === revieweeId) {
      return res.status(400).json({ error: 'You cannot review yourself' });
    }

    if (isDBConnected()) {
      try {
        const existingReview = await Review.findOne({
          request: requestId,
          reviewer: req.user.id,
        });
        if (existingReview) {
          return res.status(400).json({ error: 'You have already submitted a rating and review for this favor request' });
        }

        const requestDoc = await FavorRequest.findById(requestId);
        if (requestDoc) {
          const review = await Review.create({
            request: requestId,
            reviewer: req.user.id,
            reviewee: revieweeId,
            rating: Number(rating),
            comment: comment.trim(),
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
            .populate('reviewer', 'name avatarUrl trustScore neighborhood')
            .populate('reviewee', 'name avatarUrl trustScore neighborhood');

          try {
            const io = getIO();
            io.to(`user:${revieweeId}`).emit('review:created', populatedReview);
            io.to(`request:${requestId}`).emit('review:created', populatedReview);
          } catch (sErr) {
            console.warn('Socket notice:', sErr);
          }

          return res.status(201).json(populatedReview);
        }
      } catch (dbErr: any) {
        if (dbErr.code === 11000) {
          return res.status(400).json({ error: 'You have already submitted a review for this favor request' });
        }
        console.warn('MongoDB query failed in createReview, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    try {
      const createdRev = mockStore.createReview({
        request: requestId,
        reviewer: req.user.id,
        reviewee: revieweeId,
        rating: Number(rating),
        comment: comment.trim(),
      });

      try {
        const io = getIO();
        io.to(`user:${revieweeId}`).emit('review:created', createdRev);
        io.to(`request:${requestId}`).emit('review:created', createdRev);
      } catch (sErr) {
        console.warn('Socket notice:', sErr);
      }

      return res.status(201).json(createdRev);
    } catch (mockErr: any) {
      return res.status(400).json({ error: mockErr.message || 'Failed to submit review' });
    }
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

export const getReviewsByRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;

    if (isDBConnected()) {
      try {
        const reviews = await Review.find({ request: requestId })
          .populate('reviewer', 'name avatarUrl trustScore neighborhood')
          .populate('reviewee', 'name avatarUrl trustScore neighborhood')
          .sort({ createdAt: -1 });

        return res.json(reviews);
      } catch (dbErr) {
        console.warn('MongoDB query failed in getReviewsByRequest, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const reviews = mockStore.findReviewsByRequest(requestId);
    return res.json(reviews);
  } catch (err: any) {
    console.error('Get reviews by request error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews for this request' });
  }
};
