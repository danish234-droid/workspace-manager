import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { ProjectModel } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateId } from '@/utils/id';
import { DEFAULT_KANBAN_COLUMNS } from '@/lib/mockData';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    await connectToDatabase();
    const filter = workspaceId ? { workspaceId } : {};
    const projects = await ProjectModel.find(filter).lean();

    return NextResponse.json({ projects });
  } catch (error: any) {
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
    const {
      workspaceId,
      name,
      description = '',
      icon = '📁',
      color = '#3b82f6',
      defaultView = 'kanban',
      template = 'blank',
      columns = DEFAULT_KANBAN_COLUMNS,
    } = body;

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: 'Workspace ID and project name are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const projectId = generateId('proj');
    const project = await ProjectModel.create({
      id: projectId,
      workspaceId,
      name: name.trim(),
      description,
      icon,
      color,
      status: 'active',
      defaultView,
      template,
      memberIds: [user.id],
      columns,
      createdBy: user.id,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
