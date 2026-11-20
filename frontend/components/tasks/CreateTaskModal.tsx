'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setActiveModal, addToast } from '@/store/uiSlice';
import { createTask } from '@/store/taskSlice';
import { addActivity } from '@/store/activitySlice';
import { addNotification } from '@/store/notificationSlice';
import type { TaskStatus, Priority } from '@/types';
import { X, Calendar, User, Tag, AlertCircle } from 'lucide-react';

export default function CreateTaskModal({ defaultProjectId, defaultStatus }: { defaultProjectId?: string; defaultStatus?: TaskStatus }) {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.activeModal === 'createTask');
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const activeWorkspaceId = useAppSelector(state => state.workspace.activeWorkspaceId);
  const projects = useAppSelector(state => state.project.projects.filter(p => p.workspaceId === activeWorkspaceId && p.status === 'active'));
  const labels = useAppSelector(state => state.settings.labels.filter(l => l.workspaceId === activeWorkspaceId));
  const members = useAppSelector(state => state.workspace.members.filter(m => m.workspaceId === activeWorkspaceId));
  const users = useAppSelector(state => state.auth.users);

  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus || 'todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!projectId) {
      setError('Please select a project');
      return;
    }
    if (!activeWorkspaceId || !currentUser) return;

    dispatch(
      createTask({
        projectId,
        workspaceId: activeWorkspaceId,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || undefined,
        labelIds: selectedLabels,
        createdBy: currentUser.id,
      })
    );

    dispatch(
      addActivity({
        workspaceId: activeWorkspaceId,
        projectId,
        actorId: currentUser.id,
        action: 'task_created',
        metadata: { title: title.trim(), status, priority },
      })
    );

    if (assigneeId && assigneeId !== currentUser.id) {
      dispatch(
        addNotification({
          userId: assigneeId,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `${currentUser.name} assigned you to "${title.trim()}"`,
          projectId,
          workspaceId: activeWorkspaceId,
        })
      );
    }

    dispatch(
      addToast({
        type: 'success',
        message: `Task "${title.trim()}" created successfully!`,
      })
    );

    dispatch(setActiveModal(null));
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev =>
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
      onClick={() => dispatch(setActiveModal(null))}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border animate-scale-in"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border-primary)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--fg-primary)' }}>
            Create New Task
          </h2>
          <button
            onClick={() => dispatch(setActiveModal(null))}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400 bg-red-950/30 border border-red-500/30">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Project Selection */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
              Project *
            </label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm transition-all outline-none cursor-pointer focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 [&>option]:bg-zinc-900 [&>option]:text-zinc-200"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-primary)',
                color: 'var(--fg-primary)',
              }}
            >
              {projects.length === 0 && <option value="">No projects available in this workspace</option>}
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Implement user authentication..."
              autoFocus
              className="w-full px-3 py-2 rounded-lg text-sm transition-all outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-primary)',
                color: 'var(--fg-primary)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add more details, acceptance criteria, or context..."
              className="w-full px-3 py-2 rounded-lg text-sm transition-all resize-none outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-primary)',
                color: 'var(--fg-primary)',
              }}
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-lg text-sm transition-all outline-none cursor-pointer focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 [&>option]:bg-zinc-900 [&>option]:text-zinc-200"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-lg text-sm transition-all outline-none cursor-pointer focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 [&>option]:bg-zinc-900 [&>option]:text-zinc-200"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
                <option value="none">⚪ None</option>
              </select>
            </div>
          </div>

          {/* Due Date & Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  Due Date
                </span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm transition-all outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                <span className="flex items-center gap-1.5">
                  <User size={13} />
                  Assignee
                </span>
              </label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm transition-all outline-none cursor-pointer focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 [&>option]:bg-zinc-900 [&>option]:text-zinc-200"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
              >
                <option value="">Unassigned</option>
                {members.map(m => {
                  const u = users.find(user => user.id === m.userId);
                  if (!u) return null;
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name} ({m.role})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Labels */}
          {labels.length > 0 && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                <span className="flex items-center gap-1.5">
                  <Tag size={13} />
                  Labels
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {labels.map(lbl => {
                  const selected = selectedLabels.includes(lbl.id);
                  return (
                    <button
                      key={lbl.id}
                      type="button"
                      onClick={() => toggleLabel(lbl.id)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: selected ? lbl.color : 'var(--bg-tertiary)',
                        color: selected ? '#ffffff' : 'var(--fg-secondary)',
                        border: selected ? `1px solid ${lbl.color}` : '1px solid var(--border-primary)',
                      }}
                    >
                      {lbl.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div
            className="flex items-center justify-end gap-3 pt-3"
            style={{ borderTop: '1px solid var(--border-primary)' }}
          >
            <button
              type="button"
              onClick={() => dispatch(setActiveModal(null))}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: 'var(--fg-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-sm shadow-violet-500/25 hover:brightness-110 active:scale-95"
              style={{ background: 'var(--accent-primary)' }}
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
