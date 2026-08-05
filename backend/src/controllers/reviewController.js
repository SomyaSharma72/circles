import mongoose from 'mongoose';
import Review from '../models/Review.js';
import User from '../models/User.js';

// @desc    Submit a review and update receiver's trust score and average rating
// @route   POST /api/reviews
// @access  Public
export const createReview = async (req, res, next) => {
  try {
    const { reviewerId, receiverId, requestId, rating, comment } = req.body;

    if (!reviewerId || !receiverId || !rating) {
      return res.status(400).json({
        status: 'error',
        message: 'Reviewer, receiver, and rating are required',
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be a number between 1 and 5',
      });
    }

    // Determine target user (receiver)
    let receiverUser = null;
    if (mongoose.Types.ObjectId.isValid(receiverId)) {
      receiverUser = await User.findById(receiverId);
    }

    // Fallback: search by name or email or return first user if mock ID
    if (!receiverUser) {
      receiverUser = await User.findOne({
        $or: [{ _id: receiverId }, { fullName: { $regex: receiverId, $options: 'i' } }],
      });
    }

    // Create review entry
    const validReviewerId = mongoose.Types.ObjectId.isValid(reviewerId) ? reviewerId : null;
    const validReceiverId = receiverUser ? receiverUser._id : (mongoose.Types.ObjectId.isValid(receiverId) ? receiverId : null);
    const validRequestId = mongoose.Types.ObjectId.isValid(requestId) ? requestId : null;

    let reviewDoc = null;
    if (validReviewerId && validReceiverId && validRequestId) {
      reviewDoc = await Review.create({
        reviewer: validReviewerId,
        receiver: validReceiverId,
        request: validRequestId,
        rating: numRating,
        comment: comment ? String(comment).trim() : '',
      });
    }

    // If receiver user exists in DB, recalculate trust score, completedFavors, averageRating
    if (receiverUser) {
      // 1. Trust Score delta rule:
      // 5 stars: +3
      // 4 stars: +2
      // 3 stars: 0
      // 2 stars: -2
      // 1 star: -5
      let trustDelta = 0;
      if (numRating === 5) trustDelta = 3;
      else if (numRating === 4) trustDelta = 2;
      else if (numRating === 3) trustDelta = 0;
      else if (numRating === 2) trustDelta = -2;
      else if (numRating === 1) trustDelta = -5;

      const currentScore = receiverUser.trustScore !== undefined ? receiverUser.trustScore : 95;
      const newTrustScore = Math.min(100, Math.max(0, currentScore + trustDelta));

      // 2. Increment completedFavors
      receiverUser.completedFavors = (receiverUser.completedFavors || 0) + 1;
      receiverUser.trustScore = newTrustScore;

      // 3. Recalculate average rating & total reviews
      if (validReceiverId) {
        const userReviews = await Review.find({ receiver: validReceiverId });
        const totalCount = userReviews.length;
        if (totalCount > 0) {
          const sumRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
          receiverUser.averageRating = Number((sumRating / totalCount).toFixed(1));
          receiverUser.totalReviews = totalCount;
        } else {
          receiverUser.totalReviews = (receiverUser.totalReviews || 0) + 1;
          receiverUser.averageRating = Number(
            (((receiverUser.averageRating || 5.0) * (receiverUser.totalReviews - 1) + numRating) / receiverUser.totalReviews).toFixed(1)
          );
        }
      } else {
        receiverUser.totalReviews = (receiverUser.totalReviews || 0) + 1;
        receiverUser.averageRating = Number(
          (((receiverUser.averageRating || 5.0) * (receiverUser.totalReviews - 1) + numRating) / receiverUser.totalReviews).toFixed(1)
        );
      }

      await receiverUser.save();
    }

    res.status(201).json({
      status: 'success',
      data: {
        review: reviewDoc,
        updatedUser: receiverUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
export const getReviewsForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: 'success', data: [] });
    }

    const reviews = await Review.find({ receiver: userId })
      .populate('reviewer', 'fullName name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
