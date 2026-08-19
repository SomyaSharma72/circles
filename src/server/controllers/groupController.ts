import { Response } from 'express';
import mongoose from 'mongoose';
import Group from '../models/Group';
import GroupMessage from '../models/GroupMessage';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../sockets/socketHandler';
import { mockStore } from '../services/mockStore';

const isDBConnected = () => mongoose.connection.readyState === 1;

export const getGroups = async (req: AuthRequest, res: Response) => {
  try {
    const { category, query, lat, lng } = req.query;

    if (isDBConnected()) {
      try {
        let filter: any = {};
        if (category && category !== 'All') {
          filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }
        if (query) {
          const q = (query as string).trim();
          filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { neighborhood: { $regex: q, $options: 'i' } },
          ];
        }

        const groups = await Group.find(filter)
          .populate('creator', 'name trustScore neighborhood')
          .populate('members', 'name trustScore neighborhood')
          .sort({ createdAt: -1 });

        return res.json(groups);
      } catch (dbErr) {
        console.warn('MongoDB query failed in getGroups, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const groups = mockStore.findGroups(category as string, query as string);
    return res.json(groups);
  } catch (err: any) {
    console.error('getGroups error:', err);
    res.status(500).json({ error: 'Failed to fetch community groups' });
  }
};

export const getGroupById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      try {
        const group = await Group.findById(id)
          .populate('creator', 'name trustScore neighborhood')
          .populate('members', 'name trustScore neighborhood skills');

        if (group) {
          return res.json(group);
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed in getGroupById, falling back to mockStore:', dbErr);
      }
    }

    const group = mockStore.findGroupById(id);
    if (!group) return res.status(404).json({ error: 'Community circle group not found' });
    return res.json(group);
  } catch (err: any) {
    console.error('getGroupById error:', err);
    res.status(500).json({ error: 'Failed to load circle details' });
  }
};

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { name, description, category, neighborhood, icon, privacy, coordinates } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Circle name is required' });
    }

    const coords: [number, number] =
      Array.isArray(coordinates) && coordinates.length === 2
        ? [Number(coordinates[0]), Number(coordinates[1])]
        : [77.6408, 12.9784];

    if (isDBConnected()) {
      try {
        const group = await Group.create({
          name: name.trim(),
          description: description?.trim() || '',
          category: category || 'General Help',
          creator: userId,
          members: [userId],
          neighborhood: neighborhood || 'Local Circle',
          icon: icon || 'gardening',
          privacy: privacy === 'Approval Required' ? 'Approval Required' : 'Public',
          location: {
            type: 'Point',
            coordinates: coords,
          },
        });

        const populatedGroup = await Group.findById(group._id)
          .populate('creator', 'name trustScore neighborhood')
          .populate('members', 'name trustScore neighborhood');

        try {
          const io = getIO();
          io.emit('group:created', populatedGroup);
          io.emit('circle:created', populatedGroup);
        } catch (sErr) {
          console.warn('Socket circle emit notice:', sErr);
        }

        return res.status(201).json(populatedGroup);
      } catch (dbErr) {
        console.warn('MongoDB create group failed, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const createdGroup = mockStore.createGroup({
      name,
      description,
      category,
      neighborhood,
      icon,
      privacy,
      coordinates: coords,
      creatorId: userId,
    });

    try {
      const io = getIO();
      io.emit('group:created', createdGroup);
      io.emit('circle:created', createdGroup);
    } catch (sErr) {
      console.warn('Socket circle emit notice:', sErr);
    }

    return res.status(201).json(createdGroup);
  } catch (err: any) {
    console.error('createGroup error:', err);
    res.status(500).json({ error: err.message || 'Failed to create community circle' });
  }
};

export const joinGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;

    if (isDBConnected()) {
      try {
        const group = await Group.findByIdAndUpdate(
          id,
          { $addToSet: { members: userId } },
          { new: true }
        )
          .populate('creator', 'name trustScore neighborhood')
          .populate('members', 'name trustScore neighborhood');

        if (group) {
          try {
            const io = getIO();
            io.to(`group:${id}`).emit('group:member_joined', { groupId: id, user: req.user });
            io.to(`circle:${id}`).emit('circle:member_joined', { circleId: id, user: req.user });
          } catch (sErr) {
            console.warn('Socket emit notice:', sErr);
          }
          return res.json(group);
        }
      } catch (dbErr) {
        console.warn('MongoDB joinGroup failed, falling back to mockStore:', dbErr);
      }
    }

    const updated = mockStore.joinGroup(id, userId);
    if (!updated) return res.status(404).json({ error: 'Circle not found' });

    try {
      const io = getIO();
      io.to(`group:${id}`).emit('group:member_joined', { groupId: id, user: req.user });
      io.to(`circle:${id}`).emit('circle:member_joined', { circleId: id, user: req.user });
    } catch (sErr) {
      console.warn('Socket emit notice:', sErr);
    }

    return res.json(updated);
  } catch (err: any) {
    console.error('joinGroup error:', err);
    res.status(500).json({ error: 'Failed to join circle' });
  }
};

