'use client';

import { useState, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  updateProfile, switchUser, logout,
} from '@/store/authSlice';
import {
  setTheme, toggleCompactMode, updateNotificationPreferences, resetSettings, loadSettings,
} from '@/store/settingsSlice';
import { resetTasks, loadTasks } from '@/store/taskSlice';
import { resetProjects, loadProjects } from '@/store/projectSlice';
import { resetWorkspaces, loadWorkspaces } from '@/store/workspaceSlice';
import { resetComments, loadComments } from '@/store/commentSlice';
import { resetActivities, loadActivities } from '@/store/activitySlice';
import { resetNotifications, loadNotifications } from '@/store/notificationSlice';
import { addToast } from '@/store/uiSlice';
import type { ExportData } from '@/types';
import {
  User, Palette, Bell, Database, Download, Upload, RefreshCw,
  Sun, Moon, Laptop, LogOut, CheckCircle2, Shield, AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const allUsers = useAppSelector(state => state.auth.users);
  const settings = useAppSelector(state => state.settings.settings);
  const fullState = useAppSelector(state => state);

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'data'>('profile');

  // Profile fields
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const avatarColor = currentUser?.avatarColor || '#6366f1';

  // Danger reset confirmation
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    dispatch(
      updateProfile({
        name: name.trim(),
        email: email.trim(),
      })
    );
    dispatch(addToast({ type: 'success', message: 'Profile updated successfully!' }));
  };

  const handleExportData = () => {
    const exportPayload: ExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      workspace: fullState.workspace.workspaces[0],
      members: fullState.workspace.members,
      users: fullState.auth.users,
      projects: fullState.project.projects,
      tasks: fullState.task.tasks,
      comments: fullState.comment.comments,
      activities: fullState.activity.activities,
      labels: fullState.settings.labels,
      filterPresets: fullState.settings.filterPresets,
      settings: fullState.settings.settings,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `workspace-manager-export-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    dispatch(addToast({ type: 'success', message: 'Data exported successfully as JSON!' }));
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as ExportData;

        if (parsed.tasks) dispatch(loadTasks(parsed.tasks));
        if (parsed.projects) dispatch(loadProjects(parsed.projects));
        if (parsed.workspace && parsed.members) {
          dispatch(loadWorkspaces({ workspaces: [parsed.workspace], members: parsed.members }));
        }
        if (parsed.comments) dispatch(loadComments(parsed.comments));
        if (parsed.activities) dispatch(loadActivities(parsed.activities));
        if (parsed.notifications) dispatch(loadNotifications(parsed.notifications));
        if (parsed.settings) {
          dispatch(
            loadSettings({
              settings: parsed.settings,
              labels: parsed.labels || [],
              filterPresets: parsed.filterPresets || [],
            })
          );
        }

        dispatch(addToast({ type: 'success', message: 'Backup restored successfully from JSON!' }));
      } catch (err) {
        console.error('Import error:', err);
        dispatch(addToast({ type: 'error', message: 'Invalid JSON file or corrupt schema.' }));
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDemo = () => {
    dispatch(resetTasks());
    dispatch(resetProjects());
    dispatch(resetWorkspaces());
    dispatch(resetComments());
    dispatch(resetActivities());
    dispatch(resetNotifications());
    dispatch(resetSettings());
    setConfirmReset(false);

    dispatch(addToast({ type: 'info', message: 'Application restored to fresh demo data!' }));
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--fg-primary)' }}>
            Settings & Preferences
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-secondary)' }}>
            Manage your personal profile, workspace theme, notifications, and application data.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b pb-2 select-none" style={{ borderColor: 'var(--border-primary)' }}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            style={{
              background: activeTab === 'profile' ? 'var(--accent-primary)' : 'transparent',
            }}
          >
            <User size={14} />
            <span>Profile & Account</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'preferences'
                ? 'text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            style={{
              background: activeTab === 'preferences' ? 'var(--accent-primary)' : 'transparent',
            }}
          >
            <Palette size={14} />
            <span>Theme & Display</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            style={{
              background: activeTab === 'notifications' ? 'var(--accent-primary)' : 'transparent',
            }}
          >
            <Bell size={14} />
            <span>Notification Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'data'
                ? 'text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            style={{
              background: activeTab === 'data' ? 'var(--accent-primary)' : 'transparent',
            }}
          >
            <Database size={14} />
            <span>Data & Portability</span>
          </button>
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div
              className="p-6 rounded-2xl border"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
            >
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--fg-primary)' }}>
                User Profile
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div className="flex items-center gap-4 mb-4">
                  <span
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl text-white font-bold shadow-sm"
                    style={{ background: currentUser?.avatarColor || avatarColor }}
                  >
                    {name.charAt(0) || 'U'}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--fg-primary)' }}>
                      {name || 'Your Name'}
                    </h3>
                    <p className="text-xs text-stone-400">{email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                    Display Name
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 transition-all"
                    style={{
                      background: 'var(--bg-input)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--fg-primary)',
                    }}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
                    style={{ background: 'var(--accent-primary)' }}
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </div>

            {/* Switch User / Role Testing Persona */}
            <div
              className="p-6 rounded-2xl border space-y-4"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
            >
              <div className="flex items-center gap-2">
                <Shield size={18} style={{ color: 'var(--accent-primary)' }} />
                <h2 className="text-base font-bold" style={{ color: 'var(--fg-primary)' }}>
                  Demo Account Switcher
                </h2>
              </div>
              <p className="text-xs text-stone-400">
                Instantly switch between team members to experience different workspace roles (Owner, Admin, Member, Viewer).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allUsers.map(u => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        dispatch(switchUser(u.id));
                        dispatch(addToast({ type: 'info', message: `Logged in as ${u.name}` }));
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                        isCurrent
                          ? 'bg-violet-50/50 dark:bg-violet-950/40 ring-1'
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                      style={{ borderColor: isCurrent ? 'var(--accent-primary)' : 'var(--border-primary)', ...(isCurrent ? { '--tw-ring-color': 'var(--accent-primary)' } : {}) }}
                    >
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0"
                        style={{ background: u.avatarColor }}
                      >
                        {u.name.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs truncate" style={{ color: 'var(--fg-primary)' }}>
                          {u.name}
                        </p>
                        <p className="text-[11px] text-stone-400 truncate">{u.email}</p>
                      </div>
                      {isCurrent && <CheckCircle2 size={16} style={{ color: 'var(--accent-primary)' }} />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => dispatch(logout())}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <LogOut size={15} />
                  <span>Log out of session</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Preferences */}
        {activeTab === 'preferences' && (
          <div
            className="p-6 rounded-2xl border space-y-6"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
          >
            <div>
              <h2 className="text-base font-bold mb-1" style={{ color: 'var(--fg-primary)' }}>
                Theme Appearance
              </h2>
              <p className="text-xs text-stone-400 mb-4">
                Choose your preferred interface theme.
              </p>

              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Laptop },
                ].map(th => {
                  const Icon = th.icon;
                  const isSelected = settings.theme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => dispatch(setTheme(th.id as 'light' | 'dark' | 'system'))}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center font-medium transition-all hover:scale-[1.02] ${
                        isSelected
                          ? 'bg-violet-50/50 dark:bg-violet-950/40 ring-1'
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                      style={{ borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-primary)', color: isSelected ? 'var(--accent-primary)' : undefined, ...(isSelected ? { '--tw-ring-color': 'var(--accent-primary)' } : {}) }}
                    >
                      <Icon size={20} />
                      <span className="text-xs">{th.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-6" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-base font-bold mb-1" style={{ color: 'var(--fg-primary)' }}>
                Display Density
              </h2>
              <p className="text-xs text-stone-400 mb-4">
                Toggle compact mode for dense information views.
              </p>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.compactMode}
                  onChange={() => dispatch(toggleCompactMode())}
                  className="rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-medium" style={{ color: 'var(--fg-primary)' }}>
                  Enable Compact Card Mode
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Notifications Preferences */}
        {activeTab === 'notifications' && (
          <div
            className="p-6 rounded-2xl border space-y-5"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
          >
            <div>
              <h2 className="text-base font-bold mb-1" style={{ color: 'var(--fg-primary)' }}>
                Notification Preferences
              </h2>
              <p className="text-xs text-stone-400 mb-4">
                Select which events trigger in-app notifications and toasts.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'taskAssignments',
                  label: 'Task Assignments',
                  desc: 'Notify me when someone assigns me to a task.',
                  checked: settings.notificationPreferences.taskAssignments,
                },
                {
                  id: 'mentions',
                  label: 'Team Mentions',
                  desc: 'Notify me when I am mentioned using @name in a comment.',
                  checked: settings.notificationPreferences.mentions,
                },
                {
                  id: 'dueDateApproaching',
                  label: 'Upcoming Due Dates',
                  desc: 'Alert me when tasks assigned to me are due today or overdue.',
                  checked: settings.notificationPreferences.dueDateApproaching,
                },
                {
                  id: 'commentAdded',
                  label: 'Comments on My Tasks',
                  desc: 'Notify me when someone leaves a comment on my tasks.',
                  checked: settings.notificationPreferences.commentAdded,
                },
              ].map(item => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={e =>
                      dispatch(
                        updateNotificationPreferences({
                          [item.id]: e.target.checked,
                        })
                      )
                    }
                    className="mt-0.5 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-semibold" style={{ color: 'var(--fg-primary)' }}>
                      {item.label}
                    </span>
                    <span className="text-[11px] text-stone-400">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Data Management & Portability */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* JSON Export & Import */}
            <div
              className="p-6 rounded-2xl border space-y-4"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
            >
              <div>
                <h2 className="text-base font-bold mb-1" style={{ color: 'var(--fg-primary)' }}>
                  Export & Import Data
                </h2>
                <p className="text-xs text-stone-400">
                  Export your entire workspace including all projects, tasks, comments, and labels to a JSON file, or restore from a previous backup.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
                  style={{ background: 'var(--accent-primary)' }}
                >
                  <Download size={15} />
                  <span>Export JSON Backup</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                  style={{ borderColor: 'var(--border-primary)', color: 'var(--fg-primary)' }}
                >
                  <Upload size={15} />
                  <span>Import JSON Backup</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </div>
            </div>

            {/* Danger Zone: Reset Data */}
            <div className="p-6 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 space-y-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle size={18} />
                <h2 className="text-base font-bold">Reset Demo Data</h2>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Reset all workspaces, projects, tasks, comments, and activities back to the initial demo seed data. This will overwrite any custom tasks you created.
              </p>

              {confirmReset ? (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleResetToDemo}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm"
                  >
                    Confirm: Reset to Fresh Demo Data
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <RefreshCw size={14} />
                  <span>Reset to Demo State</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
