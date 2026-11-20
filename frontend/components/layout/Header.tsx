'use client';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { toggleSidebar, setCommandPaletteOpen } from '@/store/uiSlice';
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';
import { setTheme } from '@/store/settingsSlice';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.settings.settings.theme);
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const notifications = useAppSelector(state => state.notification.notifications);
  const activeWorkspaceId = useAppSelector(state => state.workspace.activeWorkspaceId);
  const workspaces = useAppSelector(state => state.workspace.workspaces);
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  const unreadCount = notifications.filter(n => !n.read && n.userId === currentUser?.id).length;
  const [isMac] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    }
    return false;
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(next));
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header
      className="flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 select-none"
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-primary)',
      }}
    >
      {/* Left section: Sidebar toggle & Command palette trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-md transition-colors duration-150 lg:hidden"
          style={{ color: 'var(--fg-secondary)' }}
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
          onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Command palette search bar */}
        <button
          onClick={() => dispatch(setCommandPaletteOpen(true))}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 group"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--fg-tertiary)',
            border: '1px solid var(--border-primary)',
            minWidth: '220px',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--fg-muted)';
            (e.currentTarget as HTMLElement).style.color = 'var(--fg-secondary)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)';
            (e.currentTarget as HTMLElement).style.color = 'var(--fg-tertiary)';
          }}
        >
          <Search size={13} className="group-hover:text-[var(--fg-primary)] transition-colors" />
          <span className="flex-1 text-left truncate">Search or jump to...</span>
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded font-mono border"
            style={{ background: 'var(--bg-hover)', color: 'var(--fg-tertiary)', borderColor: 'var(--border-primary)' }}
          >
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>
      </div>

      {/* Center section: Workspace contextual indicator */}
      {activeWorkspace && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg-tertiary)', color: 'var(--fg-secondary)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: activeWorkspace.color }} />
          <span className="truncate max-w-[160px]">{activeWorkspace.name}</span>
        </div>
      )}

      {/* Right section: Theme toggle, notifications & user profile badge */}
      <div className="flex items-center gap-1.5">
        {/* Mobile search button */}
        <button
          onClick={() => dispatch(setCommandPaletteOpen(true))}
          className="sm:hidden p-1.5 rounded-md transition-colors duration-150"
          style={{ color: 'var(--fg-secondary)' }}
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
          onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          aria-label="Open search"
        >
          <Search size={16} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md transition-colors duration-150"
          style={{ color: 'var(--fg-secondary)' }}
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
          onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="relative p-1.5 rounded-md transition-colors duration-150"
          style={{ color: 'var(--fg-secondary)' }}
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
          onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          aria-label="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ background: 'var(--accent-danger)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User avatar badge */}
        {currentUser && (
          <Link
            href="/settings"
            className="ml-1 flex items-center gap-2 p-1 rounded-md transition-colors duration-150"
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: currentUser.avatarColor ?? 'var(--accent-primary)' }}
            >
              {currentUser.name?.[0] ?? 'U'}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
