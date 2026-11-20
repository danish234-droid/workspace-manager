'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setActiveModal, addToast } from '@/store/uiSlice';
import { createWorkspace } from '@/store/workspaceSlice';
import { X, AlertCircle } from 'lucide-react';

const ICONS = ['🚀', '💼', '💡', '🌟', '🎯', '🔥', '⚡', '🏢', '🛠️', '🦄'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444'];

export default function CreateWorkspaceModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.activeModal === 'createWorkspace');
  const currentUser = useAppSelector(state => state.auth.currentUser);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }
    if (!currentUser) return;

    dispatch(
      createWorkspace({
        name: name.trim(),
        icon,
        color,
        ownerId: currentUser.id,
      })
    );

    dispatch(
      addToast({
        type: 'success',
        message: `Workspace "${name.trim()}" created!`,
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
          <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--fg-primary)' }}>
            Create New Workspace
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

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
              Workspace Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Acme Corp, Marketing Team..."
              autoFocus
              className="w-full px-3 py-2 rounded-lg text-sm transition-all outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-primary)',
                color: 'var(--fg-primary)',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                Icon
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border max-h-24 overflow-y-auto" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-input)' }}>
                {ICONS.map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-all ${
                      icon === i ? 'scale-110 bg-zinc-800 ring-1 ring-violet-500/50' : 'hover:bg-zinc-850 opacity-80 hover:opacity-100'
                    }`}
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
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border max-h-24 overflow-y-auto" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-input)' }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'scale-110 ring-2 ring-offset-2 ring-violet-500 ring-offset-zinc-950' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
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
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
