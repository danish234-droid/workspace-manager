import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { WorkspaceModel, WorkspaceMemberModel } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateId } from '@/utils/id';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Find all memberships for this user
    const memberships = await WorkspaceMemberModel.find({ userId: user.id }).lean();
    const workspaceIds = memberships.map(m => m.workspaceId);

    // Or workspaces owned by user
    const workspaces = await WorkspaceModel.find({
      $or: [{ ownerId: user.id }, { id: { $in: workspaceIds } }],
    }).lean();

    return NextResponse.json({ workspaces });
  } catch (error: any) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon = '🚀', color = '#6366f1', description = '', defaultView = 'kanban' } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    await connectToDatabase();

    const workspaceId = generateId('ws');
    const newWorkspace = await WorkspaceModel.create({
      id: workspaceId,
      name: name.trim(),
      description,
      icon,
      color,
      ownerId: user.id,
      defaultView,
    });

    // Add creator as owner member
    await WorkspaceMemberModel.create({
      id: generateId('wm'),
      workspaceId,
      userId: user.id,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    });

    return NextResponse.json({ workspace: newWorkspace }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
