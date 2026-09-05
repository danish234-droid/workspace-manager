'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { updateTask } from '@/store/taskSlice';
import { addComment } from '@/store/commentSlice';
import { addActivity } from '@/store/activitySlice';
import { addNotification } from '@/store/notificationSlice';
import { addToast } from '@/store/uiSlice';
import type { TaskStatus } from '@/types';

const MOCK_SIMULATION_COMMENTS = [
  'Just finished reviewing the latest updates. Looks great!',
  'Checked the edge cases on mobile, working smoothly.',
  'Updated the acceptance criteria for this sprint.',
  'Drafted documentation for this module.',
  'Optimized performance for faster render times.',
];

export function useCollaborationSimulation(enabled = true) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const tasks = useAppSelector(state => state.task.tasks);
  const users = useAppSelector(state => state.auth.users);
  const activeWorkspaceId = useAppSelector(state => state.workspace.activeWorkspaceId);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !currentUser || tasks.length === 0) return;

    // Run simulated activity every 50 seconds
    timerRef.current = setInterval(() => {
      // Pick other teammates
      const otherUsers = users.filter(u => u.id !== currentUser.id);
      if (otherUsers.length === 0) return;

      const randomTeammate = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      const activeTasks = tasks.filter(t => t.workspaceId === activeWorkspaceId);
      if (activeTasks.length === 0) return;

      const randomTask = activeTasks[Math.floor(Math.random() * activeTasks.length)];
      const actionType = Math.random() > 0.5 ? 'comment' : 'status';

      if (actionType === 'comment') {
        const commentText =
          MOCK_SIMULATION_COMMENTS[Math.floor(Math.random() * MOCK_SIMULATION_COMMENTS.length)];

        dispatch(
          addComment({
            taskId: randomTask.id,
            authorId: randomTeammate.id,
            content: commentText,
            mentions: [currentUser.id],
          })
        );

        dispatch(
          addActivity({
            workspaceId: randomTask.workspaceId,
            projectId: randomTask.projectId,
            taskId: randomTask.id,
            actorId: randomTeammate.id,
            action: 'comment_added',
            metadata: { snippet: commentText.slice(0, 30) },
          })
        );

        dispatch(
          addNotification({
            userId: currentUser.id,
            type: 'comment_added',
            title: `New comment from ${randomTeammate.name}`,
            message: `"${commentText}" on ${randomTask.title}`,
            taskId: randomTask.id,
            projectId: randomTask.projectId,
            workspaceId: randomTask.workspaceId,
          })
        );

        dispatch(
          addToast({
            type: 'info',
            message: `${randomTeammate.name} commented on "${randomTask.title}"`,
            duration: 4000,
          })
        );
      } else {
        const statuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
        const currentIdx = statuses.indexOf(randomTask.status);
        const nextStatus = statuses[(currentIdx + 1) % statuses.length];

        dispatch(
          updateTask({
            id: randomTask.id,
            updates: { status: nextStatus },
          })
        );

        dispatch(
          addActivity({
            workspaceId: randomTask.workspaceId,
            projectId: randomTask.projectId,
            taskId: randomTask.id,
            actorId: randomTeammate.id,
            action: 'status_changed',
            metadata: { from: randomTask.status, to: nextStatus, by: randomTeammate.name },
          })
        );

        dispatch(
          addToast({
            type: 'info',
            message: `${randomTeammate.name} moved "${randomTask.title}" to ${nextStatus}`,
            duration: 4000,
          })
        );
      }
    }, 55000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, currentUser, tasks, users, activeWorkspaceId, dispatch]);
}
