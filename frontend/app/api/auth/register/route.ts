import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { UserModel, WorkspaceModel, WorkspaceMemberModel, ProjectModel } from '@/lib/models';
import { hashPassword, signToken } from '@/lib/auth';
import { generateId } from '@/utils/id';
import { DEFAULT_KANBAN_COLUMNS } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const userId = generateId('user');
    const avatarColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;

    const newUser = await UserModel.create({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      avatarColor,
    });

    // Create default initial workspace for new user
    const workspaceId = generateId('ws');
    await WorkspaceModel.create({
      id: workspaceId,
      name: `${name.trim()}'s Workspace`,
      description: 'Default personal workspace',
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

    // Create a starter project
    await ProjectModel.create({
      id: generateId('proj'),
      workspaceId,
      name: 'Getting Started',
      description: 'Your first project board',
      icon: '✨',
      color: '#3b82f6',
      status: 'active',
      defaultView: 'kanban',
      columns: DEFAULT_KANBAN_COLUMNS,
      memberIds: [userId],
      createdBy: userId,
    });

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    const userPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatarColor: newUser.avatarColor,
      createdAt: newUser.createdAt ? new Date(newUser.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: newUser.updatedAt ? new Date(newUser.updatedAt).toISOString() : new Date().toISOString(),
    };

    const response = NextResponse.json(
      {
        message: 'Account created successfully',
        user: userPayload,
        token,
      },
      { status: 201 }
    );

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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
