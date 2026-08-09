import { Response } from 'express';
import mongoose from 'mongoose';
import FavorRequest from '../models/Request';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import {
  categorizeRequest,
  rankRecommendationsForUser,
  smartSearchRequests,
  matchSkillsForRequest,
} from '../services/aiService';
import { getIO, getGeoCellKey } from '../sockets/socketHandler';
import { mockStore } from '../services/mockStore';

function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const isDBConnected = () => mongoose.connection.readyState === 1;

export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Not authenticated' });

    const { title, description, locationName, coordinates } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // AI Categorization
    const aiAnalysis = await categorizeRequest(title, description);

    if (isDBConnected()) {
      try {
        const requester = await User.findById(req.user.id);
        if (requester) {
          let lng = requester.location?.coordinates?.[0] || -122.4194;
          let lat = requester.location?.coordinates?.[1] || 37.7749;

          if (Array.isArray(coordinates) && coordinates.length === 2) {
            lng = Number(coordinates[0]);
            lat = Number(coordinates[1]);
          }

          const newRequest = await FavorRequest.create({
            title,
            description,
            category: aiAnalysis.category,
            urgency: aiAnalysis.urgency,
            tags: aiAnalysis.tags,
            summary: aiAnalysis.summary,
            isFlaggedSpam: aiAnalysis.isSpam,
            fraudReason: aiAnalysis.fraudReason,
            status: 'Open',
            requester: requester._id,
            locationName: locationName || requester.neighborhood || 'Local Block',
            location: {
              type: 'Point',
              coordinates: [lng, lat],
            },
          });

          const populatedRequest = await FavorRequest.findById(newRequest._id).populate(
            'requester',
            'name avatarUrl trustScore neighborhood skills'
          );

          try {
            const io = getIO();
            const geoKey = getGeoCellKey(lat, lng);
            io.to(geoKey).emit('request:created', populatedRequest);
            io.emit('request:created:global', populatedRequest);
          } catch (sErr) {
            console.warn('Socket emit notice:', sErr);
          }

          return res.status(201).json(populatedRequest);
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed in createRequest, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const mockRequester = mockStore.findUserById(req.user.id) || mockStore.users[0];
    let lng = mockRequester.location?.coordinates?.[0] || -122.4194;
    let lat = mockRequester.location?.coordinates?.[1] || 37.7749;

    if (Array.isArray(coordinates) && coordinates.length === 2) {
      lng = Number(coordinates[0]);
      lat = Number(coordinates[1]);
    }

    const createdMock = mockStore.createRequest({
      title,
      description,
      category: aiAnalysis.category,
      urgency: aiAnalysis.urgency,
      tags: aiAnalysis.tags,
      summary: aiAnalysis.summary,
      isFlaggedSpam: aiAnalysis.isSpam,
      fraudReason: aiAnalysis.fraudReason,
      locationName: locationName || mockRequester.neighborhood || 'Local Block',
      location: { type: 'Point', coordinates: [lng, lat] },
      requester: {
        _id: mockRequester._id,
        name: mockRequester.name,
        email: mockRequester.email,
        avatarUrl: mockRequester.avatarUrl || '',
        trustScore: mockRequester.trustScore || 100,
        neighborhood: mockRequester.neighborhood || 'Local Neighborhood',
        skills: mockRequester.skills || [],
      },
    });

    try {
      const io = getIO();
      const geoKey = getGeoCellKey(lat, lng);
      io.to(geoKey).emit('request:created', createdMock);
      io.emit('request:created:global', createdMock);
    } catch (sErr) {
      console.warn('Socket emit notice:', sErr);
    }

    return res.status(201).json(createdMock);
  } catch (err: any) {
    console.error('Create request error:', err);
    res.status(500).json({ error: err.message || 'Failed to post favor request' });
  }
};

export const getRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { category, urgency, search } = req.query;

    if (isDBConnected()) {
      try {
        let filter: any = { status: 'Open' };
        if (category && category !== 'All') {
          filter.category = category;
        }
        if (urgency && urgency !== 'All') {
          filter.urgency = urgency;
        }

        let requests = await FavorRequest.find(filter)
          .populate('requester', 'name avatarUrl trustScore neighborhood skills')
          .sort({ createdAt: -1 })
          .limit(50);

        if (search && typeof search === 'string' && search.trim() !== '') {
          requests = await smartSearchRequests(search.trim(), requests);
        }

        return res.json(requests);
      } catch (dbErr) {
        console.warn('MongoDB query failed in getRequests, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    let requests = mockStore.findRequests({
      category: category as string,
      urgency: urgency as string,
      search: search as string,
    });

    if (search && typeof search === 'string' && search.trim() !== '') {
      requests = await smartSearchRequests(search.trim(), requests as any);
    }

    return res.json(requests);
  } catch (err: any) {
    console.error('Get requests error:', err);
    res.status(500).json({ error: 'Failed to fetch favor requests' });
  }
};

