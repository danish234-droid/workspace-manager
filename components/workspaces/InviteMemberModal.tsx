'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setActiveModal, addToast } from '@/store/uiSlice';
import { inviteMember } from '@/store/workspaceSlice';
import { addActivity } from '@/store/activitySlice';
import { addNotification } from '@/store/notificationSlice';
import type { Role } from '@/types';
import { X, UserPlus, AlertCircle, Shield } from 'lucide-react';

export default function InviteMemberModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.activeModal === 'inviteMember');
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const activeWorkspaceId = useAppSelector(state => state.workspace.activeWorkspaceId);
  const workspaces = useAppSelector(state => state.workspace.workspaces);
  const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const members = useAppSelector(state => state.workspace.members.filter(m => m.workspaceId === activeWorkspaceId));
  const users = useAppSelector(state => state.auth.users);

  // Available users not yet in this workspace
  const memberUserIds = new Set(members.map(m => m.userId));
  const availableUsers = users.filter(u => !memberUserIds.has(u.id));

  const [selectedUserId, setSelectedUserId] = useState(availableUsers[0]?.id || '');
  const [role, setRole] = useState<Role>('member');
  const [customEmail, setCustomEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspaceId || !currentUser) return;

    let targetUserId = selectedUserId;
    let targetUserName = '';

    if (customEmail.trim()) {
      // Check if matches an existing user
      const existing = users.find(u => u.email.toLowerCase() === customEmail.trim().toLowerCase());
      if (existing) {
        if (memberUserIds.has(existing.id)) {
          setError('User is already a member of this workspace');
          return;
        }
        targetUserId = existing.id;
        targetUserName = existing.name;
      } else {
        // Invite message for external user
        dispatch(
          addToast({
            type: 'success',
            message: `Invitation email simulated for ${customEmail.trim()}!`,
          })
        );
        dispatch(setActiveModal(null));
        return;
      }
    } else {
      const u = users.find(user => user.id === selectedUserId);
      if (!u) {
        setError('Please select a user to invite');
        return;
      }
      targetUserName = u.name;
    }

    dispatch(
      inviteMember({
        workspaceId: activeWorkspaceId,
        userId: targetUserId,
        role,
      })
    );

    dispatch(
      addActivity({
        workspaceId: activeWorkspaceId,
        actorId: currentUser.id,
        action: 'member_added',
        metadata: { userId: targetUserId, role },
      })
    );

    dispatch(
      addNotification({
        userId: targetUserId,
        type: 'member_added',
        title: 'Workspace Invitation',
        message: `${currentUser.name} added you to "${currentWorkspace?.name || 'Workspace'}" as ${role}`,
        workspaceId: activeWorkspaceId,
      })
    );

    dispatch(
      addToast({
        type: 'success',
        message: `Added ${targetUserName} as ${role}!`,
      })
    );

    dispatch(setActiveModal(null));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
      onClick={() => dispatch(setActiveModal(null))}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border animate-scale-in"
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
          <div className="flex items-center gap-2">
            <UserPlus size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--fg-primary)' }}>
              Invite Team Member
            </h2>
          </div>
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

          {/* Select from existing available team users */}
          {availableUsers.length > 0 && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                Select Teammate
              </label>
              <select
                value={selectedUserId}
                onChange={e => {
                  setSelectedUserId(e.target.value);
                  setCustomEmail('');
                  setError('');
                }}
                className="w-full px-3 py-2 rounded-lg text-sm transition-all outline-none cursor-pointer focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 [&>option]:bg-zinc-900 [&>option]:text-zinc-200"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
              >
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Or invite by email */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
              Or invite by email
            </label>
            <input
              type="email"
              value={customEmail}
              onChange={e => {
                setCustomEmail(e.target.value);
                setError('');
              }}
              placeholder="colleague@company.com"
              className="w-full px-3 py-2 rounded-lg text-sm transition-all outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-primary)',
                color: 'var(--fg-primary)',
              }}
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--fg-secondary)' }}>
              <Shield size={13} />
              Role & Permissions
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'member', 'viewer'] as Role[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-2.5 rounded-xl border text-center capitalize text-xs font-semibold transition-all ${
                    role === r
                      ? 'border-violet-500/70 bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/30 shadow-sm'
                      : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 bg-zinc-900/40'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-[11px] mt-2" style={{ color: 'var(--fg-tertiary)' }}>
              {role === 'admin' && 'Can manage projects, workspace settings, and members.'}
              {role === 'member' && 'Can create and edit tasks, comments, and projects.'}
              {role === 'viewer' && 'Read-only access. Cannot create or edit tasks.'}
            </p>
          </div>

          <div
            className="flex items-center justify-end gap-3 pt-3 border-t"
            style={{ borderColor: 'var(--border-primary)' }}
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
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
