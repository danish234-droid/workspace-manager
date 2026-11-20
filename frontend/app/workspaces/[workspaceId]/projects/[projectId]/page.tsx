'use client';

import { useState, useMemo, use } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setProjectView } from '@/store/projectSlice';
import { setActiveModal } from '@/store/uiSlice';
import { saveFilterPreset } from '@/store/settingsSlice';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import TaskListView from '@/components/tasks/TaskListView';
import TaskCalendarView from '@/components/tasks/TaskCalendarView';
import type { ViewType, TaskStatus, Priority, SortField, SortDirection } from '@/types';
import {
  Kanban, List, Calendar, Plus, Search,
  ArrowUpDown, X, Bookmark, CheckSquare, Clock, CheckCircle2,
} from 'lucide-react';

export default function ProjectPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>;
}) {
  const resolvedParams = use(params);
  const { workspaceId, projectId } = resolvedParams;

  const dispatch = useAppDispatch();
  const workspaces = useAppSelector(state => state.workspace.workspaces);
  const allProjects = useAppSelector(state => state.project.projects);
  const allTasks = useAppSelector(state => state.task.tasks);
  const users = useAppSelector(state => state.auth.users);
  const allLabels = useAppSelector(state => state.settings.labels);
  const filterPresets = useAppSelector(state => state.settings.filterPresets);
  const currentUser = useAppSelector(state => state.auth.currentUser);

  const workspace = workspaces.find(w => w.id === workspaceId);
  const project = allProjects.find(p => p.id === projectId);

  // Active view preference (Kanban, List, Calendar)
  const [currentView, setCurrentView] = useState<ViewType>(project?.defaultView || 'kanban');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [presetNameInput, setPresetNameInput] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  // Switch view and persist
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (project) {
      dispatch(setProjectView({ projectId: project.id, view }));
    }
  };

  // Project tasks
  const projectTasks = useMemo(() => {
    return allTasks.filter(t => t.projectId === projectId && !t.parentTaskId);
  }, [allTasks, projectId]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return projectTasks
      .filter(t => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchDesc) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && t.status !== statusFilter) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
          return false;
        }

        // Assignee filter
        if (assigneeFilter !== 'all') {
          if (assigneeFilter === 'unassigned' && t.assigneeId) return false;
          if (assigneeFilter !== 'unassigned' && t.assigneeId !== assigneeFilter) return false;
        }

        // Label filter
        if (labelFilter !== 'all' && !t.labelIds?.includes(labelFilter)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'dueDate') {
          const aTime = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const bTime = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          diff = aTime - bTime;
        } else if (sortField === 'priority') {
          const weight: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
          diff = weight[b.priority || 'none'] - weight[a.priority || 'none'];
        } else if (sortField === 'title') {
          diff = a.title.localeCompare(b.title);
        } else {
          diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return sortDirection === 'asc' ? diff : -diff;
      });
  }, [projectTasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, labelFilter, sortField, sortDirection]);

  // Statistics
  const stats = useMemo(() => {
    const total = projectTasks.length;
    const todo = projectTasks.filter(t => t.status === 'todo' || t.status === 'backlog').length;
    const inProgress = projectTasks.filter(t => t.status === 'in-progress' || t.status === 'review').length;
    const done = projectTasks.filter(t => t.status === 'done').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, todo, inProgress, done, progress };
  }, [projectTasks]);

  // Save Filter Preset
  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetNameInput.trim() || !currentUser) return;

    dispatch(
      saveFilterPreset({
        workspaceId,
        userId: currentUser.id,
        name: presetNameInput.trim(),
        filter: {
          search: searchQuery || undefined,
          statuses: statusFilter !== 'all' ? [statusFilter as TaskStatus] : undefined,
          priorities: priorityFilter !== 'all' ? [priorityFilter as Priority] : undefined,
          assigneeIds: assigneeFilter !== 'all' ? [assigneeFilter] : undefined,
        },
        sort: { field: sortField, direction: sortDirection },
      })
    );

    setPresetNameInput('');
    setIsSavingPreset(false);
  };

  const handleApplyPreset = (preset: (typeof filterPresets)[0]) => {
    if (preset.filter.search) setSearchQuery(preset.filter.search);
    if (preset.filter.statuses?.[0]) setStatusFilter(preset.filter.statuses[0]);
    if (preset.filter.priorities?.[0]) setPriorityFilter(preset.filter.priorities[0]);
    if (preset.filter.assigneeIds?.[0]) setAssigneeFilter(preset.filter.assigneeIds[0]);
    if (preset.sort) {
      setSortField(preset.sort.field);
      setSortDirection(preset.sort.direction);
    }
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || labelFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setLabelFilter('all');
  };

  if (!project) {
    return (
      <AppShell>
        <div className="p-12 text-center text-stone-400">
          <p>Project not found.</p>
          <Link href={`/workspaces/${workspaceId}`} className="text-violet-400 hover:underline mt-2 inline-block">
            Back to Workspace
          </Link>
        </div>
      </AppShell>
    );
  }

  const projectMembers = project.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean);
  const workspaceLabels = allLabels.filter(l => l.workspaceId === workspaceId);

  return (
    <AppShell>
      <div className="space-y-5 max-w-full mx-auto pb-12">
        {/* Project Header Bar */}
        <div
          className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-3.5">
            <span
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ring-1 ring-white/10 shadow-inner"
              style={{ background: project.color ? `${project.color}25` : 'var(--accent-primary-light)' }}
            >
              {project.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/workspaces/${workspaceId}`}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {workspace?.name}
                </Link>
                <span className="text-zinc-600">/</span>
                <span className="text-xs font-mono text-zinc-400 capitalize">
                  {project.template?.replace('-', ' ')}
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--fg-primary)' }}>
                {project.name}
              </h1>
            </div>
          </div>

          {/* Right Header: Team Avatars & View Switcher & Add Task */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Team Avatars */}
            <div className="flex -space-x-1.5 overflow-hidden">
              {projectMembers.slice(0, 4).map(m => (
                <span
                  key={m?.id}
                  title={m?.name}
                  className="w-7 h-7 rounded-full ring-2 ring-black/40 flex items-center justify-center text-xs text-white font-bold shadow-sm"
                  style={{ background: m?.avatarColor || '#7c3aed' }}
                >
                  {m?.name?.charAt(0)}
                </span>
              ))}
            </div>

            {/* View Switcher Pills */}
            <div
              className="flex items-center p-1 rounded-xl border shadow-inner"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <button
                onClick={() => handleViewChange('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  currentView === 'kanban'
                    ? 'text-white shadow-sm shadow-violet-500/25'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={{
                  background: currentView === 'kanban' ? 'var(--accent-primary)' : 'transparent',
                }}
              >
                <Kanban size={13} />
                <span>Board</span>
              </button>

              <button
                onClick={() => handleViewChange('list')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  currentView === 'list'
                    ? 'text-white shadow-sm shadow-violet-500/25'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={{
                  background: currentView === 'list' ? 'var(--accent-primary)' : 'transparent',
                }}
              >
                <List size={13} />
                <span>List</span>
              </button>

              <button
                onClick={() => handleViewChange('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  currentView === 'calendar'
                    ? 'text-white shadow-sm shadow-violet-500/25'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={{
                  background: currentView === 'calendar' ? 'var(--accent-primary)' : 'transparent',
                }}
              >
                <Calendar size={13} />
                <span>Calendar</span>
              </button>
            </div>

            {/* Create Task Button */}
            <button
              onClick={() => dispatch(setActiveModal('createTask'))}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm shadow-violet-500/20 transition-all hover:brightness-110 active:scale-95"
              style={{ background: 'var(--accent-primary)' }}
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Project Mini Stats Bar */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 px-5 rounded-2xl border text-xs gap-3"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-2" style={{ color: 'var(--fg-secondary)' }}>
              <span className="w-6 h-6 rounded-md flex items-center justify-center bg-violet-500/10 text-violet-400">
                <CheckSquare size={13} />
              </span>
              <span>
                Total Tasks: <strong className="text-zinc-100 font-semibold">{stats.total}</strong>
              </span>
            </span>
            <span className="flex items-center gap-2" style={{ color: 'var(--fg-secondary)' }}>
              <span className="w-6 h-6 rounded-md flex items-center justify-center bg-amber-500/10 text-amber-400">
                <Clock size={13} />
              </span>
              <span>
                In Progress: <strong className="text-zinc-100 font-semibold">{stats.inProgress}</strong>
              </span>
            </span>
            <span className="flex items-center gap-2" style={{ color: 'var(--fg-secondary)' }}>
              <span className="w-6 h-6 rounded-md flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={13} />
              </span>
              <span>
                Completed: <strong className="text-zinc-100 font-semibold">{stats.done}</strong>
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-zinc-300">
              {stats.progress}% Complete
            </span>
            <div className="w-28 h-2 bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          className="p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border flex-1 min-w-[170px] max-w-xs transition-all duration-150 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/25"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <Search size={14} style={{ color: 'var(--fg-tertiary)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter tasks..."
                className="w-full bg-transparent border-none outline-none text-xs"
                style={{ color: 'var(--fg-primary)' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-zinc-200">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none transition-all cursor-pointer hover:border-violet-500/40 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 [&>option]:bg-zinc-900 [&>option]:text-zinc-200"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--fg-primary)',
              }}
            >
              <option value="all">Status: All</option>
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>

            {/* Priority Dropdown */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none transition-all cursor-pointer hover:border-violet-500/40 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 [&>option]:bg-zinc-900 [&>option]:text-zinc-200"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--fg-primary)',
              }}
            >
              <option value="all">Priority: All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="none">None</option>
            </select>

            {/* Assignee Dropdown */}
            <select
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none transition-all cursor-pointer hover:border-violet-500/40 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 max-w-[140px] [&>option]:bg-zinc-900 [&>option]:text-zinc-200"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--fg-primary)',
              }}
            >
              <option value="all">Assignee: All</option>
              <option value="unassigned">Unassigned</option>
              {projectMembers.map(m => (
                <option key={m?.id} value={m?.id}>
                  {m?.name}
                </option>
              ))}
            </select>

            {/* Labels Dropdown */}
            {workspaceLabels.length > 0 && (
              <select
                value={labelFilter}
                onChange={e => setLabelFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none transition-all cursor-pointer hover:border-violet-500/40 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 [&>option]:bg-zinc-900 [&>option]:text-zinc-200"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
              >
                <option value="all">Label: All</option>
                {workspaceLabels.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Controls */}
            <div className="flex items-center gap-1">
              <select
                value={sortField}
                onChange={e => setSortField(e.target.value as SortField)}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none transition-all cursor-pointer hover:border-violet-500/40 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 [&>option]:bg-zinc-900 [&>option]:text-zinc-200"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
              >
                <option value="createdAt">Sort: Created</option>
                <option value="dueDate">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="title">Sort: Title</option>
              </select>
              <button
                onClick={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                title="Toggle Sort Direction"
                className="p-1.5 rounded-lg border text-zinc-400 hover:text-zinc-200 hover:border-violet-500/40 transition-colors"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <ArrowUpDown size={14} />
              </button>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-violet-400 hover:text-violet-300 hover:underline px-1.5 font-medium transition-colors"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Filter Presets Menu */}
          <div className="flex items-center gap-2">
            {filterPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 rounded-lg border text-[11px] font-medium text-zinc-400 hover:text-zinc-200 hover:border-violet-500/40 hover:bg-violet-500/10 transition-all"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                {preset.name}
              </button>
            ))}

            {isSavingPreset ? (
              <form onSubmit={handleSavePreset} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={presetNameInput}
                  onChange={e => setPresetNameInput(e.target.value)}
                  placeholder="Preset name..."
                  autoFocus
                  className="px-2.5 py-1 text-xs rounded-lg border outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                  style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-input)', color: 'var(--fg-primary)' }}
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs text-white rounded-lg font-medium shadow-sm transition-opacity hover:opacity-90"
                  style={{ background: 'var(--accent-primary)' }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsSavingPreset(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-200"
                >
                  <X size={12} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSavingPreset(true)}
                title="Save current filters as preset"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-zinc-400 hover:text-zinc-200 hover:border-violet-500/40 text-xs transition-colors"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <Bookmark size={12} className="text-violet-400" />
                <span>Save Preset</span>
              </button>
            )}
          </div>
        </div>

        {/* View Component Switcher */}
        {currentView === 'kanban' && (
          <KanbanBoard project={project} filteredTasks={filteredTasks} />
        )}

        {currentView === 'list' && (
          <TaskListView tasks={filteredTasks} projectId={project.id} />
        )}

        {currentView === 'calendar' && (
          <TaskCalendarView tasks={filteredTasks} projectId={project.id} />
        )}
      </div>
    </AppShell>
  );
}
