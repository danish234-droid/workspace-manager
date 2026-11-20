import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { WorkspaceModel, WorkspaceMemberModel, ProjectModel, TaskModel } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const workspace = await WorkspaceModel.findOne({ id }).lean();
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const members = await WorkspaceMemberModel.find({ workspaceId: id }).lean();

    return NextResponse.json({ workspace, members });
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();
    const updated = await WorkspaceModel.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    return NextResponse.json({ workspace: updated });
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    await WorkspaceModel.deleteOne({ id });
    await WorkspaceMemberModel.deleteMany({ workspaceId: id });
    await ProjectModel.deleteMany({ workspaceId: id });
    await TaskModel.deleteMany({ workspaceId: id });

    return NextResponse.json({ success: true, message: 'Workspace deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
