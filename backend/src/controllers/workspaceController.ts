import { Response } from 'express';
import { WorkspaceModel, WorkspaceMemberModel, ProjectModel, TaskModel } from '../models';
import { AuthRequest } from '../middleware/auth';

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export async function getWorkspaces(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const memberships = await WorkspaceMemberModel.find({ userId }).lean();
    const workspaceIds = memberships.map(m => m.workspaceId);

    const workspaces = await WorkspaceModel.find({
      $or: [{ ownerId: userId }, { id: { $in: workspaceIds } }],
    }).lean();

    res.json({ workspaces });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function getWorkspaceById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const workspace = await WorkspaceModel.findOne({ id }).lean();
    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }

    const members = await WorkspaceMemberModel.find({ workspaceId: id }).lean();
    res.json({ workspace, members });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function createWorkspace(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { name, icon = '🚀', color = '#6366f1', description = '', defaultView = 'kanban' } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Workspace name is required' });
      return;
    }

    const workspaceId = generateId('ws');
    const workspace = await WorkspaceModel.create({
      id: workspaceId,
      name: name.trim(),
      description,
      icon,
      color,
      ownerId: userId,
      defaultView,
    });

    await WorkspaceMemberModel.create({
      id: generateId('wm'),
      workspaceId,
      userId,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    });

    res.status(201).json({ workspace });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function updateWorkspace(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updated = await WorkspaceModel.findOneAndUpdate(
      { id },
      { $set: req.body },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }

    res.json({ workspace: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function deleteWorkspace(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await WorkspaceModel.deleteOne({ id });
    await WorkspaceMemberModel.deleteMany({ workspaceId: id });
    await ProjectModel.deleteMany({ workspaceId: id });
    await TaskModel.deleteMany({ workspaceId: id });

    res.json({ success: true, message: 'Workspace deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function inviteMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { userId, role = 'member' } = req.body;

    const existing = await WorkspaceMemberModel.findOne({ workspaceId: id, userId });
    if (existing) {
      res.status(400).json({ error: 'User is already a member of this workspace' });
      return;
    }

    const member = await WorkspaceMemberModel.create({
      id: generateId('wm'),
      workspaceId: id,
      userId,
      role,
      joinedAt: new Date().toISOString(),
    });

    res.status(201).json({ member });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}
