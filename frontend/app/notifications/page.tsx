'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { markAsRead, markAllAsRead, deleteNotification } from '@/store/notificationSlice';
import { setActiveModal } from '@/store/uiSlice';
import { formatRelativeTime } from '@/utils/date';
import {
  Bell, Check, Trash2, CheckSquare, MessageSquare, AlertCircle,
  UserPlus,
} from 'lucide-react';

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const allNotifications = useAppSelector(state => state.notification.notifications);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const userNotifications = useMemo(() => {
    return allNotifications.filter(n => n.userId === currentUser?.id);
  }, [allNotifications, currentUser?.id]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return userNotifications.filter(n => !n.read);
    }
    return userNotifications;
  }, [userNotifications, filter]);

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif: (typeof userNotifications)[0]) => {
    if (!notif.read) {
      dispatch(markAsRead(notif.id));
    }
    if (notif.taskId) {
      dispatch(setActiveModal(`task:${notif.taskId}`));
    } else if (notif.projectId && notif.workspaceId) {
      router.push(`/workspaces/${notif.workspaceId}/projects/${notif.projectId}`);
    } else if (notif.workspaceId) {
      router.push(`/workspaces/${notif.workspaceId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <CheckSquare size={15} style={{ color: 'var(--accent-primary)' }} />;
      case 'task_mentioned':
      case 'comment_added':
        return <MessageSquare size={15} className="text-blue-400" />;
      case 'due_date_approaching':
        return <AlertCircle size={15} className="text-amber-500" />;
      case 'member_added':
        return <UserPlus size={15} className="text-emerald-400" />;
      default:
        return <Bell size={15} style={{ color: 'var(--fg-tertiary)' }} />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-4xl mx-auto pb-16 select-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--fg-primary)' }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: 'var(--accent-danger)' }}
                >
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--fg-secondary)' }}>
              Stay updated on task assignments, collaborator mentions, and project updates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <div
              className="flex items-center p-1 rounded-lg border text-xs"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  filter === 'all'
                    ? 'text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={{
                  background: filter === 'all' ? 'var(--accent-primary)' : 'transparent',
                }}
              >
                All ({userNotifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  filter === 'unread'
                    ? 'text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={{
                  background: filter === 'unread' ? 'var(--accent-primary)' : 'transparent',
                }}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Mark all as read */}
            {unreadCount > 0 && currentUser && (
              <button
                onClick={() => dispatch(markAllAsRead(currentUser.id))}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-colors hover:bg-[var(--bg-hover)]"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--accent-primary)' }}
              >
                <Check size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-primary)',
          }}
        >
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-400">
              <Bell size={28} className="mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-xs" style={{ color: 'var(--fg-primary)' }}>
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                There are no notifications matching your filter preference.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
              {filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className="flex items-start justify-between p-3.5 gap-3.5 text-xs transition-colors hover:bg-[var(--bg-hover)] cursor-pointer"
                  style={{
                    background: !notif.read ? 'var(--accent-primary-light)' : 'transparent',
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--bg-tertiary)' }}
                    >
                      {getNotificationIcon(notif.type)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-xs truncate" style={{ color: 'var(--fg-primary)' }}>
                          {notif.title}
                        </h3>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent-primary)' }} />
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {!notif.read && (
                      <button
                        onClick={() => dispatch(markAsRead(notif.id))}
                        title="Mark as read"
                        className="p-1 rounded text-zinc-400 hover:text-[var(--accent-primary)] transition-colors"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => dispatch(deleteNotification(notif.id))}
                      title="Delete notification"
                      className="p-1 rounded text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
