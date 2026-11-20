import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
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
} from '@/lib/models';
import { hashPassword } from '@/lib/auth';
import {
  MOCK_USERS,
  MOCK_CREDENTIALS,
  MOCK_WORKSPACES,
  MOCK_WORKSPACE_MEMBERS,
  MOCK_LABELS,
  MOCK_NOTIFICATIONS,
} from '@/lib/mockData';

export async function GET() {
  return seedDatabase();
}

export async function POST() {
  return seedDatabase();
}

async function seedDatabase() {
  try {
    await connectToDatabase();

    const userCount = await UserModel.countDocuments();
    if (userCount > 0) {
      return NextResponse.json({
        message: 'Database already has data. Skipping automatic re-seed.',
        userCount,
      });
    }

    // 1. Seed Users with hashed passwords
    const seededUsers = [];
    for (const u of MOCK_USERS) {
      const rawPassword = MOCK_CREDENTIALS[u.email] || 'password123';
      const hashedPassword = await hashPassword(rawPassword);
      const user = await UserModel.create({
        id: u.id,
        name: u.name,
        email: u.email,
        password: hashedPassword,
        avatarColor: u.avatarColor || '#6366f1',
      });
      seededUsers.push(user);
    }

    // 2. Seed Workspaces
    for (const ws of MOCK_WORKSPACES) {
      await WorkspaceModel.create({
        id: ws.id,
        name: ws.name,
        description: ws.description,
        icon: ws.icon,
        color: ws.color,
        ownerId: ws.ownerId,
        defaultView: ws.defaultView,
      });
    }

    // 3. Seed Workspace Members
    for (const wm of MOCK_WORKSPACE_MEMBERS) {
      await WorkspaceMemberModel.create({
        id: wm.id,
        workspaceId: wm.workspaceId,
        userId: wm.userId,
        role: wm.role,
        joinedAt: wm.joinedAt,
      });
    }

    // 4. Seed Labels
    for (const lbl of MOCK_LABELS) {
      await LabelModel.create({
        id: lbl.id,
        workspaceId: lbl.workspaceId,
        name: lbl.name,
        color: lbl.color,
      });
    }

    // 5. Seed Notifications
    for (const notif of MOCK_NOTIFICATIONS) {
      await NotificationModel.create({
        id: notif.id,
        userId: notif.userId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        taskId: notif.taskId,
        projectId: notif.projectId,
        workspaceId: notif.workspaceId,
        read: notif.read,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'MongoDB database initialized with seed records.',
      seeded: {
        users: seededUsers.length,
        workspaces: MOCK_WORKSPACES.length,
        members: MOCK_WORKSPACE_MEMBERS.length,
        labels: MOCK_LABELS.length,
        notifications: MOCK_NOTIFICATIONS.length,
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error?.message || 'Database seeding error.' },
      { status: 500 }
    );
  }
}
