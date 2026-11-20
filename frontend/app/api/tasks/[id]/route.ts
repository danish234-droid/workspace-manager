import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { TaskModel, ActivityModel } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateId } from '@/utils/id';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const task = await TaskModel.findOne({ id }).lean();
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    return NextResponse.json({ task });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();
    const existing = await TaskModel.findOne({ id });
    if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const updated = await TaskModel.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true }
    ).lean();

    // Log status or field change activity if relevant
    if (body.status && body.status !== existing.status) {
      await ActivityModel.create({
        id: generateId('act'),
        workspaceId: existing.workspaceId,
        projectId: existing.projectId,
        taskId: id,
        actorId: user.id,
        action: 'status_changed',
        metadata: { from: existing.status, to: body.status, taskTitle: existing.title },
      });
    }

    return NextResponse.json({ task: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    await TaskModel.deleteOne({ id });
    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
