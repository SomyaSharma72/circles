import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { mockStore } from '../services/mockStore';

const generateToken = (id: string, email: string) => {
  const secret = process.env.JWT_SECRET || 'neighborly_jwt_secret_super_secure_key_2026_987654321';
  return jwt.sign({ id, email }, secret, { expiresIn: '7d' });
};

const isDBConnected = () => mongoose.connection.readyState === 1;

export const formatUserResponse = (user: any) => {
  const uid = user._id ? user._id.toString() : user.id;
  const blocked = Array.isArray(user.blockedUsers)
    ? user.blockedUsers.map((b: any) => (b && typeof b === 'object' && b._id ? b._id.toString() : b?.toString() || b))
    : [];

  return {
    _id: uid,
    id: uid,
    name: user.name,
    email: user.email,
    bio: user.bio || '',
    neighborhood: user.neighborhood || 'Local Neighborhood',
    profession: user.profession || 'Neighbor',
    age: user.age,
    gender: user.gender || '',
    profileCompleted: user.profileCompleted ?? (user.bio || user.skills?.length ? true : false),
    blockedUsers: blocked,
    skills: user.skills || [],
    trustScore: user.trustScore ?? 100,
    completedFavors: user.completedFavors ?? 0,
    avatarUrl: user.avatarUrl || '',
    location: user.location || { type: 'Point', coordinates: [-122.4194, 37.7749] },
  };
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, neighborhood, profession, skills, coordinates, age, gender, avatarUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (isDBConnected()) {
      try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return res.status(400).json({ error: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userLocation = {
          type: 'Point' as const,
          coordinates: Array.isArray(coordinates) && coordinates.length === 2
            ? [Number(coordinates[0]), Number(coordinates[1])]
            : [-122.4194, 37.7749],
        };

        const user = await User.create({
          name,
          email: email.toLowerCase(),
          passwordHash,
          neighborhood: neighborhood || 'Downtown Neighborhood',
          profession: profession || 'Neighbor',
          age: age ? Number(age) : undefined,
          gender: gender || '',
          profileCompleted: false,
          blockedUsers: [],
          skills: Array.isArray(skills) ? skills : [],
          avatarUrl: avatarUrl || '',
          location: userLocation,
        });

        const token = generateToken(user._id.toString(), user.email);

        return res.status(201).json({
          token,
          user: formatUserResponse(user),
        });
      } catch (dbErr) {
        console.warn('MongoDB query failed in signup, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const existingMock = mockStore.findUserByEmail(email.toLowerCase());
    if (existingMock) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const mockUser = mockStore.createUser({
      name,
      email: email.toLowerCase(),
      passwordHash,
      neighborhood: neighborhood || 'Downtown Neighborhood',
      profession: profession || 'Neighbor',
      age: age ? Number(age) : undefined,
      gender: gender || '',
      profileCompleted: false,
      blockedUsers: [],
      skills: Array.isArray(skills) ? skills : [],
      avatarUrl: avatarUrl || '',
      location: {
        type: 'Point',
        coordinates: Array.isArray(coordinates) && coordinates.length === 2
          ? [Number(coordinates[0]), Number(coordinates[1])]
          : [-122.4194, 37.7749],
      },
    });

    const token = generateToken(mockUser._id, mockUser.email);

    return res.status(201).json({
      token,
      user: formatUserResponse(mockUser),
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message || 'Failed to create account' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (isDBConnected()) {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
          const isMatch = await bcrypt.compare(password, user.passwordHash);
          if (isMatch) {
            const token = generateToken(user._id.toString(), user.email);
            return res.json({
              token,
              user: formatUserResponse(user),
            });
          }
          return res.status(401).json({ error: 'Invalid email or password' });
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed in login, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const mockUser = mockStore.findUserByEmail(email.toLowerCase());
    if (!mockUser) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, mockUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(mockUser._id, mockUser.email);

    return res.json({
      token,
      user: formatUserResponse(mockUser),
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Authentication failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (isDBConnected()) {
      try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (user) {
          return res.json({
            user: formatUserResponse(user),
          });
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed in getMe, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const mockUser = mockStore.findUserById(req.user.id) || mockStore.findUserByEmail(req.user.email);
    if (!mockUser) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({
      user: formatUserResponse(mockUser),
    });
  } catch (err: any) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, bio, neighborhood, profession, skills, coordinates, avatarUrl, age, gender, profileCompleted } = req.body;

    if (isDBConnected()) {
      try {
        const user = await User.findById(req.user.id);
        if (user) {
          if (name) user.name = name;
          if (bio !== undefined) user.bio = bio;
          if (neighborhood) user.neighborhood = neighborhood;
          if (profession) user.profession = profession;
          if (age !== undefined) user.age = Number(age) || undefined;
          if (gender !== undefined) user.gender = gender;
          if (profileCompleted !== undefined) user.profileCompleted = Boolean(profileCompleted);
          if (Array.isArray(skills)) user.skills = skills;
          if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

          if (Array.isArray(coordinates) && coordinates.length === 2) {
            user.location = {
              type: 'Point',
              coordinates: [Number(coordinates[0]), Number(coordinates[1])],
            };
          }

          await user.save();

          return res.json({
            user: formatUserResponse(user),
          });
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed in updateProfile, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const mockUser = mockStore.findUserById(req.user.id);
    if (!mockUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) mockUser.name = name;
    if (bio !== undefined) mockUser.bio = bio;
    if (neighborhood) mockUser.neighborhood = neighborhood;
    if (profession) mockUser.profession = profession;
    if (age !== undefined) mockUser.age = Number(age) || undefined;
    if (gender !== undefined) mockUser.gender = gender;
    if (profileCompleted !== undefined) mockUser.profileCompleted = Boolean(profileCompleted);
    if (Array.isArray(skills)) mockUser.skills = skills;
    if (avatarUrl !== undefined) mockUser.avatarUrl = avatarUrl;
    if (Array.isArray(coordinates) && coordinates.length === 2) {
      mockUser.location = {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      };
    }

    return res.json({
      user: formatUserResponse(mockUser),
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
};

export const blockUser = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const targetUserId = req.params.userId || req.body.userId;

    if (!currentUserId) return res.status(401).json({ error: 'Not authenticated' });
    if (!targetUserId) return res.status(400).json({ error: 'Target user ID is required' });
    if (currentUserId === targetUserId) return res.status(400).json({ error: 'Cannot block yourself' });

    if (isDBConnected()) {
      try {
        await User.findByIdAndUpdate(currentUserId, {
          $addToSet: { blockedUsers: targetUserId },
        });
        return res.json({ success: true, message: 'User blocked successfully', blockedUserId: targetUserId });
      } catch (dbErr) {
        console.warn('MongoDB block user error:', dbErr);
      }
    }

    mockStore.blockUser(currentUserId, targetUserId);
    return res.json({ success: true, message: 'User blocked successfully', blockedUserId: targetUserId });
  } catch (err: any) {
    console.error('Block user error:', err);
    res.status(500).json({ error: 'Failed to block user' });
  }
};

export const unblockUser = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const targetUserId = req.params.userId || req.body.userId;

    if (!currentUserId) return res.status(401).json({ error: 'Not authenticated' });
    if (!targetUserId) return res.status(400).json({ error: 'Target user ID is required' });

    if (isDBConnected()) {
      try {
        await User.findByIdAndUpdate(currentUserId, {
          $pull: { blockedUsers: targetUserId },
        });
        return res.json({ success: true, message: 'User unblocked successfully', unblockedUserId: targetUserId });
      } catch (dbErr) {
        console.warn('MongoDB unblock user error:', dbErr);
      }
    }

    mockStore.unblockUser(currentUserId, targetUserId);
    return res.json({ success: true, message: 'User unblocked successfully', unblockedUserId: targetUserId });
  } catch (err: any) {
    console.error('Unblock user error:', err);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
};

export const getBlockedUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) return res.status(401).json({ error: 'Not authenticated' });

    if (isDBConnected()) {
      try {
        const user = await User.findById(currentUserId).populate('blockedUsers', 'name avatarUrl neighborhood profession trustScore');
        if (user) {
          return res.json(user.blockedUsers || []);
        }
      } catch (dbErr) {
        console.warn('MongoDB getBlockedUsers error:', dbErr);
      }
    }

    const blocked = mockStore.getBlockedUsers(currentUserId);
    return res.json(blocked.map(formatUserResponse));
  } catch (err: any) {
    console.error('Get blocked users error:', err);
    res.status(500).json({ error: 'Failed to fetch blocked users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    if (isDBConnected()) {
      try {
        const user = await User.findById(userId).select('-passwordHash');
        if (user) {
          return res.json(formatUserResponse(user));
        }
      } catch (dbErr) {
        console.warn('MongoDB getUserById error:', dbErr);
      }
    }

    const mockUser = mockStore.findUserById(userId);
    if (mockUser) {
      return res.json(formatUserResponse(mockUser));
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (err: any) {
    console.error('getUserById error:', err);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

export const searchNeighbors = async (req: Request, res: Response) => {
  try {
    const query = ((req.query.query || req.query.search || '') as string).trim();

    if (isDBConnected()) {
      try {
        let filter: any = {};
        if (query) {
          filter = {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { skills: { $elemMatch: { $regex: query, $options: 'i' } } },
              { profession: { $regex: query, $options: 'i' } },
              { bio: { $regex: query, $options: 'i' } },
              { neighborhood: { $regex: query, $options: 'i' } },
            ],
          };
        }
        const users = await User.find(filter).select('-passwordHash').limit(20);
        if (users && users.length > 0) {
          return res.json(users.map(formatUserResponse));
        }
      } catch (dbErr) {
        console.warn('MongoDB searchNeighbors error:', dbErr);
      }
    }

    const mockResults = mockStore.searchNeighbors(query);
    return res.json(mockResults.map(formatUserResponse));
  } catch (err: any) {
    console.error('searchNeighbors error:', err);
    res.status(500).json({ error: 'Failed to search neighbors' });
  }
};
