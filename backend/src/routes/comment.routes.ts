import { Router } from 'express';
import { getComments, createComment, deleteComment } from '../controllers/commentController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getComments);
router.post('/', createComment);
router.delete('/:id', deleteComment);

export default router;
