import { Response } from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message';
import FavorRequest from '../models/Request';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../sockets/socketHandler';
import { mockStore } from '../services/mockStore';

const isDBConnected = () => mongoose.connection.readyState === 1;

export const getMessagesByRequest = async (req: AuthRequest, res: Response) => {
  try {
    const requestId = req.params.requestId || req.params.id;

    if (isDBConnected()) {
      try {
        const messages = await Message.find({ request: requestId })
          .populate('sender', 'name avatarUrl trustScore neighborhood')
          .populate('receiver', 'name avatarUrl trustScore neighborhood')
          .sort({ createdAt: 1 });

        return res.json(messages);
      } catch (dbErr) {
        console.warn('MongoDB query failed in getMessagesByRequest, falling back to mockStore:', dbErr);
      }
    }

    const messages = mockStore.findMessagesByRequest(requestId);
    return res.json(messages);
  } catch (err: any) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
};

export const getUserConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    if (isDBConnected()) {
      try {
        const messages = await Message.find({
          $or: [{ sender: userId }, { receiver: userId }],
        })
          .populate('sender', 'name avatarUrl trustScore neighborhood')
          .populate('receiver', 'name avatarUrl trustScore neighborhood')
          .populate('request', 'title status category')
          .sort({ createdAt: -1 });

        const conversationsMap = new Map<string, any>();
        for (const msg of messages) {
          const reqId = msg.request?._id?.toString() || msg.request?.toString();
          if (!reqId || conversationsMap.has(reqId)) continue;

          const senderId = msg.sender?._id?.toString() || msg.sender;
          const otherUser = senderId === userId ? msg.receiver : msg.sender;

          conversationsMap.set(reqId, {
            requestId: reqId,
            requestTitle: (msg.request as any)?.title || 'Favor Request',
            requestCategory: (msg.request as any)?.category || 'General',
            requestStatus: (msg.request as any)?.status || 'Open',
            otherUser,
            lastMessage: {
              _id: msg._id,
              text: msg.text,
              sender: msg.sender,
              createdAt: msg.createdAt,
              read: msg.read,
            },
            unreadCount: 0,
          });
        }

        return res.json(Array.from(conversationsMap.values()));
      } catch (dbErr) {
        console.warn('MongoDB conversations query failed, falling back to mockStore:', dbErr);
      }
    }

    const conversations = mockStore.getUserConversations(userId);
    return res.json(conversations);
  } catch (err: any) {
    console.error('Get user conversations error:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const requestId = req.body.requestId || req.params.requestId || req.params.id;
    const text = req.body.text || req.body.message;
    let receiverId = req.body.receiverId;

    if (!requestId || !text) {
      return res.status(400).json({ error: 'Request ID and message text are required' });
    }

    // Auto-resolve receiverId if missing or if receiverId === userId
    if (!receiverId || receiverId === userId) {
      if (isDBConnected()) {
        try {
          const reqDoc = await FavorRequest.findById(requestId);
          if (reqDoc) {
            const reqUserId = reqDoc.requester?.toString();
            if (reqUserId === userId) {
              receiverId = reqDoc.helper?.toString() || 'user_aarav_2';
            } else {
              receiverId = reqUserId;
            }
          }
        } catch (e) {
          console.warn('DB request lookup for receiver error:', e);
        }
      }
      if (!receiverId || receiverId === userId) {
        const mockReq = mockStore.findRequestById(requestId);
        if (mockReq) {
          const rUserId = typeof mockReq.requester === 'object' ? mockReq.requester?._id : mockReq.requester;
          if (rUserId === userId) {
            receiverId = typeof mockReq.helper === 'object' ? mockReq.helper?._id : mockReq.helper;
          } else {
            receiverId = rUserId;
          }
        }
        if (!receiverId || receiverId === userId) {
          if (requestId.startsWith('req_direct_')) {
            receiverId = requestId.replace('req_direct_', '');
          }
        }
        if (!receiverId || receiverId === userId) {
          receiverId = userId === 'user_priya_1' ? 'user_aarav_2' : 'user_priya_1';
        }
      }
    }

    // Check if either user has blocked the other
    if (isDBConnected()) {
      try {
        const User = mongoose.model('User');
        const senderDoc: any = await User.findById(userId);
        const receiverDoc: any = await User.findById(receiverId);

        if (senderDoc?.blockedUsers?.some((b: any) => b?.toString() === receiverId?.toString())) {
          return res.status(403).json({ error: 'You have blocked this neighbor. Unblock them to send messages.' });
        }
        if (receiverDoc?.blockedUsers?.some((b: any) => b?.toString() === userId?.toString())) {
          return res.status(403).json({ error: 'You cannot send messages to this neighbor.' });
        }
      } catch (checkErr) {
        console.warn('Block check error in DB:', checkErr);
      }
    }

    if (mockStore.isUserBlocked(userId, receiverId)) {
      const isBlockedByMe = mockStore.findUserById(userId)?.blockedUsers?.includes(receiverId);
      if (isBlockedByMe) {
        return res.status(403).json({ error: 'You have blocked this neighbor. Unblock them to send messages.' });
      }
      return res.status(403).json({ error: 'You cannot send messages to this neighbor.' });
    }

    if (isDBConnected()) {
      try {
        const message = await Message.create({
          request: requestId,
          sender: userId,
          receiver: receiverId,
          text: text.trim(),
        });

        const populatedMsg = await Message.findById(message._id)
          .populate('sender', 'name avatarUrl trustScore neighborhood')
          .populate('receiver', 'name avatarUrl trustScore neighborhood');

        try {
          const io = getIO();
          io.to(`request:${requestId}`).emit('newMessage', populatedMsg);
          io.to(`request:${requestId}`).emit('chat:message', populatedMsg);
          io.to(`user:${receiverId}`).emit('chat:notification', populatedMsg);
        } catch (sErr) {
          console.warn('Socket chat emit notice:', sErr);
        }

        return res.status(201).json(populatedMsg);
      } catch (dbErr) {
        console.warn('MongoDB query failed in sendMessage, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const userSender =
      mockStore.findUserById(userId) ||
      mockStore.users.find((u) => u._id === userId || (u as any).id === userId || u.email === req.user?.email) || {
        _id: userId,
        name: req.user?.email ? req.user.email.split('@')[0] : 'Neighbor',
        trustScore: 98,
      };

    const receiverUser = mockStore.findUserById(receiverId) || {
      _id: receiverId,
      name: 'Neighbor',
      trustScore: 95,
    };

    const createdMsg = mockStore.createMessage({
      request: requestId,
      sender: userSender,
      receiver: receiverUser,
      text: text.trim(),
    });

    try {
      const io = getIO();
      io.to(`request:${requestId}`).emit('newMessage', createdMsg);
      io.to(`request:${requestId}`).emit('chat:message', createdMsg);
      io.to(`user:${receiverId}`).emit('chat:notification', createdMsg);
    } catch (sErr) {
      console.warn('Socket chat emit notice:', sErr);
    }

    // Interactive Demo Auto-Reply Simulation
    if (receiverId && receiverId !== userId) {
      setTimeout(() => {
        try {
          const autoReplies = [
            `Hey ${userSender.name.split(' ')[0]}! Thanks for reaching out. I got your message regarding this favor and I'll be glad to help out!`,
            `Hi! Sounds great. I am nearby in the neighborhood right now and can coordinate with you in a few minutes.`,
            `Awesome! Let's arrange this right away. Feel free to give me a call or let me know when you're free.`,
            `Hey neighbor! I saw your message. Thanks for connecting on Neighborly!`,
          ];
          const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];

          const replyMsg = mockStore.createMessage({
            request: requestId,
            sender: receiverUser,
            receiver: userSender,
            text: randomReply,
          });

          const io = getIO();
          io.to(`request:${requestId}`).emit('newMessage', replyMsg);
          io.to(`request:${requestId}`).emit('chat:message', replyMsg);
          io.to(`user:${userId}`).emit('chat:notification', replyMsg);
        } catch (autoErr) {
          console.warn('Auto reply simulation notice:', autoErr);
        }
      }, 1400);
    }

    return res.status(201).json(createdMsg);
  } catch (err: any) {
    console.error('Send message error:', err);
    res.status(500).json({ error: err.message || 'Failed to send message' });
  }
};
