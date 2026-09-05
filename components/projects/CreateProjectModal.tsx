'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setActiveModal, addToast } from '@/store/uiSlice';
import { createProject } from '@/store/projectSlice';
import { addActivity } from '@/store/activitySlice';
import type { ProjectTemplate } from '@/types';
import { X, AlertCircle } from 'lucide-react';

const ICONS = ['🚀', '🎨', '📱', '📈', '💻', '🎯', '⚡', '💡', '✍️', '🔧', '📦', '🌍'];
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

const TEMPLATES: { id: ProjectTemplate; name: string; desc: string }[] = [
  { id: 'software-development', name: 'Software Development', desc: 'Sprints, feature tracks, bug fixes' },
  { id: 'website-project', name: 'Website Project', desc: 'Design, copy, frontend, launch' },
  { id: 'marketing-campaign', name: 'Marketing Campaign', desc: 'Content planning, outreach, ads' },
  { id: 'product-launch', name: 'Product Launch', desc: 'Roadmap, beta testing, store submission' },
  { id: 'blank', name: 'Blank Board', desc: 'Clean slate with default Kanban columns' },
];

export default function CreateProjectModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.activeModal === 'createProject');
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const activeWorkspaceId = useAppSelector(state => state.workspace.activeWorkspaceId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [template, setTemplate] = useState<ProjectTemplate>('software-development');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!activeWorkspaceId || !currentUser) return;

    dispatch(
      createProject({
        workspaceId: activeWorkspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
        template,
        createdBy: currentUser.id,
      })
    );

    dispatch(
      addActivity({
        workspaceId: activeWorkspaceId,
        actorId: currentUser.id,
        action: 'project_created',
        metadata: { name: name.trim(), template },
      })
    );

    dispatch(
      addToast({
        type: 'success',
        message: `Project "${name.trim()}" created successfully!`,
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
            Create New Project
          </h2>
          <button
            onClick={() => dispatch(setActiveModal(null))}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400 bg-red-950/30 border border-red-500/30">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Design Systems, Mobile App..."
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
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project about?"
              className="w-full px-3 py-2 rounded-lg text-sm transition-all resize-none outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-primary)',
                color: 'var(--fg-primary)',
              }}
            />
          </div>

          {/* Icon & Color */}
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
                Theme Color
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

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
              Project Template
            </label>
            <div className="space-y-1.5">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all"
                  style={{
                    background: template === t.id ? 'var(--accent-primary-light)' : 'var(--bg-input)',
                    borderColor: template === t.id ? 'var(--accent-primary)' : 'var(--border-primary)',
                  }}
                >
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--fg-primary)' }}>
                      {t.name}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--fg-tertiary)' }}>
                      {t.desc}
                    </p>
                  </div>
                  {template === t.id && (
                    <span className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
