import { Router } from 'express';
import { getActivities } from '../controllers/activityController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getActivities);

export default router;
