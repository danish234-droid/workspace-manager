import { Router } from 'express';
import { seedDatabase } from '../controllers/seedController';

const router = Router();

router.get('/', seedDatabase);
router.post('/', seedDatabase);

export default router;
