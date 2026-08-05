import mongoose from 'mongoose';
import Skill from '../models/Skill.js';
import User from '../models/User.js'; // Ensure User model is registered for populate

// @desc    Get all active skills (sorted by newest first)
// @route   GET /api/skills
// @access  Public
export const getAllSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ isActive: true })
      .populate('user', 'fullName email neighborhood profession trustScore avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single skill by ID
// @route   GET /api/skills/:id
// @access  Public
export const getSkillById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid skill ID format',
      });
    }

    const skill = await Skill.findById(id)
      .populate('user', 'fullName email neighborhood profession trustScore avatar');

    if (!skill) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new skill
// @route   POST /api/skills
// @access  Public
export const createSkill = async (req, res, next) => {
  try {
    const { user, title, category, description, availability } = req.body;

    // Validate required fields
    if (!user || !title || !category || !description || !availability) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields: user, title, category, description, and availability',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid User ID format',
      });
    }

    const newSkill = await Skill.create({
      user,
      title,
      category,
      description,
      availability,
      isActive: true,
    });

    const populatedSkill = await Skill.findById(newSkill._id)
      .populate('user', 'fullName email neighborhood profession trustScore avatar');

    res.status(201).json({
      status: 'success',
      data: populatedSkill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Public
export const updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid skill ID format',
      });
    }

    const { title, category, description, availability, isActive } = req.body;

    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill not found',
      });
    }

    if (title !== undefined) skill.title = title;
    if (category !== undefined) skill.category = category;
    if (description !== undefined) skill.description = description;
    if (availability !== undefined) skill.availability = availability;
    if (isActive !== undefined) skill.isActive = Boolean(isActive);

    const updatedSkill = await skill.save();

    const populated = await Skill.findById(updatedSkill._id)
      .populate('user', 'fullName email neighborhood profession trustScore avatar');

    res.status(200).json({
      status: 'success',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Public
export const deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid skill ID format',
      });
    }

    const skill = await Skill.findByIdAndDelete(id);

    if (!skill) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Skill deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};
