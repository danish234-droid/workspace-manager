'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/hooks/useRedux';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ToastContainer from '@/components/ui/ToastContainer';
import GlobalModals from '@/components/layout/GlobalModals';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector(state => state.settings.settings.theme);
  useOnlineStatus();

  // Apply theme class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <ToastContainer />
      <GlobalModals />
    </AuthGuard>
  );
}
