import { Router } from 'express';
import { getSkills, addSkill } from '../controllers/skillController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', getSkills);
router.post('/', protect, addSkill);

export default router;
