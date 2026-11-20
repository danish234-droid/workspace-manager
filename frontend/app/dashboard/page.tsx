'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setActiveModal } from '@/store/uiSlice';
import { setActiveWorkspace } from '@/store/workspaceSlice';
import { formatDate, formatRelativeTime, isOverdue, isToday } from '@/utils/date';
import {
  FolderKanban, CheckSquare, Clock, AlertTriangle, CheckCircle2,
  Plus, UserPlus, ArrowUpRight, TrendingUp, Calendar, ArrowRight,
  PieChart, ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const workspaces = useAppSelector(state => state.workspace.workspaces);
  const activeWorkspaceId = useAppSelector(state => state.workspace.activeWorkspaceId);
  const allProjects = useAppSelector(state => state.project.projects);
  const allTasks = useAppSelector(state => state.task.tasks);
  const allActivities = useAppSelector(state => state.activity.activities);
  const users = useAppSelector(state => state.auth.users);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const projects = useMemo(
    () => allProjects.filter(p => p.workspaceId === activeWorkspace?.id && p.status === 'active'),
    [allProjects, activeWorkspace?.id]
  );

  const tasks = useMemo(
    () => allTasks.filter(t => t.workspaceId === activeWorkspace?.id && !t.parentTaskId),
    [allTasks, activeWorkspace?.id]
  );

  const activities = useMemo(
    () => allActivities.filter(a => a.workspaceId === activeWorkspace?.id).slice(0, 8),
    [allActivities, activeWorkspace?.id]
  );

  // Statistics
  const stats = useMemo(() => {
    const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id || !t.assigneeId);
    const total = tasks.length;
    const myTotal = myTasks.length;
    const myDueToday = myTasks.filter(t => t.dueDate && isToday(t.dueDate) && t.status !== 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const done = tasks.filter(t => t.status === 'done').length;
    const overdue = tasks.filter(t => t.dueDate && isOverdue(t.dueDate) && t.status !== 'done').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    const capacity = total > 0 ? Math.min(95, Math.max(45, Math.round((inProgress / (total || 1)) * 100 + 40))) : 68;

    return { total, myTotal, myDueToday, inProgress, done, overdue, completionRate, capacity };
  }, [tasks, currentUser?.id]);

  // Upcoming deadlines (next tasks sorted by due date)
  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter(t => t.dueDate && t.status !== 'done')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [tasks]);

  // Handle hash scrolling for Workload and Reports
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header / Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--fg-primary)' }}>
              Good morning, {currentUser?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--fg-secondary)' }}>
              Here&apos;s what&apos;s happening in your workspace today.
            </p>
          </div>

          {/* Compact Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => dispatch(setActiveModal('createTask'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-all shadow-sm hover:brightness-110 active:scale-95"
              style={{ background: 'var(--accent-primary)' }}
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>
            <button
              onClick={() => dispatch(setActiveModal('createProject'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all active:scale-95"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border-primary)',
                color: 'var(--fg-primary)',
              }}
              onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
              onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)')}
            >
              <FolderKanban size={14} />
              <span>New Project</span>
            </button>
            <button
              onClick={() => dispatch(setActiveModal('inviteMember'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all active:scale-95"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border-primary)',
                color: 'var(--fg-primary)',
              }}
              onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
              onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)')}
            >
              <UserPlus size={14} />
              <span>Invite</span>
            </button>
          </div>
        </div>

        {/* Workspace Quick Switcher Pills */}
        {workspaces.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider mr-1" style={{ color: 'var(--fg-tertiary)' }}>
              Workspace:
            </span>
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => dispatch(setActiveWorkspace(ws.id))}
                className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium border transition-all"
                style={{
                  background: ws.id === activeWorkspace?.id ? 'var(--accent-primary-light)' : 'var(--bg-elevated)',
                  borderColor: ws.id === activeWorkspace?.id ? 'var(--accent-primary)' : 'var(--border-primary)',
                  color: ws.id === activeWorkspace?.id ? 'var(--accent-primary)' : 'var(--fg-secondary)',
                }}
              >
                <span className="text-xs">{ws.icon}</span>
                <span>{ws.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* 5 Statistics KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 1: My Tasks */}
          <Link
            href={`/workspaces/${activeWorkspace?.id}?tab=list`}
            className="p-3.5 rounded-lg border transition-all group hover:border-[var(--accent-primary)]"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg-tertiary)' }}>
                My Tasks
              </span>
              <CheckSquare size={14} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div className="text-2xl font-bold flex items-baseline justify-between" style={{ color: 'var(--fg-primary)' }}>
              <span>{stats.myTotal}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--fg-tertiary)' }} />
            </div>
            <div className="text-[11px] mt-1 truncate" style={{ color: 'var(--fg-secondary)' }}>
              {stats.myDueToday > 0 ? `${stats.myDueToday} due today` : 'Up to date'}
            </div>
          </Link>

          {/* Card 2: In Progress */}
          <div
            className="p-3.5 rounded-lg border transition-all"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg-tertiary)' }}>
                In Progress
              </span>
              <Clock size={14} className="text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-500">
              {stats.inProgress}
            </div>
            <div className="text-[11px] mt-1 truncate" style={{ color: 'var(--fg-secondary)' }}>
              Across {projects.length} project{projects.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Card 3: Completed */}
          <div
            className="p-3.5 rounded-lg border transition-all"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg-tertiary)' }}>
                Completed
              </span>
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-500">
              {stats.done}
            </div>
            <div className="text-[11px] mt-1 truncate font-medium text-emerald-600 dark:text-emerald-400">
              {stats.completionRate}% completion rate
            </div>
          </div>

          {/* Card 4: Overdue */}
          <div
            className="p-3.5 rounded-lg border transition-all"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg-tertiary)' }}>
                Overdue
              </span>
              <AlertTriangle size={14} className="text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-500">
              {stats.overdue}
            </div>
            <div className="text-[11px] mt-1 truncate text-red-500 font-medium">
              {stats.overdue > 0 ? 'Requires attention' : 'No overdue tasks'}
            </div>
          </div>

          {/* Card 5: Team Workload */}
          <div
            id="workload"
            className="p-3.5 rounded-lg border transition-all col-span-2 lg:col-span-1"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg-tertiary)' }}>
                Team Workload
              </span>
              <PieChart size={14} className="text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {stats.capacity}%
            </div>
            <div className="text-[11px] mt-1 truncate" style={{ color: 'var(--fg-secondary)' }}>
              Average capacity
            </div>
          </div>
        </div>

        {/* Main Grid: Projects, Deadlines & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Projects Overview */}
          <div id="reports" className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--fg-primary)' }}>
                <FolderKanban size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>Projects ({projects.length})</span>
              </h2>
              <Link
                href={`/workspaces/${activeWorkspace?.id}`}
                className="text-xs font-medium hover:underline flex items-center gap-1"
                style={{ color: 'var(--accent-primary)' }}
              >
                <span>View all</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {projects.length === 0 ? (
              <div
                className="p-6 rounded-lg border text-center"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-2">
                  <FolderKanban size={20} />
                </div>
                <h3 className="text-xs font-semibold mb-1" style={{ color: 'var(--fg-primary)' }}>
                  All caught up
                </h3>
                <p className="text-xs text-zinc-400 mb-3 max-w-xs mx-auto">
                  There are no active projects matching your current workspace filter.
                </p>
                <button
                  onClick={() => dispatch(setActiveModal('createProject'))}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
                  style={{ background: 'var(--accent-primary)' }}
                >
                  Create Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map(proj => {
                  const projTasks = tasks.filter(t => t.projectId === proj.id);
                  const doneTasks = projTasks.filter(t => t.status === 'done').length;
                  const progress = projTasks.length > 0 ? Math.round((doneTasks / projTasks.length) * 100) : 0;
                  const members = proj.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean);

                  return (
                    <Link
                      key={proj.id}
                      href={`/workspaces/${activeWorkspace?.id}/projects/${proj.id}`}
                      className="p-4 rounded-lg border transition-all hover:border-[var(--accent-primary)] group flex flex-col justify-between"
                      style={{
                        background: 'var(--bg-elevated)',
                        borderColor: 'var(--border-primary)',
                      }}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-8 h-8 rounded-md flex items-center justify-center text-sm flex-shrink-0"
                              style={{ background: proj.color ? `${proj.color}20` : 'var(--bg-tertiary)' }}
                            >
                              {proj.icon || '📁'}
                            </span>
                            <div className="min-w-0">
                              <h3
                                className="font-semibold text-xs truncate group-hover:text-[var(--accent-primary)] transition-colors"
                                style={{ color: 'var(--fg-primary)' }}
                              >
                                {proj.name}
                              </h3>
                              <p className="text-[11px] text-zinc-400 capitalize">
                                {proj.template?.replace('-', ' ') || 'General Project'}
                              </p>
                            </div>
                          </div>
                          <ArrowUpRight
                            size={14}
                            className="text-zinc-500 group-hover:text-[var(--accent-primary)] transition-colors flex-shrink-0"
                          />
                        </div>

                        {proj.description && (
                          <p className="text-[11px] text-zinc-400 line-clamp-2 mb-3">
                            {proj.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 pt-1">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span style={{ color: 'var(--fg-tertiary)' }}>Progress</span>
                            <span className="font-semibold" style={{ color: 'var(--fg-secondary)' }}>
                              {progress}% ({doneTasks}/{projTasks.length})
                            </span>
                          </div>
                          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${progress}%`,
                                background: proj.color || 'var(--accent-primary)',
                              }}
                            />
                          </div>
                        </div>

                        {/* Team Avatars & Timestamp */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex -space-x-1 overflow-hidden">
                            {members.slice(0, 3).map(m => (
                              <span
                                key={m?.id}
                                title={m?.name}
                                className="w-5 h-5 rounded-full ring-1 ring-zinc-900 flex items-center justify-center text-[9px] text-white font-bold"
                                style={{ background: m?.avatarColor || 'var(--accent-primary)' }}
                              >
                                {m?.name?.charAt(0)}
                              </span>
                            ))}
                            {members.length > 3 && (
                              <span className="w-5 h-5 rounded-full bg-zinc-800 text-[9px] font-bold flex items-center justify-center text-zinc-300 ring-1 ring-zinc-900">
                                +{members.length - 3}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px]" style={{ color: 'var(--fg-tertiary)' }}>
                            Updated {formatRelativeTime(proj.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Col: Upcoming Deadlines & Activity Timeline */}
          <div className="space-y-4">
            {/* Upcoming Deadlines */}
            <div
              className="p-4 rounded-lg border"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--fg-tertiary)' }}>
                  <Calendar size={14} className="text-amber-500" />
                  <span>Upcoming Deadlines</span>
                </h2>
                <span className="text-[10px] font-mono text-zinc-400">{upcomingDeadlines.length}</span>
              </div>

              {upcomingDeadlines.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-400">
                  <CheckCircle2 size={20} className="mx-auto mb-1 text-emerald-500 opacity-80" />
                  <p className="text-[11px]">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {upcomingDeadlines.map(t => {
                    const overdue = isOverdue(t.dueDate!);
                    const dueToday = isToday(t.dueDate!);

                    return (
                      <button
                        key={t.id}
                        onClick={() => dispatch(setActiveModal(`task:${t.id}`))}
                        className="w-full text-left p-2 rounded-md border text-xs transition-colors hover:bg-[var(--bg-hover)] flex items-center justify-between gap-2"
                        style={{ borderColor: 'var(--border-primary)' }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs truncate" style={{ color: 'var(--fg-primary)' }}>
                            {t.title}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {overdue ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold priority-bg-urgent">
                              High
                            </span>
                          ) : dueToday ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold priority-bg-medium">
                              Today
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {formatDate(t.dueDate!)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Activity Timeline */}
            <div
              className="p-4 rounded-lg border"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--fg-tertiary)' }}>
                  <TrendingUp size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span>Activity</span>
                </h2>
              </div>

              {activities.length === 0 ? (
                <p className="text-xs text-zinc-400 py-2 text-center">No recent activity.</p>
              ) : (
                <div className="space-y-2.5">
                  {activities.map(act => {
                    const actor = users.find(u => u.id === act.actorId);
                    return (
                      <div key={act.id} className="flex items-start gap-2.5 text-xs">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0 mt-0.5"
                          style={{ background: actor?.avatarColor || 'var(--accent-primary)' }}
                        >
                          {actor?.name?.charAt(0) || 'U'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] leading-snug" style={{ color: 'var(--fg-primary)' }}>
                            <span className="font-semibold">{actor?.name?.split(' ')[0] || 'User'}</span>{' '}
                            <span style={{ color: 'var(--fg-secondary)' }}>
                              {act.action.replace(/_/g, ' ')}
                            </span>
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            {formatRelativeTime(act.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
