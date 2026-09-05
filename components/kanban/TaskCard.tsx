'use client';

import { useMemo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setActiveModal } from '@/store/uiSlice';
import { deleteTask, duplicateTask } from '@/store/taskSlice';
import { formatDate, isOverdue, isToday } from '@/utils/date';
import type { Task } from '@/types';
import {
  Calendar, CheckSquare, MessageSquare, Paperclip, MoreVertical,
  Trash2, Copy,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export default function TaskCard({ task, isDragging }: TaskCardProps) {
  const dispatch = useAppDispatch();
  const users = useAppSelector(state => state.auth.users);
  const labels = useAppSelector(state => state.settings.labels);
  const allComments = useAppSelector(state => state.comment.comments);
  const allTasks = useAppSelector(state => state.task.tasks);

  const [menuOpen, setMenuOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const activeDragging = isSortableDragging || isDragging;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: activeDragging ? 0.5 : 1,
    scale: activeDragging ? 1.02 : 1,
  };

  const assignee = useMemo(
    () => (task.assigneeId ? users.find(u => u.id === task.assigneeId) : null),
    [users, task.assigneeId]
  );

  const taskLabels = useMemo(
    () => (task.labelIds || []).map(id => labels.find(l => l.id === id)).filter(Boolean),
    [labels, task.labelIds]
  );

  const subtasks = useMemo(
    () => allTasks.filter(t => t.parentTaskId === task.id),
    [allTasks, task.id]
  );
  const completedSubtasks = subtasks.filter(s => s.status === 'done').length;

  const commentCount = useMemo(
    () => allComments.filter(c => c.taskId === task.id).length,
    [allComments, task.id]
  );

  const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'done';
  const dueToday = task.dueDate && isToday(task.dueDate) && task.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => dispatch(setActiveModal(`task:${task.id}`))}
      className="group relative p-3 rounded-lg border transition-all duration-150 cursor-grab active:cursor-grabbing hover:border-[var(--accent-primary)] select-none shadow-sm"
      style={{
        ...style,
        background: 'var(--bg-elevated)',
        borderColor: activeDragging ? 'var(--accent-primary)' : 'var(--border-primary)',
        boxShadow: activeDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      }}
    >
      {/* Top row: Priority & Labels */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.priority && task.priority !== 'none' && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded capitalize ${
                task.priority === 'urgent'
                  ? 'priority-bg-urgent'
                  : task.priority === 'high'
                  ? 'priority-bg-high'
                  : task.priority === 'medium'
                  ? 'priority-bg-medium'
                  : 'priority-bg-low'
              }`}
            >
              ● {task.priority}
            </span>
          )}

          {taskLabels.slice(0, 2).map(l => (
            <span
              key={l!.id}
              className="text-[10px] font-medium px-1.5 py-0.2 rounded"
              style={{
                background: `${l!.color}15`,
                color: l!.color,
                border: `1px solid ${l!.color}35`,
              }}
            >
              {l!.name}
            </span>
          ))}

          {taskLabels.length > 2 && (
            <span className="text-[10px] text-zinc-400 font-medium">
              +{taskLabels.length - 2}
            </span>
          )}
        </div>

        {/* Quick More Actions Menu */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-0.5 rounded text-zinc-500 hover:text-zinc-200 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={13} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-32 rounded-md border shadow-lg py-1 z-30 text-xs animate-scale-in"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <button
                onClick={() => {
                  dispatch(duplicateTask(task.id));
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[var(--bg-hover)]"
              >
                <Copy size={13} /> Duplicate
              </button>
              <button
                onClick={() => {
                  dispatch(deleteTask(task.id));
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4
        className="text-xs font-semibold leading-snug mb-2.5 line-clamp-2"
        style={{ color: 'var(--fg-primary)' }}
      >
        {task.title}
      </h4>

      {/* Footer details: Due date, Subtasks, Comments, Attachments & Assignee */}
      <div className="flex items-center justify-between text-[11px] pt-1" style={{ color: 'var(--fg-tertiary)' }}>
        <div className="flex items-center gap-2.5">
          {/* Due date */}
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 font-medium text-[10px] ${
                overdue
                  ? 'text-red-500 font-bold'
                  : dueToday
                  ? 'text-amber-500 font-bold'
                  : 'text-zinc-400'
              }`}
            >
              <Calendar size={11} />
              <span>{formatDate(task.dueDate)}</span>
            </span>
          )}

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
              <CheckSquare size={11} />
              <span>
                {completedSubtasks}/{subtasks.length}
              </span>
            </span>
          )}

          {/* Comments */}
          {commentCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
              <MessageSquare size={11} />
              <span>{commentCount}</span>
            </span>
          )}

          {/* Attachments */}
          {task.attachmentIds && task.attachmentIds.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
              <Paperclip size={11} />
              <span>{task.attachmentIds.length}</span>
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {assignee ? (
          <span
            title={assignee.name}
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0"
            style={{ background: assignee.avatarColor }}
          >
            {assignee.name.charAt(0)}
          </span>
        ) : (
          <span className="w-5 h-5 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-[9px] text-zinc-500">
            ?
          </span>
        )}
      </div>
    </div>
  );
}
