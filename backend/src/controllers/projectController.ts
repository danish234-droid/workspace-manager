import { Response } from 'express';
import { ProjectModel, TaskModel } from '../models';
import { AuthRequest } from '../middleware/auth';

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export async function getProjects(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { workspaceId } = req.query;
    const filter = workspaceId ? { workspaceId: String(workspaceId) } : {};
    const projects = await ProjectModel.find(filter).lean();
    res.json({ projects });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function getProjectById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const project = await ProjectModel.findOne({ id }).lean();
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ project });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function createProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const {
      workspaceId,
      name,
      description = '',
      icon = '📁',
      color = '#3b82f6',
      defaultView = 'kanban',
      template = 'blank',
      columns,
    } = req.body;

    if (!workspaceId || !name) {
      res.status(400).json({ error: 'Workspace ID and project name are required' });
      return;
    }

    const defaultCols = [
      { id: 'col-backlog', title: 'Backlog', status: 'backlog', order: 0, color: '#94a3b8' },
      { id: 'col-todo', title: 'To Do', status: 'todo', order: 1, color: '#60a5fa' },
      { id: 'col-in-progress', title: 'In Progress', status: 'in-progress', order: 2, color: '#a78bfa' },
      { id: 'col-review', title: 'Review', status: 'review', order: 3, color: '#fb923c' },
      { id: 'col-done', title: 'Done', status: 'done', order: 4, color: '#34d399' },
    ];

    const project = await ProjectModel.create({
      id: generateId('proj'),
      workspaceId,
      name: name.trim(),
      description,
      icon,
      color,
      status: 'active',
      defaultView,
      template,
      memberIds: [userId],
      columns: columns || defaultCols,
      createdBy: userId,
    });

    res.status(201).json({ project });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function updateProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updated = await ProjectModel.findOneAndUpdate(
      { id },
      { $set: req.body },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({ project: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function deleteProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await ProjectModel.deleteOne({ id });
    await TaskModel.deleteMany({ projectId: id });
    res.json({ success: true, message: 'Project deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}
