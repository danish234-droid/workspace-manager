import { Response } from 'express';
import { TaskModel, ActivityModel } from '../models';
import { AuthRequest } from '../middleware/auth';

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export async function getTasks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { projectId, workspaceId } = req.query;
    const filter: Record<string, any> = {};
    if (projectId) filter.projectId = String(projectId);
    if (workspaceId) filter.workspaceId = String(workspaceId);

    const tasks = await TaskModel.find(filter).sort({ order: 1 }).lean();
    res.json({ tasks });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function getTaskById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const task = await TaskModel.findOne({ id }).lean();
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ task });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function createTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const {
      projectId,
      workspaceId,
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      dueDate,
      assigneeId,
      labelIds = [],
    } = req.body;

    if (!projectId || !title) {
      res.status(400).json({ error: 'Project ID and title are required' });
      return;
    }

    const count = await TaskModel.countDocuments({ projectId, status });
    const taskId = generateId('task');

    const task = await TaskModel.create({
      id: taskId,
      projectId,
      workspaceId,
      title: title.trim(),
      description,
      status,
      priority,
      dueDate,
      assigneeId,
      labelIds,
      attachmentIds: [],
      order: count,
      createdBy: userId,
    });

    await ActivityModel.create({
      id: generateId('act'),
      workspaceId: workspaceId || '',
      projectId,
      taskId,
      actorId: userId,
      action: 'task_created',
      metadata: { taskTitle: title.trim() },
    });

    res.status(201).json({ task });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function updateTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const existing = await TaskModel.findOne({ id });

    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const updated = await TaskModel.findOneAndUpdate(
      { id },
      { $set: req.body },
      { new: true }
    ).lean();

    if (req.body.status && req.body.status !== existing.status) {
      await ActivityModel.create({
        id: generateId('act'),
        workspaceId: existing.workspaceId,
        projectId: existing.projectId,
        taskId: id,
        actorId: userId,
        action: 'status_changed',
        metadata: { from: existing.status, to: req.body.status, taskTitle: existing.title },
      });
    }

    res.json({ task: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function deleteTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await TaskModel.deleteOne({ id });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}
