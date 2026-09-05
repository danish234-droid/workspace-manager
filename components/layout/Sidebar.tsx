'use client';

import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, FolderKanban, Settings, Search, Bell, ChevronDown,
  LogOut, User, Plus, ChevronRight, CheckSquare, Calendar as CalendarIcon,
  Clock, Users, Activity, BarChart3, PieChart
} from 'lucide-react';
import { setMobileSidebarOpen, setCommandPaletteOpen, setActiveModal } from '@/store/uiSlice';
import { logout } from '@/store/authSlice';
import { setActiveWorkspace } from '@/store/workspaceSlice';
import { useState, useRef, useEffect } from 'react';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sidebarOpen = useAppSelector(state => state.ui.sidebarOpen);
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const workspaces = useAppSelector(state => state.workspace.workspaces);
  const activeWorkspaceId = useAppSelector(state => state.workspace.activeWorkspaceId);
  const projects = useAppSelector(state => state.project.projects);
  const notifications = useAppSelector(state => state.notification.notifications);

  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const wsDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const workspaceProjects = projects.filter(
    p => p.workspaceId === activeWorkspaceId && p.status === 'active'
  );
  const unreadCount = notifications.filter(n => !n.read && n.userId === currentUser?.id).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(e.target as Node)) {
        setWsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    
    // Track hash for sidebar active states (Workload / Reports)
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash);
      const handleHashChange = () => setCurrentHash(window.location.hash);
      window.addEventListener('hashchange', handleHashChange);
      return () => {
        document.removeEventListener('mousedown', handleClick);
        window.removeEventListener('hashchange', handleHashChange);
      };
    }
    
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  
  // Update hash when pathname or search params change (in case of Next.js soft navigation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash);
    }
  }, [pathname, searchParams]);

  const mainNav = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: `/workspaces/${activeWorkspaceId}`, icon: FolderKanban, label: 'Projects' },
    { href: `/workspaces/${activeWorkspaceId}?tab=list`, icon: CheckSquare, label: 'My Tasks' },
    { href: `/workspaces/${activeWorkspaceId}?tab=calendar`, icon: CalendarIcon, label: 'Calendar' },
    { href: `/workspaces/${activeWorkspaceId}?tab=timeline`, icon: Clock, label: 'Timeline' },
  ];

  const teamNav = [
    { href: `/workspaces/${activeWorkspaceId}?tab=members`, icon: Users, label: 'Members' },
    { href: `/workspaces/${activeWorkspaceId}?tab=activity`, icon: Activity, label: 'Activity' },
  ];

  const analyticsNav = [
    { href: '/dashboard#reports', icon: BarChart3, label: 'Reports' },
    { href: '/dashboard#workload', icon: PieChart, label: 'Workload' },
  ];

  const isActive = (href: string) => {
    if (href.includes('#')) {
      const [base, hash] = href.split('#');
      return pathname === base && currentHash === `#${hash}`;
    }

    if (href.includes('?')) {
      const [base, query] = href.split('?');
      return pathname === base && searchParams.toString().includes(query);
    }
    
    // For workspace base URLs (Projects)
    if (pathname === href && href.startsWith('/workspaces/')) {
      const currentTab = searchParams.get('tab');
      return !currentTab || currentTab === 'projects';
    }

    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href) && !href.includes('?'));
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className="fixed inset-0 z-40 lg:hidden transition-opacity duration-200"
        style={{
          background: 'var(--bg-overlay)',
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? 'auto' : 'none',
        }}
        onClick={() => dispatch(setMobileSidebarOpen(false))}
      />

      <aside
        className="fixed top-0 left-0 z-50 h-full flex flex-col transition-all duration-200 lg:relative lg:z-auto select-none"
        style={{
          width: sidebarOpen ? 'var(--sidebar-width)' : '0',
          minWidth: sidebarOpen ? 'var(--sidebar-width)' : '0',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-primary)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* WORKSPACE HEADER */}
        <div className="p-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="text-[10px] font-bold uppercase tracking-wider px-2 mb-1.5" style={{ color: 'var(--fg-tertiary)' }}>
            Workspace
          </div>
          <div className="relative" ref={wsDropdownRef}>
            <button
              onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors duration-150 group"
              style={{ color: 'var(--fg-primary)' }}
              onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
              onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{ background: activeWorkspace?.color ?? 'var(--accent-primary)', color: '#ffffff' }}
              >
                {activeWorkspace?.icon ?? '📁'}
              </span>
              <span className="flex-1 text-left text-xs font-semibold truncate">
                {activeWorkspace?.name ?? 'Select Workspace'}
              </span>
              <ChevronDown size={14} className="transition-transform duration-150" style={{ color: 'var(--fg-tertiary)' }} />
            </button>

            {wsDropdownOpen && (
              <div
                className="absolute left-0 right-0 top-full mt-1 rounded-lg overflow-hidden animate-scale-in z-50 py-1"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      dispatch(setActiveWorkspace(ws.id));
                      setWsDropdownOpen(false);
                      router.push(`/workspaces/${ws.id}`);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors duration-100"
                    style={{
                      color: 'var(--fg-primary)',
                      background: ws.id === activeWorkspaceId ? 'var(--accent-primary-light)' : 'transparent',
                    }}
                    onMouseOver={e => {
                      if (ws.id !== activeWorkspaceId) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                    }}
                    onMouseOut={e => {
                      if (ws.id !== activeWorkspaceId) (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center text-xs"
                      style={{ background: ws.color, color: '#ffffff' }}
                    >
                      {ws.icon}
                    </span>
                    <span className="truncate flex-1 text-left">{ws.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Search */}
        <div className="px-3 pt-3">
          <button
            onClick={() => dispatch(setCommandPaletteOpen(true))}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors duration-150"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--fg-tertiary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <Search size={13} />
            <span className="flex-1 text-left">Search or jump to...</span>
            <kbd
              className="text-[10px] px-1 py-0.5 rounded font-mono border"
              style={{ background: 'var(--bg-hover)', color: 'var(--fg-tertiary)', borderColor: 'var(--border-primary)' }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* MAIN NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* MAIN SECTION */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider px-2.5 mb-1" style={{ color: 'var(--fg-tertiary)' }}>
              Main
            </div>
            <div className="space-y-0.5">
              {mainNav.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                    style={{
                      color: active ? 'var(--accent-primary)' : 'var(--fg-secondary)',
                      background: active ? 'var(--accent-primary-light)' : 'transparent',
                    }}
                    onMouseOver={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                    }}
                    onMouseOut={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* PROJECTS SUB-LIST */}
          <div>
            <div className="flex items-center justify-between px-2.5 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg-tertiary)' }}>
                Projects
              </span>
              <button
                onClick={() => dispatch(setActiveModal('createProject'))}
                className="p-0.5 rounded transition-colors duration-150"
                style={{ color: 'var(--fg-tertiary)' }}
                onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-primary)')}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-tertiary)')}
                title="Create Project"
              >
                <Plus size={13} />
              </button>
            </div>
            <div className="space-y-0.5">
              {workspaceProjects.length === 0 ? (
                <p className="px-2.5 py-1 text-[11px]" style={{ color: 'var(--fg-muted)' }}>
                  No active projects
                </p>
              ) : (
                workspaceProjects.map(proj => {
                  const projPath = `/workspaces/${activeWorkspaceId}/projects/${proj.id}`;
                  const active = pathname.startsWith(projPath);
                  return (
                    <Link
                      key={proj.id}
                      href={projPath}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 group"
                      style={{
                        color: active ? 'var(--accent-primary)' : 'var(--fg-secondary)',
                        background: active ? 'var(--accent-primary-light)' : 'transparent',
                      }}
                      onMouseOver={e => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                      }}
                      onMouseOut={e => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <span className="text-xs">{proj.icon}</span>
                      <span className="truncate flex-1">{proj.name}</span>
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--fg-muted)' }} />
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* TEAM SECTION */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider px-2.5 mb-1" style={{ color: 'var(--fg-tertiary)' }}>
              Team
            </div>
            <div className="space-y-0.5">
              {teamNav.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                    style={{
                      color: active ? 'var(--accent-primary)' : 'var(--fg-secondary)',
                      background: active ? 'var(--accent-primary-light)' : 'transparent',
                    }}
                    onMouseOver={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                    }}
                    onMouseOut={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ANALYTICS SECTION */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider px-2.5 mb-1" style={{ color: 'var(--fg-tertiary)' }}>
              Analytics
            </div>
            <div className="space-y-0.5">
              {analyticsNav.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                    style={{
                      color: active ? 'var(--accent-primary)' : 'var(--fg-secondary)',
                      background: active ? 'var(--accent-primary-light)' : 'transparent',
                    }}
                    onMouseOver={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                    }}
                    onMouseOut={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* BOTTOM SECTION */}
        <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--border-primary)' }}>
          {/* Notifications */}
          <Link
            href="/notifications"
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
            style={{
              color: isActive('/notifications') ? 'var(--accent-primary)' : 'var(--fg-secondary)',
              background: isActive('/notifications') ? 'var(--accent-primary-light)' : 'transparent',
            }}
            onMouseOver={e => {
              if (!isActive('/notifications')) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
            }}
            onMouseOut={e => {
              if (!isActive('/notifications')) (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <Bell size={15} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span
                className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white"
                style={{ background: 'var(--accent-danger)' }}
              >
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
            style={{
              color: isActive('/settings') ? 'var(--accent-primary)' : 'var(--fg-secondary)',
              background: isActive('/settings') ? 'var(--accent-primary-light)' : 'transparent',
            }}
            onMouseOver={e => {
              if (!isActive('/settings')) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
            }}
            onMouseOut={e => {
              if (!isActive('/settings')) (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <Settings size={15} />
            <span>Settings</span>
          </Link>

          {/* User Profile */}
          <div className="relative pt-1" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors duration-150 text-left"
              style={{ color: 'var(--fg-primary)' }}
              onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
              onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                style={{ background: currentUser?.avatarColor ?? 'var(--accent-primary)' }}
              >
                {currentUser?.name?.[0] ?? 'U'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate leading-none mb-0.5">{currentUser?.name}</div>
                <div className="text-[11px] truncate leading-none" style={{ color: 'var(--fg-tertiary)' }}>
                  {currentUser?.email}
                </div>
              </div>
            </button>

            {userMenuOpen && (
              <div
                className="absolute left-0 right-0 bottom-full mb-1.5 rounded-lg overflow-hidden animate-scale-in z-50 py-1"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors duration-100"
                  style={{ color: 'var(--fg-primary)' }}
                  onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
                  onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <User size={14} />
                  <span>Profile & Preferences</span>
                </Link>
                <div className="my-1" style={{ borderTop: '1px solid var(--border-primary)' }}>
                  <button
                    onClick={() => {
                      dispatch(logout());
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors duration-100"
                    style={{ color: 'var(--accent-danger)' }}
                    onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'var(--accent-danger-light)')}
                    onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    <LogOut size={14} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
