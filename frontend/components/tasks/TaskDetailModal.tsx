'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setActiveModal, addToast } from '@/store/uiSlice';
import {
  updateTask, deleteTask, duplicateTask, createTask,
  addAttachmentId, removeAttachmentId, convertToTask,
} from '@/store/taskSlice';
import { addComment, editComment, deleteComment } from '@/store/commentSlice';
import { addActivity } from '@/store/activitySlice';
import { addNotification } from '@/store/notificationSlice';
import {
  saveAttachment, getAttachmentsByTask, deleteAttachment as deleteIdbAttachment,
  type StoredAttachment,
} from '@/utils/indexedDb';
import { generateId } from '@/utils/id';
import { formatDate, formatRelativeTime, isOverdue } from '@/utils/date';
import type { Task, TaskStatus, Priority } from '@/types';
import {
  X, Paperclip, MessageSquare, Clock,
  Trash2, Copy, AlertTriangle, Plus, CornerDownRight, CheckSquare, Edit3, Download,
} from 'lucide-react';

export default function TaskDetailModal() {
  const activeModal = useAppSelector(state => state.ui.activeModal);
  const tasks = useAppSelector(state => state.task.tasks);

  const taskId = activeModal?.startsWith('task:') ? activeModal.slice(5) : null;
  const task = tasks.find(t => t.id === taskId);

  if (!task) return null;

  return <TaskDetailContent key={task.id} task={task} />;
}

