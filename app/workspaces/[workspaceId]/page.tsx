'use client';

import { useState, useMemo, use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import TaskListView from '@/components/tasks/TaskListView';
import TaskCalendarView from '@/components/tasks/TaskCalendarView';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setActiveModal, addToast } from '@/store/uiSlice';
import { updateWorkspace, deleteWorkspace, updateMemberRole, removeMember } from '@/store/workspaceSlice';
import { archiveProject, unarchiveProject, deleteProject } from '@/store/projectSlice';
import { usePermissions } from '@/hooks/usePermissions';
import type { Role, ViewType } from '@/types';
import {
  FolderKanban, Users, Settings, Plus, Search, Archive,
  Trash2, ArrowUpRight, AlertTriangle, X, Clock, Activity,
} from 'lucide-react';

const ICONS = ['🚀', '💼', '💡', '🌟', '🎯', '🔥', '⚡', '🏢', '🛠️', '🦄'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444'];

export default function WorkspacePage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const resolvedParams = use(params);
  const workspaceId = resolvedParams.workspaceId;

  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const workspaces = useAppSelector(state => state.workspace.workspaces);
  const allMembers = useAppSelector(state => state.workspace.members);
  const allProjects = useAppSelector(state => state.project.projects);
  const allTasks = useAppSelector(state => state.task.tasks);
  const users = useAppSelector(state => state.auth.users);

  const { role, can } = usePermissions(workspaceId);
  const workspace = workspaces.find(w => w.id === workspaceId) || workspaces[0];

  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab');
  const activeTab = queryTab || 'projects';

  const [projectSearch, setProjectSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Settings form
  const [name, setName] = useState(workspace?.name || '');
  const [description, setDescription] = useState(workspace?.description || '');
  const [icon, setIcon] = useState(workspace?.icon || '🚀');
  const [color, setColor] = useState(workspace?.color || '#6366f1');
  const [defaultView, setDefaultView] = useState<ViewType>(workspace?.defaultView || 'kanban');
  const [isDeletingWs, setIsDeletingWs] = useState(false);

  // Filtered projects
  const workspaceProjects = useMemo(() => {
    return allProjects.filter(p => {
      if (p.workspaceId !== workspaceId) return false;
      if (!showArchived && p.status === 'archived') return false;
      if (showArchived && p.status !== 'archived') return false;
      if (projectSearch.trim()) {
        return p.name.toLowerCase().includes(projectSearch.toLowerCase().trim());
      }
      return true;
    });
  }, [allProjects, workspaceId, showArchived, projectSearch]);

  // Members list
  const members = useMemo(() => {
    return allMembers.filter(m => m.workspaceId === workspaceId);
  }, [allMembers, workspaceId]);

  if (!workspace) {
    return (
      <AppShell>
        <div className="p-8 text-center text-stone-400">
          Workspace not found.
        </div>
      </AppShell>
    );
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    dispatch(
      updateWorkspace({
        id: workspace.id,
        updates: {
          name: name.trim(),
          description: description.trim() || undefined,
          icon,
          color,
          defaultView,
        },
      })
    );

    dispatch(addToast({ type: 'success', message: 'Workspace updated successfully!' }));
  };

  const handleDeleteWorkspace = () => {
    if (role !== 'owner') {
      dispatch(addToast({ type: 'error', message: 'Only the workspace owner can delete this workspace.' }));
      return;
    }
    dispatch(deleteWorkspace(workspace.id));
    dispatch(addToast({ type: 'info', message: `Workspace "${workspace.name}" deleted.` }));
    router.push('/dashboard');
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Workspace Banner */}
        <div
          className="p-6 rounded-2xl border relative overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0"
                style={{ background: workspace.color }}
              >
                {workspace.icon}
              </span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--fg-primary)' }}>
                    {workspace.name}
                  </h1>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                    style={{
                      background: 'var(--accent-primary-light)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    {role || 'Member'}
                  </span>
                </div>
                {workspace.description && (
                  <p className="text-sm mt-1" style={{ color: 'var(--fg-secondary)' }}>
                    {workspace.description}
                  </p>
                )}
              </div>
            </div>

            {/* Quick stats on banner */}
            <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--fg-secondary)' }}>
              <div>
                <span className="block font-bold text-base" style={{ color: 'var(--fg-primary)' }}>
                  {allProjects.filter(p => p.workspaceId === workspaceId && p.status === 'active').length}
                </span>
                <span>Active Projects</span>
              </div>
              <div className="w-px h-8 bg-stone-200 dark:bg-stone-800" />
              <div>
                <span className="block font-bold text-base" style={{ color: 'var(--fg-primary)' }}>
                  {members.length}
                </span>
                <span>Collaborators</span>
              </div>
              <div className="w-px h-8 bg-stone-200 dark:bg-stone-800" />
              <div>
                <span className="block font-bold text-base" style={{ color: 'var(--fg-primary)' }}>
                  {allTasks.filter(t => t.workspaceId === workspaceId).length}
                </span>
                <span>Tasks</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-5 border-t pt-3 select-none" style={{ borderColor: 'var(--border-primary)' }}>
            <button
              onClick={() => router.push(`/workspaces/${workspaceId}?tab=projects`)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'projects'
                  ? 'text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              style={{
                background: activeTab === 'projects' ? 'var(--accent-primary)' : 'transparent',
              }}
            >
              <FolderKanban size={14} />
              <span>Projects ({allProjects.filter(p => p.workspaceId === workspaceId).length})</span>
            </button>
            <button
              onClick={() => router.push(`/workspaces/${workspaceId}?tab=members`)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'members'
                  ? 'text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              style={{
                background: activeTab === 'members' ? 'var(--accent-primary)' : 'transparent',
              }}
            >
              <Users size={14} />
              <span>Members ({members.length})</span>
            </button>
            {can('workspace:edit') && (
              <button
                onClick={() => router.push(`/workspaces/${workspaceId}?tab=settings`)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'settings'
                    ? 'text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={{
                  background: activeTab === 'settings' ? 'var(--accent-primary)' : 'transparent',
                }}
              >
                <Settings size={14} />
                <span>Workspace Settings</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm flex-1"
                  style={{
                    background: 'var(--bg-elevated)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <Search size={14} style={{ color: 'var(--fg-tertiary)' }} />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={e => setProjectSearch(e.target.value)}
                    placeholder="Search projects in workspace..."
                    className="w-full bg-transparent border-none outline-none text-xs"
                    style={{ color: 'var(--fg-primary)' }}
                  />
                  {projectSearch && (
                    <button onClick={() => setProjectSearch('')}>
                      <X size={13} className="text-zinc-400" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                    showArchived
                      ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary-light)]'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  style={{ borderColor: showArchived ? 'var(--accent-primary)' : 'var(--border-primary)' }}
                >
                  <Archive size={13} />
                  <span>Archived</span>
                </button>
              </div>

              {can('project:create') && (
                <button
                  onClick={() => dispatch(setActiveModal('createProject'))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
                  style={{ background: 'var(--accent-primary)' }}
                >
                  <Plus size={14} />
                  <span>New Project</span>
                </button>
              )}
            </div>

            {/* Project Cards Grid */}
            {workspaceProjects.length === 0 ? (
              <div
                className="p-12 rounded-xl border text-center"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
              >
                <FolderKanban size={32} className="mx-auto mb-2 text-stone-400 opacity-60" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--fg-primary)' }}>
                  {showArchived ? 'No archived projects' : 'No projects match your search'}
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Try adjusting your filters or create a new project.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaceProjects.map(proj => {
                  const projTasks = allTasks.filter(t => t.projectId === proj.id);
                  const doneCount = projTasks.filter(t => t.status === 'done').length;
                  const progress = projTasks.length > 0 ? Math.round((doneCount / projTasks.length) * 100) : 0;
                  const projMembers = proj.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean);

                  return (
                    <div
                      key={proj.id}
                      className="p-5 rounded-xl border transition-all hover:shadow-md flex flex-col justify-between"
                      style={{
                        background: 'var(--bg-elevated)',
                        borderColor: 'var(--border-primary)',
                      }}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <Link
                            href={`/workspaces/${workspaceId}/projects/${proj.id}`}
                            className="flex items-center gap-3 min-w-0 flex-1 group"
                          >
                            <span
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
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
                                {proj.template?.replace('-', ' ') || 'Kanban Project'}
                              </p>
                            </div>
                          </Link>

                          {/* Action Menu */}
                          <div className="flex items-center gap-1">
                            {can('project:archive') && (
                              <button
                                onClick={() => {
                                  if (proj.status === 'active') {
                                    dispatch(archiveProject(proj.id));
                                    dispatch(addToast({ type: 'info', message: 'Project archived' }));
                                  } else {
                                    dispatch(unarchiveProject(proj.id));
                                    dispatch(addToast({ type: 'success', message: 'Project restored' }));
                                  }
                                }}
                                title={proj.status === 'active' ? 'Archive Project' : 'Restore Project'}
                                className="p-1 rounded text-zinc-400 hover:text-zinc-200"
                              >
                                <Archive size={13} />
                              </button>
                            )}
                            {can('project:delete') && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete project "${proj.name}"?`)) {
                                    dispatch(deleteProject(proj.id));
                                    dispatch(addToast({ type: 'info', message: 'Project deleted' }));
                                  }
                                }}
                                title="Delete Project"
                                className="p-1 rounded text-zinc-400 hover:text-red-500"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {proj.description && (
                          <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                            {proj.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 pt-1">
                        {/* Progress */}
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span style={{ color: 'var(--fg-tertiary)' }}>Progress</span>
                            <span className="font-semibold" style={{ color: 'var(--fg-secondary)' }}>
                              {progress}% ({doneCount}/{projTasks.length} tasks)
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

                        {/* Members & Link */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex -space-x-1 overflow-hidden">
                            {projMembers.slice(0, 3).map(m => (
                              <span
                                key={m?.id}
                                title={m?.name}
                                className="w-5 h-5 rounded-full ring-1 ring-zinc-900 flex items-center justify-center text-[9px] text-white font-bold"
                                style={{ background: m?.avatarColor || 'var(--accent-primary)' }}
                              >
                                {m?.name?.charAt(0)}
                              </span>
                            ))}
                          </div>
                          <Link
                            href={`/workspaces/${workspaceId}/projects/${proj.id}`}
                            className="text-xs font-semibold flex items-center gap-1 hover:underline"
                            style={{ color: 'var(--accent-primary)' }}
                          >
                            <span>Open Board</span>
                            <ArrowUpRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Members */}
        {activeTab === 'members' && (
          <div
            className="rounded-xl border overflow-hidden"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div
              className="flex items-center justify-between p-4"
              style={{ borderBottom: '1px solid var(--border-primary)' }}
            >
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--fg-primary)' }}>
                  Workspace Collaborators
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Manage members and their roles across this workspace.
                </p>
              </div>

              {can('workspace:invite') && (
                <button
                  onClick={() => dispatch(setActiveModal('inviteMember'))}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm"
                  style={{ background: 'var(--accent-primary)' }}
                >
                  <Plus size={14} />
                  <span>Invite Member</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {members.map(m => {
                const u = users.find(user => user.id === m.userId);
                const isCurrentUser = currentUser?.id === m.userId;
                const isOwner = m.role === 'owner';

                return (
                  <div key={m.id} className="flex items-center justify-between p-4 text-xs">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm text-white font-bold flex-shrink-0"
                        style={{ background: u?.avatarColor || '#6366f1' }}
                      >
                        {u?.name?.charAt(0) || 'U'}
                      </span>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--fg-primary)' }}>
                          {u?.name || 'Unknown'}{' '}
                          {isCurrentUser && <span className="text-stone-400 font-normal">(You)</span>}
                        </p>
                        <p className="text-[11px] text-stone-400">{u?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Role selector or badge */}
                      {can('member:change_role') && !isOwner ? (
                        <select
                          value={m.role}
                          onChange={e => {
                            dispatch(updateMemberRole({ memberId: m.id, role: e.target.value as Role }));
                            dispatch(addToast({ type: 'info', message: `Updated role to ${e.target.value}` }));
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium border outline-none bg-transparent"
                          style={{ borderColor: 'var(--border-primary)', color: 'var(--fg-primary)' }}
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{
                            background: isOwner ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
                            color: isOwner ? 'var(--accent-primary)' : 'var(--fg-secondary)',
                          }}
                        >
                          {m.role}
                        </span>
                      )}

                      {/* Remove member button */}
                      {can('member:remove') && !isOwner && !isCurrentUser && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${u?.name} from this workspace?`)) {
                              dispatch(removeMember(m.id));
                              dispatch(addToast({ type: 'info', message: 'Member removed' }));
                            }
                          }}
                          className="p-1 rounded text-stone-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: My Tasks (List View) */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            <TaskListView 
              tasks={allTasks.filter(t => t.workspaceId === workspaceId && (t.assigneeId === currentUser?.id || !t.assigneeId))} 
            />
          </div>
        )}

        {/* Tab 5: Calendar */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <TaskCalendarView 
              tasks={allTasks.filter(t => t.workspaceId === workspaceId)} 
            />
          </div>
        )}

        {/* Tab 6: Timeline */}
        {activeTab === 'timeline' && (
          <div className="p-12 text-center border rounded-xl" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
             <Clock size={32} className="mx-auto mb-3 text-stone-400 opacity-60" />
             <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--fg-primary)' }}>Timeline View Coming Soon</h3>
             <p className="text-xs text-stone-400 max-w-sm mx-auto">We are working on a dedicated timeline view. Please use the Calendar or List views to manage your schedule in the meantime.</p>
          </div>
        )}

        {/* Tab 7: Activity */}
        {activeTab === 'activity' && (
          <div className="p-12 text-center border rounded-xl" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
             <Activity size={32} className="mx-auto mb-3 text-stone-400 opacity-60" />
             <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--fg-primary)' }}>Activity Feed</h3>
             <p className="text-xs text-stone-400 max-w-sm mx-auto">Workspace-wide activity tracking is currently being rolled out. Check back soon for detailed history.</p>
          </div>
        )}

        {/* Tab 3: Workspace Settings */}
        {activeTab === 'settings' && can('workspace:edit') && (
          <div className="space-y-6 max-w-2xl">
            <div
              className="p-6 rounded-xl border"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
            >
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--fg-primary)' }}>
                Workspace Details
              </h2>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 transition-all"
                    style={{
                      background: 'var(--bg-input)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--fg-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 transition-all"
                    style={{
                      background: 'var(--bg-input)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--fg-primary)',
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                      Icon
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border max-h-24 overflow-y-auto" style={{ borderColor: 'var(--border-primary)' }}>
                      {ICONS.map(i => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setIcon(i)}
                          className={`w-7 h-7 rounded text-sm ${icon === i ? 'scale-125 bg-stone-200 dark:bg-stone-700' : ''}`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                      Color
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border max-h-24 overflow-y-auto" style={{ borderColor: 'var(--border-primary)' }}>
                      {COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-[var(--bg-elevated)] scale-110' : 'hover:scale-110'}`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                    Default Project View
                  </label>
                  <select
                    value={defaultView}
                    onChange={e => setDefaultView(e.target.value as ViewType)}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 transition-all"
                    style={{
                      background: 'var(--bg-input)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--fg-primary)',
                    }}
                  >
                    <option value="kanban">Kanban Board</option>
                    <option value="list">List View</option>
                    <option value="calendar">Calendar View</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
                    style={{ background: 'var(--accent-primary)' }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone: Delete Workspace */}
            {role === 'owner' && (
              <div className="p-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 space-y-3">
                <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Danger Zone
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Deleting this workspace will remove all associated projects, tasks, comments, and members permanently.
                </p>

                {isDeletingWs ? (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleDeleteWorkspace}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700"
                    >
                      Yes, permanently delete workspace
                    </button>
                    <button
                      onClick={() => setIsDeletingWs(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsDeletingWs(true)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-red-600 border border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    Delete this workspace
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
