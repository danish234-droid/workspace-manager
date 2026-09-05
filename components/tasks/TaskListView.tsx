'use client';

import { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  updateTask, toggleTaskSelection, setSelectedTasks, clearSelection,
  bulkUpdateStatus, bulkDelete,
} from '@/store/taskSlice';
import { setActiveModal, addToast } from '@/store/uiSlice';
import { formatDate } from '@/utils/date';
import type { Task, TaskStatus, Priority, GroupByField } from '@/types';
import {
  CheckCircle2, Circle, Trash2, Layers,
} from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  projectId?: string;
}

export default function TaskListView({ tasks }: TaskListViewProps) {
  const dispatch = useAppDispatch();
  const selectedTaskIds = useAppSelector(state => state.task.selectedTaskIds);
  const users = useAppSelector(state => state.auth.users);
  const labels = useAppSelector(state => state.settings.labels);

  const [groupBy, setGroupBy] = useState<GroupByField>('status');
  const [bulkStatus, setBulkStatus] = useState<TaskStatus>('done');

  const allSelected = tasks.length > 0 && tasks.every(t => selectedTaskIds.includes(t.id));

  const handleToggleAll = () => {
    if (allSelected) {
      dispatch(clearSelection());
    } else {
      dispatch(setSelectedTasks(tasks.map(t => t.id)));
    }
  };

  const handleBulkStatusApply = () => {
    if (selectedTaskIds.length === 0) return;
    dispatch(bulkUpdateStatus({ taskIds: selectedTaskIds, status: bulkStatus }));
    dispatch(addToast({ type: 'success', message: `Updated ${selectedTaskIds.length} tasks to ${bulkStatus}` }));
  };

  const handleBulkDeleteApply = () => {
    if (selectedTaskIds.length === 0) return;
    if (confirm(`Delete ${selectedTaskIds.length} selected tasks?`)) {
      dispatch(bulkDelete(selectedTaskIds));
      dispatch(addToast({ type: 'info', message: `Deleted ${selectedTaskIds.length} tasks` }));
    }
  };

  const groups = useMemo(() => {
    if (groupBy === 'none') {
      return [{ id: 'all', title: 'All Tasks', tasks }];
    }

    if (groupBy === 'status') {
      const statuses: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'review', 'done'];
      return statuses.map(st => ({
        id: st,
        title: st.replace('-', ' ').toUpperCase(),
        tasks: tasks.filter(t => t.status === st),
      }));
    }

    if (groupBy === 'priority') {
      const priorities: Priority[] = ['urgent', 'high', 'medium', 'low', 'none'];
      return priorities.map(p => ({
        id: p,
        title: p.toUpperCase(),
        tasks: tasks.filter(t => t.priority === p),
      }));
    }

    if (groupBy === 'assignee') {
      const uniqueAssigneeIds = Array.from(new Set(tasks.map(t => t.assigneeId || 'unassigned')));
      return uniqueAssigneeIds.map(aId => {
        const u = users.find(user => user.id === aId);
        return {
          id: aId,
          title: u ? u.name : 'Unassigned',
          tasks: tasks.filter(t => (t.assigneeId || 'unassigned') === aId),
        };
      });
    }

    return [{ id: 'all', title: 'All Tasks', tasks }];
  }, [tasks, groupBy, users]);

  return (
    <div className="space-y-4 select-none">
      {/* List View Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--fg-tertiary)' }}>
            <Layers size={13} /> Group:
          </span>
          {(['status', 'priority', 'assignee', 'none'] as GroupByField[]).map(g => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`px-2 py-0.5 rounded-md capitalize text-xs font-medium transition-all ${
                groupBy === g
                  ? 'text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              style={{
                background: groupBy === g ? 'var(--accent-primary)' : 'transparent',
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Bulk Actions Panel */}
        {selectedTaskIds.length > 0 && (
          <div
            className="flex items-center gap-2 p-1 px-2.5 rounded-md border text-xs animate-scale-in"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--accent-primary)',
            }}
          >
            <span className="font-semibold text-xs" style={{ color: 'var(--accent-primary)' }}>
              {selectedTaskIds.length} selected
            </span>
            <div className="w-px h-3.5 bg-zinc-800" />
            <select
              value={bulkStatus}
              onChange={e => setBulkStatus(e.target.value as TaskStatus)}
              className="px-2 py-0.5 rounded border text-xs bg-transparent outline-none"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--fg-primary)' }}
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            <button
              onClick={handleBulkStatusApply}
              className="px-2 py-0.5 rounded text-white font-medium text-xs"
              style={{ background: 'var(--accent-primary)' }}
            >
              Set Status
            </button>
            <button
              onClick={handleBulkDeleteApply}
              className="p-1 rounded text-red-400 hover:bg-red-500/10"
              title="Delete selected"
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={() => dispatch(clearSelection())}
              className="text-zinc-400 hover:text-zinc-200 text-xs ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Table Groups */}
      <div className="space-y-4">
        {groups.map(group => {
          if (group.tasks.length === 0) return null;

          return (
            <div
              key={group.id}
              className="rounded-lg border overflow-hidden"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border-primary)',
              }}
            >
              {/* Group Header */}
              <div
                className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold"
                style={{
                  background: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-primary)',
                  color: 'var(--fg-secondary)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleToggleAll}
                    title="Select all tasks"
                    className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="uppercase tracking-wider text-[11px] font-bold">{group.title}</span>
                  <span
                    className="px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--fg-tertiary)' }}
                  >
                    {group.tasks.length}
                  </span>
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                {group.tasks.map(task => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  const isDone = task.status === 'done';
                  const assignee = users.find(u => u.id === task.assigneeId);
                  const taskLabels = (task.labelIds || []).map(id => labels.find(l => l.id === id)).filter(Boolean);

                  return (
                    <div
                      key={task.id}
                      onClick={() => dispatch(setActiveModal(`task:${task.id}`))}
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs transition-colors hover:bg-[var(--bg-hover)] cursor-pointer group"
                    >
                      {/* Left: Checkbox, status toggle & task title */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-4">
                        <div onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => dispatch(toggleTaskSelection(task.id))}
                            className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            dispatch(
                              updateTask({
                                id: task.id,
                                updates: { status: isDone ? 'todo' : 'done' },
                              })
                            );
                          }}
                          className="text-zinc-500 hover:text-[var(--accent-primary)] transition-colors flex-shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle2 size={15} className="text-emerald-400" />
                          ) : (
                            <Circle size={15} />
                          )}
                        </button>

                        <span
                          className={`font-semibold text-xs truncate ${
                            isDone ? 'line-through opacity-50' : ''
                          }`}
                          style={{ color: 'var(--fg-primary)' }}
                        >
                          {task.title}
                        </span>

                        {/* Labels */}
                        <div className="hidden md:flex items-center gap-1">
                          {taskLabels.slice(0, 2).map(l => (
                            <span
                              key={l!.id}
                              className="text-[10px] font-medium px-1.5 py-0.2 rounded"
                              style={{
                                background: `${l!.color}15`,
                                color: l!.color,
                              }}
                            >
                              {l!.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right metadata columns */}
                      <div className="flex items-center gap-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        {/* Priority Badge */}
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
                          {task.priority || 'none'}
                        </span>

                        {/* Due Date */}
                        <span className="w-20 text-right font-mono text-[10px] text-zinc-400">
                          {task.dueDate ? formatDate(task.dueDate) : '—'}
                        </span>

                        {/* Assignee */}
                        <div className="w-6 flex justify-center">
                          {assignee ? (
                            <span
                              title={assignee.name}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
                              style={{ background: assignee.avatarColor }}
                            >
                              {assignee.name.charAt(0)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-600">•</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div
            className="p-8 rounded-lg border text-center text-xs text-zinc-400"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
          >
            All caught up! There are no tasks matching your current view filter.
          </div>
        )}
      </div>
    </div>
  );
}
