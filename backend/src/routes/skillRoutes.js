import express from 'express';
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skillController.js';

const router = express.Router();

router.route('/')
  .get(getAllSkills)
  .post(createSkill);

router.route('/:id')
  .get(getSkillById)
  .put(updateSkill)
  .delete(deleteSkill);

export default router;
