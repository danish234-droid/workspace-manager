import { Response } from 'express';
import { ActivityModel, NotificationModel } from '../models';
import { AuthRequest } from '../middleware/auth';

export async function getActivities(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { workspaceId, projectId } = req.query;
    const filter: Record<string, any> = {};
    if (workspaceId) filter.workspaceId = String(workspaceId);
    if (projectId) filter.projectId = String(projectId);

    const activities = await ActivityModel.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ activities });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json({ notifications });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function markNotificationAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updated = await NotificationModel.findOneAndUpdate(
      { id, userId: req.user!.userId },
      { $set: { read: true } },
      { new: true }
    ).lean();

    res.json({ notification: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function markAllNotificationsAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    await NotificationModel.updateMany(
      { userId: req.user!.userId },
      { $set: { read: true } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}
