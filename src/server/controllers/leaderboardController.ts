import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import FavorRequest from '../models/Request';
import Review from '../models/Review';
import { mockStore } from '../services/mockStore';

const isDBConnected = () => mongoose.connection.readyState === 1;

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      try {
        const topNeighbors = await User.find()
          .select('name avatarUrl trustScore completedFavors neighborhood profession skills bio')
          .sort({ trustScore: -1, completedFavors: -1 })
          .limit(10);

        const totalNeighbors = await User.countDocuments();
        const totalRequests = await FavorRequest.countDocuments();
        const completedFavorsCount = await FavorRequest.countDocuments({ status: 'Completed' });

        const allSkillsAgg = await User.aggregate([
          { $unwind: '$skills' },
          { $group: { _id: '$skills' } },
          { $count: 'uniqueSkills' },
        ]);
        const uniqueSkillsCount = allSkillsAgg[0]?.uniqueSkills || 0;

        const avgRatingAgg = await Review.aggregate([
          { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]);
        const averageRating = avgRatingAgg[0]?.avgRating
          ? Math.round(avgRatingAgg[0].avgRating * 10) / 10
          : 5.0;

        return res.json({
          leaderboard: topNeighbors,
          metrics: {
            totalNeighbors,
            totalRequests,
            completedFavors: completedFavorsCount,
            uniqueSkillsShared: uniqueSkillsCount,
            averageCommunityRating: averageRating,
          },
        });
      } catch (dbErr) {
        console.warn('MongoDB query failed in getLeaderboard, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const mockData = mockStore.getLeaderboardData();
    return res.json(mockData);
  } catch (err: any) {
    console.error('Get leaderboard error:', err);
    res.status(500).json({ error: 'Failed to compute community leaderboard' });
  }
};
