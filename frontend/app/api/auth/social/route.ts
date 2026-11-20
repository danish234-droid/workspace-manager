import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { UserModel, WorkspaceModel, WorkspaceMemberModel, ProjectModel } from '@/lib/models';
import { signToken, hashPassword } from '@/lib/auth';
import { generateId } from '@/utils/id';
import { DEFAULT_KANBAN_COLUMNS } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, email: inputEmail, name: inputName, avatarUrl } = body;

    const email = inputEmail || (provider === 'github' ? 'sarah@workspace.dev' : 'alex@workspace.dev');
    const name = inputName || (provider === 'github' ? 'Sarah Williams' : 'Alex Johnson');
    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();

    let user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      const hashedPassword = await hashPassword('password123');
      const userId = generateId('user');
      const avatarColor = provider === 'github' ? '#ec4899' : '#6366f1';

      user = await UserModel.create({
        id: userId,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        avatarUrl: avatarUrl || '',
        avatarColor,
      });

      // Create starter workspace
      const workspaceId = generateId('ws');
      await WorkspaceModel.create({
        id: workspaceId,
        name: `${name}'s Workspace`,
        description: 'Personal team workspace',
        icon: '🚀',
        color: '#6366f1',
        ownerId: userId,
        defaultView: 'kanban',
      });

      await WorkspaceMemberModel.create({
        id: generateId('wm'),
        workspaceId,
        userId,
        role: 'owner',
        joinedAt: new Date().toISOString(),
      });

      await ProjectModel.create({
        id: generateId('proj'),
        workspaceId,
        name: 'Getting Started',
        description: 'Sprint backlog and tasks',
        icon: '✨',
        color: '#3b82f6',
        status: 'active',
        defaultView: 'kanban',
        columns: DEFAULT_KANBAN_COLUMNS,
        memberIds: [userId],
        createdBy: userId,
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      avatarColor: user.avatarColor || '#6366f1',
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString(),
    };

    const response = NextResponse.json({
      message: `Signed in successfully via ${provider === 'github' ? 'GitHub' : 'Google'}`,
      user: userPayload,
      token,
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Social login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
