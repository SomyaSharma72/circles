import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Skill from '../models/Skill';
import { AuthRequest } from '../middleware/auth';
import { mockStore } from '../services/mockStore';

const isDBConnected = () => mongoose.connection.readyState === 1;

export const getSkills = async (req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      try {
        const skills = await Skill.find().sort({ name: 1 });
        return res.json(skills);
      } catch (dbErr) {
        console.warn('MongoDB query failed in getSkills, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const skills = mockStore.getSkills();
    return res.json(skills);
  } catch (err: any) {
    console.error('Get skills error:', err);
    res.status(500).json({ error: 'Failed to fetch community skills catalog' });
  }
};

export const addSkill = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Skill name is required' });

    if (isDBConnected()) {
      try {
        const existing = await Skill.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (existing) {
          return res.json(existing);
        }

        const skill = await Skill.create({
          name,
          category: category || 'General',
          description: description || '',
          createdBy: req.user?.id as any,
        });

        return res.status(201).json(skill);
      } catch (dbErr) {
        console.warn('MongoDB query failed in addSkill, falling back to mockStore:', dbErr);
      }
    }

    // MockStore Fallback
    const createdSkill = mockStore.createSkill(name, category, description, req.user?.id);
    return res.status(201).json(createdSkill);
  } catch (err: any) {
    console.error('Add skill error:', err);
    res.status(500).json({ error: err.message || 'Failed to register skill' });
  }
};