export const leaveGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;

    if (isDBConnected()) {
      try {
        const group = await Group.findByIdAndUpdate(
          id,
          { $pull: { members: userId } },
          { new: true }
        )
          .populate('creator', 'name trustScore neighborhood')
          .populate('members', 'name trustScore neighborhood');

        if (group) {
          try {
            const io = getIO();
            io.to(`group:${id}`).emit('group:member_left', { groupId: id, userId });
            io.to(`circle:${id}`).emit('circle:member_left', { circleId: id, userId });
          } catch (sErr) {
            console.warn('Socket emit notice:', sErr);
          }
          return res.json(group);
        }
      } catch (dbErr) {
        console.warn('MongoDB leaveGroup failed, falling back to mockStore:', dbErr);
      }
    }

    const updated = mockStore.leaveGroup(id, userId);
    if (!updated) return res.status(404).json({ error: 'Circle not found' });

    try {
      const io = getIO();
      io.to(`group:${id}`).emit('group:member_left', { groupId: id, userId });
      io.to(`circle:${id}`).emit('circle:member_left', { circleId: id, userId });
    } catch (sErr) {
      console.warn('Socket emit notice:', sErr);
    }

    return res.json(updated);
  } catch (err: any) {
    console.error('leaveGroup error:', err);
    res.status(500).json({ error: 'Failed to leave circle' });
  }
};

export const deleteGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;

    if (isDBConnected()) {
      try {
        const group = await Group.findById(id);
        if (!group) return res.status(404).json({ error: 'Circle not found' });

        if (group.creator.toString() !== userId) {
          return res.status(403).json({ error: 'Only the creator can delete this circle' });
        }

        await Group.findByIdAndDelete(id);
        await GroupMessage.deleteMany({ group: id });

        try {
          const io = getIO();
          io.emit('group:deleted', { groupId: id });
          io.emit('circle:deleted', { circleId: id });
        } catch (sErr) {
          console.warn('Socket emit notice:', sErr);
        }

        return res.json({ success: true, message: 'Circle deleted successfully' });
      } catch (dbErr) {
        console.warn('MongoDB deleteGroup failed, falling back to mockStore:', dbErr);
      }
    }

    const success = mockStore.deleteGroup(id, userId);
    if (!success) return res.status(404).json({ error: 'Circle not found or not authorized' });

    try {
      const io = getIO();
      io.emit('group:deleted', { groupId: id });
      io.emit('circle:deleted', { circleId: id });
    } catch (sErr) {
      console.warn('Socket emit notice:', sErr);
    }

    return res.json({ success: true, message: 'Circle deleted successfully' });
  } catch (err: any) {
    console.error('deleteGroup error:', err);
    res.status(500).json({ error: 'Failed to delete circle' });
  }
};

export const getGroupMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      try {
        const messages = await GroupMessage.find({ group: id })
          .populate('sender', 'name trustScore neighborhood')
          .sort({ createdAt: 1 });

        return res.json(messages);
      } catch (dbErr) {
        console.warn('MongoDB getGroupMessages failed, falling back to mockStore:', dbErr);
      }
    }

    const messages = mockStore.findGroupMessages(id);
    return res.json(messages);
  } catch (err: any) {
    console.error('getGroupMessages error:', err);
    res.status(500).json({ error: 'Failed to load circle messages' });
  }
};

export const sendGroupMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user?.id;
    if (!senderId) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text cannot be empty' });
    }

    if (isDBConnected()) {
      try {
        const newMsg = await GroupMessage.create({
          group: id,
          sender: senderId,
          text: text.trim(),
        });

        const populatedMsg = await GroupMessage.findById(newMsg._id).populate(
          'sender',
          'name trustScore neighborhood'
        );

        try {
          const io = getIO();
          io.to(`group:${id}`).emit('group:message', populatedMsg);
          io.to(`circle:${id}`).emit('circle:message', populatedMsg);
        } catch (sErr) {
          console.warn('Socket group:message emit notice:', sErr);
        }

        return res.status(201).json(populatedMsg);
      } catch (dbErr) {
        console.warn('MongoDB sendGroupMessage failed, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const createdMsg = mockStore.createGroupMessage(id, senderId, text);

    try {
      const io = getIO();
      io.to(`group:${id}`).emit('group:message', createdMsg);
      io.to(`circle:${id}`).emit('circle:message', createdMsg);
    } catch (sErr) {
      console.warn('Socket group:message emit notice:', sErr);
    }

    return res.status(201).json(createdMsg);
  } catch (err: any) {
    console.error('sendGroupMessage error:', err);
    res.status(500).json({ error: 'Failed to post message to circle' });
  }
};
