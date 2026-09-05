'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setCommandPaletteOpen, setActiveModal, toggleSidebar } from '@/store/uiSlice';
import { setTheme } from '@/store/settingsSlice';
import { setActiveWorkspace } from '@/store/workspaceSlice';
import {
  Search, FolderKanban, CheckSquare, Plus, LayoutDashboard,
  Settings, Bell, Sun, Moon, ArrowRight, X, Command,
} from 'lucide-react';

export default function CommandPalette() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isOpen = useAppSelector(state => state.ui.commandPaletteOpen);
  const theme = useAppSelector(state => state.settings.settings.theme);
  const workspaces = useAppSelector(state => state.workspace.workspaces);
  const activeWorkspaceId = useAppSelector(state => state.workspace.activeWorkspaceId);
  const projects = useAppSelector(state => state.project.projects);
  const tasks = useAppSelector(state => state.task.tasks);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        dispatch(setCommandPaletteOpen(!isOpen));
      } else if (e.key === 'Escape' && isOpen) {
        dispatch(setCommandPaletteOpen(false));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dispatch]);

interface PaletteItem {
  id: string;
  category: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  shortcut?: string;
  action: () => void;
}

  // Build searchable items
  const items = useMemo(() => {
    const q = query.toLowerCase().trim();

    const navigationItems: PaletteItem[] = [
      {
        id: 'nav-dashboard',
        category: 'Navigation',
        title: 'Go to Dashboard',
        icon: LayoutDashboard,
        action: () => router.push('/dashboard'),
      },
      {
        id: 'nav-workspaces',
        category: 'Navigation',
        title: 'Go to Projects',
        icon: FolderKanban,
        action: () => router.push(`/workspaces/${activeWorkspaceId}`),
      },
      {
        id: 'nav-settings',
        category: 'Navigation',
        title: 'Go to Settings',
        icon: Settings,
        action: () => router.push('/settings'),
      },
      {
        id: 'nav-notifications',
        category: 'Navigation',
        title: 'Go to Notifications',
        icon: Bell,
        action: () => router.push('/notifications'),
      },
    ];

    const actionItems: PaletteItem[] = [
      {
        id: 'action-create-task',
        category: 'Actions',
        title: 'Create New Task',
        icon: Plus,
        shortcut: 'N',
        action: () => dispatch(setActiveModal('createTask')),
      },
      {
        id: 'action-create-project',
        category: 'Actions',
        title: 'Create New Project',
        icon: Plus,
        action: () => dispatch(setActiveModal('createProject')),
      },
      {
        id: 'action-create-workspace',
        category: 'Actions',
        title: 'Create New Workspace',
        icon: Plus,
        action: () => dispatch(setActiveModal('createWorkspace')),
      },
      {
        id: 'action-toggle-theme',
        category: 'Actions',
        title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        icon: theme === 'dark' ? Sun : Moon,
        action: () => {
          const next = theme === 'dark' ? 'light' : 'dark';
          dispatch(setTheme(next));
        },
      },
      {
        id: 'action-toggle-sidebar',
        category: 'Actions',
        title: 'Toggle Sidebar',
        icon: LayoutDashboard,
        action: () => dispatch(toggleSidebar()),
      },
    ];

    const workspaceItems = workspaces.map(ws => ({
      id: `ws-${ws.id}`,
      category: 'Workspaces',
      title: ws.name,
      description: ws.description,
      icon: FolderKanban,
      action: () => {
        dispatch(setActiveWorkspace(ws.id));
        router.push(`/workspaces/${ws.id}`);
      },
    }));

    const projectItems = projects
      .filter(p => p.status === 'active')
      .map(p => ({
        id: `proj-${p.id}`,
        category: 'Projects',
        title: p.name,
        description: p.description,
        icon: FolderKanban,
        action: () => {
          dispatch(setActiveWorkspace(p.workspaceId));
          router.push(`/workspaces/${p.workspaceId}/projects/${p.id}`);
        },
      }));

    const taskItems = tasks.slice(0, 50).map(t => ({
      id: `task-${t.id}`,
      category: 'Tasks',
      title: t.title,
      description: `Status: ${t.status} • Priority: ${t.priority}`,
      icon: CheckSquare,
      action: () => dispatch(setActiveModal(`task:${t.id}`)),
    }));

    const all: PaletteItem[] = [...navigationItems, ...actionItems, ...workspaceItems, ...projectItems, ...taskItems];

    if (!q) {
      return [...navigationItems, ...actionItems, ...projectItems.slice(0, 3)];
    }

    return all.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description ? item.description.toLowerCase().includes(q) : false;
      const matchCat = item.category.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCat;
    });
  }, [query, workspaces, activeWorkspaceId, projects, tasks, theme, router, dispatch]);

  const handleSelect = (item: (typeof items)[0]) => {
    dispatch(setCommandPaletteOpen(false));
    item.action();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        handleSelect(items[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center pt-20 px-4 animate-fade-in"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
      onClick={() => dispatch(setCommandPaletteOpen(false))}
    >
      <div
        className="w-full max-w-xl rounded-xl overflow-hidden shadow-2xl animate-scale-in flex flex-col"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-primary)',
          maxHeight: '75vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <Search size={18} style={{ color: 'var(--fg-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search workspaces, projects, tasks..."
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-stone-400"
            style={{ color: 'var(--fg-primary)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X size={14} />
            </button>
          )}
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded font-mono"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--fg-tertiary)' }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <div className="py-8 text-center" style={{ color: 'var(--fg-tertiary)' }}>
              <p className="text-sm">No results found for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            items.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors duration-100 text-left"
                  style={{
                    background: isSelected ? 'var(--bg-hover)' : 'transparent',
                    color: isSelected ? 'var(--fg-primary)' : 'var(--fg-secondary)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isSelected ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--fg-secondary)',
                      }}
                    >
                      <Icon size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs truncate" style={{ color: 'var(--fg-tertiary)' }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span
                      className="text-[11px] px-1.5 py-0.5 rounded font-medium"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--fg-tertiary)' }}
                    >
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight size={14} style={{ color: 'var(--accent-primary)' }} />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          className="flex items-center justify-between px-4 py-2 text-xs"
          style={{
            borderTop: '1px solid var(--border-primary)',
            background: 'var(--bg-secondary)',
            color: 'var(--fg-tertiary)',
          }}
        >
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-[10px] font-mono">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-[10px] font-mono">↓</kbd> navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-[10px] font-mono">↵</kbd> select
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command size={11} />
            <span>Workspace Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  );
}
