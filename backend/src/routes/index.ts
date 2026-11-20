import { Router } from 'express';
import authRoutes from './auth.routes';
import workspaceRoutes from './workspace.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import commentRoutes from './comment.routes';
import activityRoutes from './activity.routes';
import notificationRoutes from './notification.routes';
import seedRoutes from './seed.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);
router.use('/activities', activityRoutes);
router.use('/notifications', notificationRoutes);
router.use('/seed', seedRoutes);

export default router;
