import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { CommentModel, ActivityModel } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateId } from '@/utils/id';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    await connectToDatabase();
    const filter = taskId ? { taskId } : {};
    const comments = await CommentModel.find(filter).sort({ createdAt: 1 }).lean();

    return NextResponse.json({ comments });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { taskId, content, attachments = [] } = body;

    if (!taskId || !content?.trim()) {
      return NextResponse.json({ error: 'Task ID and content are required' }, { status: 400 });
    }

    await connectToDatabase();

    const comment = await CommentModel.create({
      id: generateId('comment'),
      taskId,
      userId: user.id,
      content: content.trim(),
      attachments,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
