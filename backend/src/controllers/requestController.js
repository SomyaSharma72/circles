import mongoose from 'mongoose';
import Request from '../models/Request.js';
import User from '../models/User.js'; // Ensure User model is registered for populate

// @desc    Get all requests (sorted by newest first)
// @route   GET /api/requests
// @access  Public
export const getAllRequests = async (req, res, next) => {
  try {
    const requests = await Request.find()
      .populate('requestedBy', 'fullName email neighborhood profession trustScore')
      .populate('acceptedBy', 'fullName email neighborhood profession trustScore')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single request by ID
// @route   GET /api/requests/:id
// @access  Public
export const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request ID format',
      });
    }

    const request = await Request.findById(id)
      .populate('requestedBy', 'fullName email neighborhood profession trustScore')
      .populate('acceptedBy', 'fullName email neighborhood profession trustScore');

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new request
// @route   POST /api/requests
// @access  Public
export const createRequest = async (req, res, next) => {
  try {
    const { title, description, category, requiredDate, location, requestedBy } = req.body;

    // Validate required fields
    if (!title || !description || !category || !requestedBy) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide required fields: title, description, category, and requestedBy',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(requestedBy)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid requestedBy User ID format',
      });
    }

    const newRequest = await Request.create({
      title,
      description,
      category,
      requiredDate: requiredDate || '',
      location: location || '',
      requestedBy,
      status: 'Pending',
    });

    const populatedRequest = await Request.findById(newRequest._id)
      .populate('requestedBy', 'fullName email neighborhood profession trustScore');

    res.status(201).json({
      status: 'success',
      data: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a request
// @route   PUT /api/requests/:id
// @access  Public
export const updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request ID format',
      });
    }

    const { title, description, category, requiredDate, location, status, acceptedBy } = req.body;

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found',
      });
    }

    if (title !== undefined) request.title = title;
    if (description !== undefined) request.description = description;
    if (category !== undefined) request.category = category;
    if (requiredDate !== undefined) request.requiredDate = requiredDate;
    if (location !== undefined) request.location = location;
    
    if (status !== undefined) {
      if (!['Pending', 'Accepted', 'Completed'].includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Status must be one of: Pending, Accepted, Completed',
        });
      }
      request.status = status;
    }

    if (acceptedBy !== undefined) {
      if (acceptedBy && !mongoose.Types.ObjectId.isValid(acceptedBy)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid acceptedBy User ID format',
        });
      }
      request.acceptedBy = acceptedBy || null;
    }

    const updatedRequest = await request.save();

    const populated = await Request.findById(updatedRequest._id)
      .populate('requestedBy', 'fullName email neighborhood profession trustScore')
      .populate('acceptedBy', 'fullName email neighborhood profession trustScore');

    res.status(200).json({
      status: 'success',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a request
// @route   DELETE /api/requests/:id
// @access  Public
export const deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request ID format',
      });
    }

    const request = await Request.findByIdAndDelete(id);

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Request deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};