function TaskDetailContent({ task }: { task: Task }) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(state => state.task.tasks);
  const projects = useAppSelector(state => state.project.projects);
  const users = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const allLabels = useAppSelector(state => state.settings.labels);
  const allComments = useAppSelector(state => state.comment.comments);
  const allActivities = useAppSelector(state => state.activity.activities);
  const workspaceMembers = useAppSelector(state => state.workspace.members);

  const project = projects.find(p => p.id === task.projectId);

  // Subtasks
  const subtasks = useMemo(
    () => tasks.filter(t => t.parentTaskId === task.id),
    [tasks, task.id]
  );
  const completedSubtasksCount = subtasks.filter(s => s.status === 'done').length;

  // Comments & Activities for this task
  const taskComments = useMemo(
    () => allComments.filter(c => c.taskId === task.id),
    [allComments, task.id]
  );
  const taskActivities = useMemo(
    () => allActivities.filter(a => a.taskId === task.id),
    [allActivities, task.id]
  );

  // Local state initialized with current task properties
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<StoredAttachment[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load attachments asynchronously from IndexedDB
  useEffect(() => {
    let cancelled = false;
    getAttachmentsByTask(task.id)
      .then(atts => {
        if (!cancelled) setAttachments(atts);
      })
      .catch(err => console.warn('Failed to load attachments from IndexedDB:', err));

    return () => {
      cancelled = true;
    };
  }, [task.id]);

  const projectMembers = workspaceMembers
    .filter(m => m.workspaceId === task.workspaceId)
    .map(m => users.find(u => u.id === m.userId))
    .filter((u): u is NonNullable<typeof u> => !!u);

  // Mention suggestions
  const mentionSuggestions = projectMembers.filter(m =>
    mentionQuery ? m.name.toLowerCase().includes(mentionQuery.toLowerCase()) : true
  );

  const handleTitleBlur = () => {
    if (title.trim() && title.trim() !== task.title) {
      dispatch(updateTask({ id: task.id, updates: { title: title.trim() } }));
      if (currentUser) {
        dispatch(
          addActivity({
            workspaceId: task.workspaceId,
            projectId: task.projectId,
            taskId: task.id,
            actorId: currentUser.id,
            action: 'task_updated',
            metadata: { field: 'title', value: title.trim() },
          })
        );
      }
    } else {
      setTitle(task.title);
    }
  };

  const handleDescriptionBlur = () => {
    if (description.trim() !== (task.description || '')) {
      dispatch(updateTask({ id: task.id, updates: { description: description.trim() } }));
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    dispatch(updateTask({ id: task.id, updates: { status: newStatus } }));
    if (currentUser) {
      dispatch(
        addActivity({
          workspaceId: task.workspaceId,
          projectId: task.projectId,
          taskId: task.id,
          actorId: currentUser.id,
          action: 'status_changed',
          metadata: { from: task.status, to: newStatus },
        })
      );
    }
    dispatch(
      addToast({
        type: 'info',
        message: `Task moved to ${newStatus}`,
      })
    );
  };

  const handlePriorityChange = (newPriority: Priority) => {
    dispatch(updateTask({ id: task.id, updates: { priority: newPriority } }));
    if (currentUser) {
      dispatch(
        addActivity({
          workspaceId: task.workspaceId,
          projectId: task.projectId,
          taskId: task.id,
          actorId: currentUser.id,
          action: 'priority_changed',
          metadata: { from: task.priority, to: newPriority },
        })
      );
    }
  };

  const handleAssigneeChange = (newAssigneeId: string) => {
    const assignee = newAssigneeId || undefined;
    dispatch(updateTask({ id: task.id, updates: { assigneeId: assignee } }));
    if (currentUser) {
      dispatch(
        addActivity({
          workspaceId: task.workspaceId,
          projectId: task.projectId,
          taskId: task.id,
          actorId: currentUser.id,
          action: 'assignee_changed',
          metadata: { assigneeId: assignee },
        })
      );
      if (assignee && assignee !== currentUser.id) {
        dispatch(
          addNotification({
            userId: assignee,
            type: 'task_assigned',
            title: 'Assigned to Task',
            message: `${currentUser.name} assigned you to "${task.title}"`,
            taskId: task.id,
            projectId: task.projectId,
            workspaceId: task.workspaceId,
          })
        );
      }
    }
  };

  const handleDueDateChange = (newDueDate: string) => {
    dispatch(updateTask({ id: task.id, updates: { dueDate: newDueDate || undefined } }));
  };

  const handleToggleLabel = (labelId: string) => {
    const current = task.labelIds || [];
    const next = current.includes(labelId)
      ? current.filter(id => id !== labelId)
      : [...current, labelId];
    dispatch(updateTask({ id: task.id, updates: { labelIds: next } }));
  };

  // Subtask handlers
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !currentUser) return;

    dispatch(
      createTask({
        projectId: task.projectId,
        workspaceId: task.workspaceId,
        parentTaskId: task.id,
        title: newSubtaskTitle.trim(),
        status: 'todo',
        priority: 'medium',
        createdBy: currentUser.id,
      })
    );
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtask: (typeof subtasks)[0]) => {
    const newStatus: TaskStatus = subtask.status === 'done' ? 'todo' : 'done';
    dispatch(updateTask({ id: subtask.id, updates: { status: newStatus } }));
  };

  // Attachments
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      const buffer = await file.arrayBuffer();
      const attId = generateId('att');
      const attachment: StoredAttachment = {
        id: attId,
        taskId: task.id,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        data: buffer,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
      };

      await saveAttachment(attachment);
      dispatch(addAttachmentId({ taskId: task.id, attachmentId: attId }));
      setAttachments(prev => [...prev, attachment]);
      dispatch(addToast({ type: 'success', message: `Attached "${file.name}"` }));
    } catch (err) {
      console.error('Failed to attach file:', err);
      dispatch(addToast({ type: 'error', message: 'Failed to upload attachment' }));
    }
  };

  const handleDeleteAttachment = async (attId: string) => {
    try {
      await deleteIdbAttachment(attId);
      dispatch(removeAttachmentId({ taskId: task.id, attachmentId: attId }));
      setAttachments(prev => prev.filter(a => a.id !== attId));
      dispatch(addToast({ type: 'info', message: 'Attachment removed' }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadAttachment = (att: StoredAttachment) => {
    const blob = new Blob([att.data], { type: att.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = att.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Comments
  const handleCommentChange = (text: string) => {
    setNewCommentText(text);
    const lastAt = text.lastIndexOf('@');
    if (lastAt !== -1 && (lastAt === 0 || text[lastAt - 1] === ' ')) {
      const query = text.slice(lastAt + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        return;
      }
    }
    setMentionQuery(null);
  };

  const handleInsertMention = (user: (typeof projectMembers)[0]) => {
    const lastAt = newCommentText.lastIndexOf('@');
    if (lastAt !== -1) {
      const prefix = newCommentText.slice(0, lastAt);
      const nextText = `${prefix}@${user.name} `;
      setNewCommentText(nextText);
      setMentionQuery(null);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentUser) return;

    // Detect mentioned users
    const mentions: string[] = [];
    projectMembers.forEach(u => {
      if (newCommentText.includes(`@${u.name}`)) {
        mentions.push(u.id);
        if (u.id !== currentUser.id) {
          dispatch(
            addNotification({
              userId: u.id,
              type: 'task_mentioned',
              title: 'Mentioned in a comment',
              message: `${currentUser.name} mentioned you in "${task.title}"`,
              taskId: task.id,
              projectId: task.projectId,
              workspaceId: task.workspaceId,
            })
          );
        }
      }
    });

    dispatch(
      addComment({
        taskId: task.id,
        authorId: currentUser.id,
        content: newCommentText.trim(),
        mentions,
      })
    );

    dispatch(
      addActivity({
        workspaceId: task.workspaceId,
        projectId: task.projectId,
        taskId: task.id,
        actorId: currentUser.id,
        action: 'comment_added',
        metadata: { snippet: newCommentText.slice(0, 40) },
      })
    );

    setNewCommentText('');
    setMentionQuery(null);
  };

  const handleSaveEditComment = (commentId: string) => {
    if (!editCommentText.trim()) return;
    dispatch(editComment({ id: commentId, content: editCommentText.trim(), mentions: [] }));
    setEditingCommentId(null);
  };

  const handleDuplicate = () => {
    dispatch(duplicateTask(task.id));
    dispatch(addToast({ type: 'success', message: 'Task duplicated' }));
    dispatch(setActiveModal(null));
  };

  const handleDelete = () => {
    dispatch(deleteTask(task.id));
    dispatch(
      addToast({
        type: 'info',
        message: `Task "${task.title}" deleted`,
        duration: 5000,
      })
    );
    dispatch(setActiveModal(null));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
      onClick={() => dispatch(setActiveModal(null))}
    >
      <div
        className="w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl animate-scale-in my-8 flex flex-col max-h-[90vh]"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-primary)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          className="flex items-center justify-between px-6 py-3.5"
          style={{
            borderBottom: '1px solid var(--border-primary)',
            background: 'var(--bg-secondary)',
          }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--fg-tertiary)' }}>
            <span>{project?.icon}</span>
            <span className="font-medium truncate max-w-[160px]">{project?.name}</span>
            <span>/</span>
            <span className="font-mono">{task.id}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleDuplicate}
              title="Duplicate Task"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => setIsDeleting(true)}
              title="Delete Task"
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => dispatch(setActiveModal(null))}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {isDeleting && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertTriangle size={18} />
              <span>Are you sure you want to delete this task and all its subtasks?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-3 py-1 rounded text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* Modal Main Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="w-full text-xl font-bold bg-transparent border-none outline-none focus:ring-1 focus:ring-violet-500 rounded px-1 py-0.5"
              style={{ color: 'var(--fg-primary)' }}
            />
          </div>

          {/* Properties Grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            {/* Status */}
            <div>
              <span className="block text-xs font-semibold mb-1" style={{ color: 'var(--fg-tertiary)' }}>
                Status
              </span>
              <select
                value={task.status}
                onChange={e => handleStatusChange(e.target.value as TaskStatus)}
                className="w-full text-xs font-medium px-2 py-1.5 rounded-lg border outline-none"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-primary)',
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

            {/* Priority */}
            <div>
              <span className="block text-xs font-semibold mb-1" style={{ color: 'var(--fg-tertiary)' }}>
                Priority
              </span>
              <select
                value={task.priority}
                onChange={e => handlePriorityChange(e.target.value as Priority)}
                className="w-full text-xs font-medium px-2 py-1.5 rounded-lg border outline-none"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-primary)',
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

            {/* Assignee */}
            <div>
              <span className="block text-xs font-semibold mb-1" style={{ color: 'var(--fg-tertiary)' }}>
                Assignee
              </span>
              <select
                value={task.assigneeId || ''}
                onChange={e => handleAssigneeChange(e.target.value)}
                className="w-full text-xs font-medium px-2 py-1.5 rounded-lg border outline-none truncate"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
              >
                <option value="">Unassigned</option>
                {projectMembers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <span className="block text-xs font-semibold mb-1 flex items-center justify-between" style={{ color: 'var(--fg-tertiary)' }}>
                <span>Due Date</span>
                {task.dueDate && isOverdue(task.dueDate) && (
                  <span className="text-[10px] text-red-500 font-bold">OVERDUE</span>
                )}
              </span>
              <input
                type="date"
                value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                onChange={e => handleDueDateChange(e.target.value)}
                className="w-full text-xs font-medium px-2 py-1.5 rounded-lg border outline-none"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
              />
            </div>
          </div>

          {/* Labels Section */}
          <div>
            <span className="block text-xs font-semibold mb-2" style={{ color: 'var(--fg-secondary)' }}>
              Labels
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {allLabels
                .filter(l => l.workspaceId === task.workspaceId)
                .map(lbl => {
                  const isAttached = task.labelIds?.includes(lbl.id);
                  return (
                    <button
                      key={lbl.id}
                      onClick={() => handleToggleLabel(lbl.id)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: isAttached ? lbl.color : 'var(--bg-tertiary)',
                        color: isAttached ? '#ffffff' : 'var(--fg-secondary)',
                        border: isAttached ? `1px solid ${lbl.color}` : '1px solid var(--border-primary)',
                        opacity: isAttached ? 1 : 0.7,
                      }}
                    >
                      {lbl.name}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="block text-xs font-semibold mb-2" style={{ color: 'var(--fg-secondary)' }}>
              Description
            </span>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add detailed task instructions, notes, or criteria..."
              className="w-full p-3 rounded-lg text-sm border outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-colors resize-y"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--fg-primary)',
              }}
            />
          </div>

          {/* Subtasks Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold flex items-center gap-2" style={{ color: 'var(--fg-secondary)' }}>
                <CheckSquare size={14} className="text-violet-400" />
                Subtasks ({completedSubtasksCount}/{subtasks.length})
              </span>
              {subtasks.length > 0 && (
                <span className="text-xs font-mono text-zinc-400">
                  {Math.round((completedSubtasksCount / subtasks.length) * 100)}%
                </span>
              )}
            </div>

            {/* Progress bar */}
            {subtasks.length > 0 && (
              <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${(completedSubtasksCount / subtasks.length) * 100}%` }}
                />
              </div>
            )}

            {/* Subtask list */}
            <div className="space-y-1.5 mb-3">
              {subtasks.map(st => (
                <div
                  key={st.id}
                  className="group flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-zinc-800/50 transition-colors"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0">
                    <input
                      type="checkbox"
                      checked={st.status === 'done'}
                      onChange={() => handleToggleSubtask(st)}
                      className="rounded border-zinc-700 text-violet-600 focus:ring-violet-500 bg-zinc-900"
                    />
                    <span
                      className={`truncate ${st.status === 'done' ? 'line-through text-zinc-500' : ''}`}
                      style={{ color: st.status === 'done' ? 'var(--fg-tertiary)' : 'var(--fg-primary)' }}
                    >
                      {st.title}
                    </span>
                  </label>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={() => dispatch(convertToTask(st.id))}
                      title="Promote to independent task"
                      className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <CornerDownRight size={13} />
                    </button>
                    <button
                      onClick={() => dispatch(deleteTask(st.id))}
                      title="Delete subtask"
                      className="p-1 rounded text-zinc-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add subtask input */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a new subtask..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-sm transition-opacity disabled:opacity-50"
                style={{ background: 'var(--accent-primary)' }}
              >
                Add
              </button>
            </form>
          </div>

          {/* Attachments Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold flex items-center gap-2" style={{ color: 'var(--fg-secondary)' }}>
                <Paperclip size={14} className="text-violet-400" />
                Attachments ({attachments.length})
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-violet-400 hover:text-violet-300 hover:underline flex items-center gap-1 transition-colors"
              >
                <Plus size={13} /> Upload File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map(att => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border text-xs"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                    }}
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="font-medium truncate" style={{ color: 'var(--fg-primary)' }}>
                        {att.name}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--fg-tertiary)' }}>
                        {(att.size / 1024).toFixed(1)} KB • {formatDate(att.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownloadAttachment(att)}
                        title="Download"
                        className="p-1 rounded text-zinc-400 hover:text-violet-400 transition-colors"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteAttachment(att.id)}
                        title="Delete"
                        className="p-1 rounded text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabs: Comments & Activity */}
          <div>
            <div className="flex items-center gap-4 border-b border-zinc-800 mb-4">
              <button
                onClick={() => setActiveTab('comments')}
                className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'comments'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <MessageSquare size={13} />
                Comments ({taskComments.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'activity'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Clock size={13} />
                Activity ({taskActivities.length})
              </button>
            </div>

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                {/* Add comment form */}
                <div className="relative">
                  <form onSubmit={handleAddComment} className="space-y-2">
                    <textarea
                      rows={2}
                      value={newCommentText}
                      onChange={e => handleCommentChange(e.target.value)}
                      placeholder="Write a comment... (Type @ to mention a teammate)"
                      className="w-full p-2.5 text-xs rounded-lg border outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 resize-none transition-colors"
                      style={{
                        background: 'var(--bg-input)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--fg-primary)',
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: 'var(--fg-tertiary)' }}>
                        Tip: use @name to notify collaborators
                      </span>
                      <button
                        type="submit"
                        disabled={!newCommentText.trim()}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                        style={{ background: 'var(--accent-primary)' }}
                      >
                        Comment
                      </button>
                    </div>
                  </form>

                  {/* Mention Dropdown */}
                  {mentionQuery !== null && mentionSuggestions.length > 0 && (
                    <div
                      className="absolute bottom-full mb-1 left-0 w-60 rounded-lg shadow-lg border p-1 z-30 max-h-40 overflow-y-auto"
                      style={{
                        background: 'var(--bg-elevated)',
                        borderColor: 'var(--border-primary)',
                      }}
                    >
                      <div className="text-[10px] font-semibold px-2 py-1 text-stone-400">
                        Mention a collaborator
                      </div>
                      {mentionSuggestions.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleInsertMention(u)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        >
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                            style={{ background: u.avatarColor }}
                          >
                            {u.name.charAt(0)}
                          </span>
                          <span className="truncate font-medium">{u.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comment list */}
                <div className="space-y-3 pt-2">
                  {taskComments.length === 0 ? (
                    <p className="text-xs text-stone-400 py-2">No comments yet. Start the conversation!</p>
                  ) : (
                    taskComments.map(c => {
                      const author = users.find(u => u.id === c.authorId);
                      const isAuthor = currentUser?.id === c.authorId;
                      const isEditing = editingCommentId === c.id;

                      return (
                        <div key={c.id} className="flex items-start gap-3 text-xs">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0"
                            style={{ background: author?.avatarColor || '#6366f1' }}
                          >
                            {author?.name.charAt(0) || 'U'}
                          </span>
                          <div
                            className="flex-1 p-3 rounded-lg border min-w-0"
                            style={{
                              background: 'var(--bg-secondary)',
                              borderColor: 'var(--border-primary)',
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold" style={{ color: 'var(--fg-primary)' }}>
                                  {author?.name || 'Unknown User'}
                                </span>
                                <span className="text-[10px]" style={{ color: 'var(--fg-tertiary)' }}>
                                  {formatRelativeTime(c.createdAt)}
                                </span>
                                {c.editedAt && (
                                  <span className="text-[9px] text-stone-400 italic">(edited)</span>
                                )}
                              </div>
                              {isAuthor && !isEditing && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(c.id);
                                      setEditCommentText(c.content);
                                    }}
                                    className="p-0.5 rounded text-stone-400 hover:text-stone-600"
                                  >
                                    <Edit3 size={11} />
                                  </button>
                                  <button
                                    onClick={() => dispatch(deleteComment(c.id))}
                                    className="p-0.5 rounded text-stone-400 hover:text-red-500"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {isEditing ? (
                              <div className="space-y-2 mt-2">
                                <textarea
                                  rows={2}
                                  value={editCommentText}
                                  onChange={e => setEditCommentText(e.target.value)}
                                  className="w-full p-2 rounded text-xs border outline-none bg-transparent"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setEditingCommentId(null)}
                                    className="px-2 py-1 rounded text-[11px] text-zinc-400"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEditComment(c.id)}
                                    className="px-2 py-1 rounded text-[11px] bg-[var(--accent-primary)] text-white font-medium"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap leading-relaxed text-xs" style={{ color: 'var(--fg-primary)' }}>
                                {c.content.split(/(@[a-zA-Z0-9_\-\.\s]+?\b)/g).map((part, idx) => {
                                  if (part.startsWith('@')) {
                                    return (
                                      <span
                                        key={idx}
                                        className="font-semibold px-1.5 py-0.5 rounded text-[11px] mx-0.5 inline-block"
                                        style={{
                                          background: 'var(--accent-primary-light)',
                                          color: 'var(--accent-primary)',
                                        }}
                                      >
                                        {part}
                                      </span>
                                    );
                                  }
                                  return part;
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-3 pt-2">
                {taskActivities.length === 0 ? (
                  <p className="text-xs text-stone-400 py-2">No activity recorded for this task yet.</p>
                ) : (
                  taskActivities.map(act => {
                    const actor = users.find(u => u.id === act.actorId);
                    return (
                      <div key={act.id} className="flex items-center gap-2.5 text-xs py-1">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                          style={{ background: actor?.avatarColor || '#6366f1' }}
                        >
                          {actor?.name.charAt(0) || 'U'}
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--fg-primary)' }}>
                          {actor?.name}
                        </span>
                        <span style={{ color: 'var(--fg-secondary)' }}>
                          {act.action.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] ml-auto font-mono" style={{ color: 'var(--fg-tertiary)' }}>
                          {formatRelativeTime(act.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
