import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { TaskModel, ActivityModel } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateId } from '@/utils/id';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const workspaceId = searchParams.get('workspaceId');

    await connectToDatabase();
    const query: Record<string, any> = {};
    if (projectId) query.projectId = projectId;
    if (workspaceId) query.workspaceId = workspaceId;

    const tasks = await TaskModel.find(query).sort({ order: 1 }).lean();
    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
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
    } = body;

    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Project ID and title are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

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
      createdBy: user.id,
    });

    // Record activity
    await ActivityModel.create({
      id: generateId('act'),
      workspaceId: workspaceId || '',
      projectId,
      taskId,
      actorId: user.id,
      action: 'task_created',
      metadata: { taskTitle: title.trim() },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
