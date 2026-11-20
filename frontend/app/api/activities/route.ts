import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { ActivityModel, NotificationModel } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const projectId = searchParams.get('projectId');

    await connectToDatabase();
    const query: Record<string, any> = {};
    if (workspaceId) query.workspaceId = workspaceId;
    if (projectId) query.projectId = projectId;

    const activities = await ActivityModel.find(query).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ activities });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
