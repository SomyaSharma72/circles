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

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, neighborhood, profession, skills, coordinates } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (isDBConnected()) {
      try {
        const existingUser = await User.findOne({ email });
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
          email,
          passwordHash,
          neighborhood: neighborhood || 'Downtown Neighborhood',
          profession: profession || 'Neighbor',
          skills: Array.isArray(skills) ? skills : [],
          location: userLocation,
        });

        const token = generateToken(user._id.toString(), user.email);

        return res.status(201).json({
          token,
          user: {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            neighborhood: user.neighborhood,
            profession: user.profession,
            skills: user.skills,
            trustScore: user.trustScore,
            completedFavors: user.completedFavors,
            avatarUrl: user.avatarUrl,
            location: user.location,
          },
        });
      } catch (dbErr) {
        console.warn('MongoDB query failed in signup, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const existingMock = mockStore.findUserByEmail(email);
    if (existingMock) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const mockUser = mockStore.createUser({
      name,
      email,
      passwordHash,
      neighborhood: neighborhood || 'Downtown Neighborhood',
      profession: profession || 'Neighbor',
      skills: Array.isArray(skills) ? skills : [],
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
      user: {
        _id: mockUser._id,
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        bio: mockUser.bio,
        neighborhood: mockUser.neighborhood,
        profession: mockUser.profession,
        skills: mockUser.skills,
        trustScore: mockUser.trustScore,
        completedFavors: mockUser.completedFavors,
        avatarUrl: mockUser.avatarUrl,
        location: mockUser.location,
      },
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
        const user = await User.findOne({ email });
        if (user) {
          const isMatch = await bcrypt.compare(password, user.passwordHash);
          if (isMatch) {
            const token = generateToken(user._id.toString(), user.email);
            return res.json({
              token,
              user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                neighborhood: user.neighborhood,
                profession: user.profession,
                skills: user.skills,
                trustScore: user.trustScore,
                completedFavors: user.completedFavors,
                avatarUrl: user.avatarUrl,
                location: user.location,
              },
            });
          }
          return res.status(401).json({ error: 'Invalid email or password' });
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed in login, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const mockUser = mockStore.findUserByEmail(email);
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
      user: {
        _id: mockUser._id,
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        bio: mockUser.bio,
        neighborhood: mockUser.neighborhood,
        profession: mockUser.profession,
        skills: mockUser.skills,
        trustScore: mockUser.trustScore,
        completedFavors: mockUser.completedFavors,
        avatarUrl: mockUser.avatarUrl,
        location: mockUser.location,
      },
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
            user: {
              _id: user._id,
              id: user._id,
              name: user.name,
              email: user.email,
              bio: user.bio,
              neighborhood: user.neighborhood,
              profession: user.profession,
              skills: user.skills,
              trustScore: user.trustScore,
              completedFavors: user.completedFavors,
              avatarUrl: user.avatarUrl,
              location: user.location,
            },
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
      user: {
        _id: mockUser._id,
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        bio: mockUser.bio,
        neighborhood: mockUser.neighborhood,
        profession: mockUser.profession,
        skills: mockUser.skills,
        trustScore: mockUser.trustScore,
        completedFavors: mockUser.completedFavors,
        avatarUrl: mockUser.avatarUrl,
        location: mockUser.location,
      },
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

    const { name, bio, neighborhood, profession, skills, coordinates, avatarUrl } = req.body;

    if (isDBConnected()) {
      try {
        const user = await User.findById(req.user.id);
        if (user) {
          if (name) user.name = name;
          if (bio !== undefined) user.bio = bio;
          if (neighborhood) user.neighborhood = neighborhood;
          if (profession) user.profession = profession;
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
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              bio: user.bio,
              neighborhood: user.neighborhood,
              profession: user.profession,
              skills: user.skills,
              trustScore: user.trustScore,
              completedFavors: user.completedFavors,
              avatarUrl: user.avatarUrl,
              location: user.location,
            },
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
    if (Array.isArray(skills)) mockUser.skills = skills;
    if (avatarUrl !== undefined) mockUser.avatarUrl = avatarUrl;
    if (Array.isArray(coordinates) && coordinates.length === 2) {
      mockUser.location = {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      };
    }

    return res.json({
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        bio: mockUser.bio,
        neighborhood: mockUser.neighborhood,
        profession: mockUser.profession,
        skills: mockUser.skills,
        trustScore: mockUser.trustScore,
        completedFavors: mockUser.completedFavors,
        avatarUrl: mockUser.avatarUrl,
        location: mockUser.location,
      },
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: err.message || 'Failed to update profile' });
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
          return res.json({
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            neighborhood: user.neighborhood,
            profession: user.profession,
            skills: user.skills,
            trustScore: user.trustScore,
            completedFavors: user.completedFavors,
            avatarUrl: user.avatarUrl,
            location: user.location,
          });
        }
      } catch (dbErr) {
        console.warn('MongoDB getUserById error:', dbErr);
      }
    }

    const mockUser = mockStore.findUserById(userId);
    if (mockUser) {
      return res.json({
        _id: mockUser._id,
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        bio: mockUser.bio,
        neighborhood: mockUser.neighborhood,
        profession: mockUser.profession,
        skills: mockUser.skills,
        trustScore: mockUser.trustScore,
        completedFavors: mockUser.completedFavors,
        avatarUrl: mockUser.avatarUrl,
        location: mockUser.location,
      });
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
          return res.json(
            users.map((u) => ({
              _id: u._id,
              id: u._id,
              name: u.name,
              email: u.email,
              bio: u.bio,
              neighborhood: u.neighborhood,
              profession: u.profession,
              skills: u.skills,
              trustScore: u.trustScore,
              completedFavors: u.completedFavors,
              avatarUrl: u.avatarUrl,
              location: u.location,
            }))
          );
        }
      } catch (dbErr) {
        console.warn('MongoDB searchNeighbors error:', dbErr);
      }
    }

    const mockResults = mockStore.searchNeighbors(query);
    return res.json(mockResults);
  } catch (err: any) {
    console.error('searchNeighbors error:', err);
    res.status(500).json({ error: 'Failed to search neighbors' });
  }
};