export const getNearbyRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, radiusKm } = req.query;

    const userLat = lat ? Number(lat) : 37.7749;
    const userLng = lng ? Number(lng) : -122.4194;
    const maxDistMeters = radiusKm ? Number(radiusKm) * 1000 : 5000;

    if (isDBConnected()) {
      try {
        const nearbyDocs = await FavorRequest.find({
          status: 'Open',
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [userLng, userLat],
              },
              $maxDistance: maxDistMeters,
            },
          },
        })
          .populate('requester', 'name avatarUrl trustScore neighborhood skills')
          .limit(40);

        const results = nearbyDocs.map((doc) => {
          const obj = doc.toObject();
          const docLng = doc.location.coordinates[0];
          const docLat = doc.location.coordinates[1];
          const distanceMiles = calculateDistanceMiles(userLat, userLng, docLat, docLng);
          return {
            ...obj,
            distanceMiles,
            distanceKm: Math.round(distanceMiles * 1.60934 * 10) / 10,
          };
        });

        return res.json(results);
      } catch (dbErr) {
        console.warn('MongoDB query failed in getNearbyRequests, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const results = mockStore.findNearbyRequests(userLat, userLng);
    return res.json(results);
  } catch (err: any) {
    console.error('Nearby requests error:', err);
    res.status(500).json({ error: 'Failed to fetch nearby favor requests' });
  }
};

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Not authenticated' });

    if (isDBConnected()) {
      try {
        const user = await User.findById(req.user.id);
        if (user) {
          const openRequests = await FavorRequest.find({
            status: 'Open',
            requester: { $ne: user._id },
          })
            .populate('requester', 'name avatarUrl trustScore neighborhood skills')
            .limit(20);

          const recommendations = await rankRecommendationsForUser(user, openRequests);
          return res.json(recommendations);
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed in getRecommendations, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const mockUser = mockStore.findUserById(req.user.id) || mockStore.users[0];
    const openRequests = mockStore.findRequests().filter((r) => {
      const rId = typeof r.requester === 'object' ? r.requester._id : r.requester;
      return rId !== mockUser._id;
    });

    const recommendations = await rankRecommendationsForUser(mockUser as any, openRequests as any);
    return res.json(recommendations);
  } catch (err: any) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

export const getRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      try {
        const request = await FavorRequest.findById(id)
          .populate('requester', 'name email avatarUrl trustScore neighborhood profession skills bio')
          .populate('helper', 'name email avatarUrl trustScore neighborhood profession skills bio');

        if (request) {
          return res.json(request);
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed in getRequestById, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const mockReq = mockStore.findRequestById(id);
    if (!mockReq) {
      return res.status(404).json({ error: 'Favor request not found' });
    }

    return res.json(mockReq);
  } catch (err: any) {
    console.error('Get request by ID error:', err);
    res.status(500).json({ error: 'Failed to load request details' });
  }
};

export const acceptRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;

    if (isDBConnected()) {
      try {
        const request = await FavorRequest.findById(id);

        if (request && request.status === 'Open' && request.requester.toString() !== req.user.id) {
          request.status = 'In Progress';
          request.helper = req.user.id as any;
          await request.save();

          const updated = await FavorRequest.findById(id)
            .populate('requester', 'name avatarUrl trustScore')
            .populate('helper', 'name avatarUrl trustScore');

          try {
            const io = getIO();
            io.to(`request:${id}`).emit('request:accepted', updated);
            io.to(`user:${request.requester.toString()}`).emit('request:accepted:notify', updated);
          } catch (sErr) {
            console.warn('Socket notification notice:', sErr);
          }

          return res.json(updated);
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed in acceptRequest, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const mockReq = mockStore.findRequestById(id);
    if (!mockReq) return res.status(404).json({ error: 'Favor request not found' });
    if (mockReq.status !== 'Open') return res.status(400).json({ error: 'This favor request is no longer open' });

    const helperUser = mockStore.findUserById(req.user.id) || mockStore.users[0];
    mockReq.status = 'In Progress';
    mockReq.helper = {
      _id: helperUser._id,
      name: helperUser.name,
      email: helperUser.email,
      avatarUrl: helperUser.avatarUrl || '',
      trustScore: helperUser.trustScore,
      neighborhood: helperUser.neighborhood,
      skills: helperUser.skills,
    };

    try {
      const io = getIO();
      io.to(`request:${id}`).emit('request:accepted', mockReq);
    } catch (sErr) {
      console.warn('Socket notice:', sErr);
    }

    return res.json(mockReq);
  } catch (err: any) {
    console.error('Accept request error:', err);
    res.status(500).json({ error: err.message || 'Failed to accept favor request' });
  }
};

export const completeRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;

    if (isDBConnected()) {
      try {
        const request = await FavorRequest.findById(id);

        if (request) {
          request.status = 'Completed';
          await request.save();

          if (request.helper) {
            await User.findByIdAndUpdate(request.helper, {
              $inc: { completedFavors: 1, trustScore: 5 },
            });
          }

          const updated = await FavorRequest.findById(id)
            .populate('requester', 'name avatarUrl trustScore')
            .populate('helper', 'name avatarUrl trustScore');

          try {
            const io = getIO();
            io.to(`request:${id}`).emit('request:completed', updated);
          } catch (sErr) {
            console.warn('Socket notice:', sErr);
          }

          return res.json(updated);
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed in completeRequest, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const mockReq = mockStore.findRequestById(id);
    if (!mockReq) return res.status(404).json({ error: 'Favor request not found' });

    mockReq.status = 'Completed';
    const helperId = typeof mockReq.helper === 'object' ? mockReq.helper._id : mockReq.helper;
    if (helperId) {
      const helperUser = mockStore.findUserById(helperId);
      if (helperUser) {
        helperUser.completedFavors = (helperUser.completedFavors || 0) + 1;
        helperUser.trustScore = Math.min(100, helperUser.trustScore + 5);
      }
    }

    try {
      const io = getIO();
      io.to(`request:${id}`).emit('request:completed', mockReq);
    } catch (sErr) {
      console.warn('Socket notice:', sErr);
    }

    return res.json(mockReq);
  } catch (err: any) {
    console.error('Complete request error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete favor' });
  }
};

export const matchSkills = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      try {
        const request = await FavorRequest.findById(id);
        if (request) {
          const availableNeighbors = await User.find({ _id: { $ne: request.requester } }).limit(20);
          const matches = await matchSkillsForRequest(request, availableNeighbors);
          return res.json(matches);
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed in matchSkills, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const mockReq = mockStore.findRequestById(id);
    if (!mockReq) return res.status(404).json({ error: 'Favor request not found' });

    const reqId = typeof mockReq.requester === 'object' ? mockReq.requester._id : mockReq.requester;
    const availableNeighbors = mockStore.users.filter((u) => u._id !== reqId);

    const matches = await matchSkillsForRequest(mockReq as any, availableNeighbors as any);
    return res.json(matches);
  } catch (err: any) {
    console.error('Match skills error:', err);
    res.status(500).json({ error: 'Failed to run AI skill matching' });
  }
};
