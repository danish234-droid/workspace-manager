import { Response } from 'express';
import { CommentModel } from '../models';
import { AuthRequest } from '../middleware/auth';

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export async function getComments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { taskId } = req.query;
    const filter = taskId ? { taskId: String(taskId) } : {};
    const comments = await CommentModel.find(filter).sort({ createdAt: 1 }).lean();
    res.json({ comments });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function createComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { taskId, content, attachments = [] } = req.body;

    if (!taskId || !content?.trim()) {
      res.status(400).json({ error: 'Task ID and content are required' });
      return;
    }

    const comment = await CommentModel.create({
      id: generateId('comment'),
      taskId,
      userId,
      content: content.trim(),
      attachments,
    });

    res.status(201).json({ comment });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function deleteComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await CommentModel.deleteOne({ id });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}
