'use client';

import CommandPalette from '@/components/ui/CommandPalette';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import CreateWorkspaceModal from '@/components/workspaces/CreateWorkspaceModal';
import InviteMemberModal from '@/components/workspaces/InviteMemberModal';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import { useCollaborationSimulation } from '@/hooks/useCollaborationSimulation';

export default function GlobalModals() {
  useCollaborationSimulation(true);

  return (
    <>
      <CommandPalette />
      <CreateTaskModal />
      <CreateProjectModal />
      <CreateWorkspaceModal />
      <InviteMemberModal />
      <TaskDetailModal />
    </>
  );
}
