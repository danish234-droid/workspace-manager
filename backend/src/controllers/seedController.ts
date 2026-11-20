import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  UserModel,
  WorkspaceModel,
  WorkspaceMemberModel,
  ProjectModel,
  TaskModel,
  CommentModel,
  ActivityModel,
  NotificationModel,
  LabelModel,
} from '../models';

export async function seedDatabase(_req: Request, res: Response): Promise<void> {
  try {
    const existingUsers = await UserModel.countDocuments();
    if (existingUsers > 0) {
      res.json({
        message: 'Database already populated. Skipping duplicate seed.',
        userCount: existingUsers,
      });
      return;
    }

    const defaultPassword = await bcrypt.hash('password123', 10);

    const demoUsers = [
      { id: 'user-1', name: 'Alex Johnson', email: 'alex@workspace.dev', avatarColor: '#6366f1' },
      { id: 'user-2', name: 'Sarah Williams', email: 'sarah@workspace.dev', avatarColor: '#ec4899' },
      { id: 'user-3', name: 'Michael Brown', email: 'michael@workspace.dev', avatarColor: '#f59e0b' },
      { id: 'user-4', name: 'Emma Davis', email: 'emma@workspace.dev', avatarColor: '#10b981' },
      { id: 'user-5', name: 'Daniel Wilson', email: 'daniel@workspace.dev', avatarColor: '#3b82f6' },
    ];

    for (const u of demoUsers) {
      await UserModel.create({
        ...u,
        password: defaultPassword,
      });
    }

    // Workspaces
    const ws1 = await WorkspaceModel.create({
      id: 'ws-1',
      name: 'Acme Corp',
      description: 'Main product development workspace',
      icon: '🚀',
      color: '#6366f1',
      ownerId: 'user-1',
      defaultView: 'kanban',
    });

    const ws2 = await WorkspaceModel.create({
      id: 'ws-2',
      name: 'Personal Projects',
      description: 'My side projects and experiments',
      icon: '💡',
      color: '#10b981',
      ownerId: 'user-1',
      defaultView: 'list',
    });

    // Members
    await WorkspaceMemberModel.create([
      { id: 'wm-1', workspaceId: 'ws-1', userId: 'user-1', role: 'owner' },
      { id: 'wm-2', workspaceId: 'ws-1', userId: 'user-2', role: 'admin' },
      { id: 'wm-3', workspaceId: 'ws-1', userId: 'user-3', role: 'member' },
      { id: 'wm-4', workspaceId: 'ws-1', userId: 'user-4', role: 'member' },
      { id: 'wm-5', workspaceId: 'ws-1', userId: 'user-5', role: 'viewer' },
      { id: 'wm-6', workspaceId: 'ws-2', userId: 'user-1', role: 'owner' },
      { id: 'wm-7', workspaceId: 'ws-2', userId: 'user-2', role: 'member' },
    ]);

    // Labels
    await LabelModel.create([
      { id: 'label-1', workspaceId: 'ws-1', name: 'Bug', color: '#ef4444' },
      { id: 'label-2', workspaceId: 'ws-1', name: 'Feature', color: '#6366f1' },
      { id: 'label-3', workspaceId: 'ws-1', name: 'Improvement', color: '#f59e0b' },
      { id: 'label-4', workspaceId: 'ws-1', name: 'Design', color: '#ec4899' },
    ]);

    // Projects
    const defaultCols = [
      { id: 'col-backlog', title: 'Backlog', status: 'backlog', order: 0, color: '#94a3b8' },
      { id: 'col-todo', title: 'To Do', status: 'todo', order: 1, color: '#60a5fa' },
      { id: 'col-in-progress', title: 'In Progress', status: 'in-progress', order: 2, color: '#a78bfa' },
      { id: 'col-review', title: 'Review', status: 'review', order: 3, color: '#fb923c' },
      { id: 'col-done', title: 'Done', status: 'done', order: 4, color: '#34d399' },
    ];

    await ProjectModel.create([
      {
        id: 'proj-1',
        workspaceId: 'ws-1',
        name: 'Web Application v2',
        description: 'Next-gen platform redesign with improved performance',
        icon: '🌐',
        color: '#6366f1',
        status: 'active',
        defaultView: 'kanban',
        template: 'software-development',
        memberIds: ['user-1', 'user-2', 'user-3', 'user-4'],
        columns: defaultCols,
        createdBy: 'user-1',
      },
      {
        id: 'proj-2',
        workspaceId: 'ws-1',
        name: 'Mobile App (iOS/Android)',
        description: 'Cross-platform mobile experience',
        icon: '📱',
        color: '#10b981',
        status: 'active',
        defaultView: 'kanban',
        template: 'software-development',
        memberIds: ['user-1', 'user-2', 'user-5'],
        columns: defaultCols,
        createdBy: 'user-2',
      },
    ]);

    // Tasks
    await TaskModel.create([
      {
        id: 'task-1',
        projectId: 'proj-1',
        workspaceId: 'ws-1',
        title: 'Design high-converting landing page',
        description: 'Create wireframes and final mockups for the marketing website',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        assigneeId: 'user-2',
        labelIds: ['label-4'],
        order: 0,
        createdBy: 'user-1',
      },
      {
        id: 'task-2',
        projectId: 'proj-1',
        workspaceId: 'ws-1',
        title: 'Implement JWT authentication & RBAC',
        description: 'Secure all API endpoints with token verification and permissions',
        status: 'done',
        priority: 'urgent',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        assigneeId: 'user-1',
        labelIds: ['label-2'],
        order: 1,
        createdBy: 'user-1',
      },
      {
        id: 'task-3',
        projectId: 'proj-1',
        workspaceId: 'ws-1',
        title: 'Optimize Kanban drag and drop reordering',
        description: 'Improve animations and database write debounce',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        assigneeId: 'user-3',
        labelIds: ['label-3'],
        order: 2,
        createdBy: 'user-2',
      },
    ]);

    // Notifications
    await NotificationModel.create([
      {
        id: 'notif-1',
        userId: 'user-1',
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'Sarah Williams assigned you to "Design high-converting landing page"',
        taskId: 'task-1',
        projectId: 'proj-1',
        workspaceId: 'ws-1',
        read: false,
      },
      {
        id: 'notif-2',
        userId: 'user-1',
        type: 'task_completed',
        title: 'Task Completed',
        message: 'Alex Johnson marked "Implement JWT authentication & RBAC" as Done',
        taskId: 'task-2',
        projectId: 'proj-1',
        workspaceId: 'ws-1',
        read: true,
      },
    ]);

    res.json({
      success: true,
      message: 'MongoDB successfully seeded with demo workspaces, users, and tasks!',
      seeded: {
        users: demoUsers.length,
        workspaces: 2,
        projects: 2,
        tasks: 3,
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({ error: error?.message || 'Server error during seed' });
  }
}
