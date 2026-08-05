import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Request from '../models/Request.js';

/**
 * Helper to match user IDs accounting for standard ObjectIds and mock user aliases ('u1', 'u2', etc.)
 */
const isUserMatch = (idA, idB) => {
  if (!idA || !idB) return false;
  const strA = String(idA._id || idA);
  const strB = String(idB._id || idB);
  if (strA === strB) return true;

  const mockMap = {
    'u1': '65c1234567890abcdef12345',
    'u2': '65c1234567890abcdef12346',
    'u3': '65c1234567890abcdef12347',
  };

  const mappedA = mockMap[strA] || strA;
  const mappedB = mockMap[strB] || strB;

  return mappedA === mappedB;
};

// @desc    Get all messages for a specific request (ordered by oldest first)
// @route   GET /api/messages/:requestId
// @access  Public / Authorized participants
export const getMessagesByRequestId = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request ID format',
      });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found',
      });
    }

    // Security check: if userId is provided, ensure user is either requestedBy or acceptedBy
    if (userId) {
      const isRequester = isUserMatch(userId, request.requestedBy);
      const isHelper = isUserMatch(userId, request.acceptedBy);

      if (!isRequester && !isHelper) {
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden: You are not a participant in this favor',
        });
      }
    }

    const messages = await Message.find({ request: requestId })
      .populate('sender', 'fullName name avatar')
      .populate('receiver', 'fullName name avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({
      status: 'success',
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new message for a request
// @route   POST /api/messages
// @access  Public / Authorized participants
export const createMessage = async (req, res, next) => {
  try {
    const { requestId, senderId, receiverId, message } = req.body;

    if (!requestId || !senderId || !receiverId || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required message fields',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request ID format',
      });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found',
      });
    }

    // Verify sender & receiver are participants of this request
    const isSenderParticipant = isUserMatch(senderId, request.requestedBy) || isUserMatch(senderId, request.acceptedBy);
    const isReceiverParticipant = isUserMatch(receiverId, request.requestedBy) || isUserMatch(receiverId, request.acceptedBy);

    if (!isSenderParticipant || !isReceiverParticipant) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You are not authorized to send messages for this favor',
      });
    }

    const validSender = mongoose.Types.ObjectId.isValid(senderId) ? senderId : request.requestedBy;
    const validReceiver = mongoose.Types.ObjectId.isValid(receiverId) ? receiverId : request.acceptedBy;

    const newMessage = await Message.create({
      request: requestId,
      sender: validSender,
      receiver: validReceiver,
      message: message.trim(),
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'fullName name avatar')
      .populate('receiver', 'fullName name avatar');

    res.status(201).json({
      status: 'success',
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};
