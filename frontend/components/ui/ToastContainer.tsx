'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { removeToast } from '@/store/uiSlice';
import { undo } from '@/store/taskSlice';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: { bg: 'var(--accent-success-light)', border: 'var(--accent-success)', icon: 'var(--accent-success)' },
  error: { bg: 'var(--accent-danger-light)', border: 'var(--accent-danger)', icon: 'var(--accent-danger)' },
  info: { bg: 'var(--accent-info-light)', border: 'var(--accent-info)', icon: 'var(--accent-info)' },
  warning: { bg: 'var(--accent-warning-light)', border: 'var(--accent-warning)', icon: 'var(--accent-warning)' },
};

export default function ToastContainer() {
  const toasts = useAppSelector(state => state.ui.toasts);
  const dispatch = useAppDispatch();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dispatch(removeToast(toast.id))} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: { id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string; duration?: number };
  onDismiss: () => void;
}) {
  const Icon = icons[toast.type];
  const color = colors[toast.type];
  const dispatch = useAppDispatch();
  const undoStack = useAppSelector(state => state.task.undoStack);
  const isUndoable = undoStack.length > 0 && (toast.message.includes('deleted') || toast.message.includes('moved') || toast.message.includes('Task'));

  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg animate-slide-in-right"
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid var(--border-primary)`,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <Icon size={18} style={{ color: color.icon, flexShrink: 0 }} />
      <p className="text-sm flex-1" style={{ color: 'var(--fg-primary)' }}>
        {toast.message}
      </p>
      {isUndoable && (
        <button
          onClick={() => {
            dispatch(undo());
            onDismiss();
          }}
          className="px-2 py-1 text-xs font-bold rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
        >
          Undo
        </button>
      )}
      <button
        onClick={onDismiss}
        className="p-0.5 rounded-md transition-colors duration-150 flex-shrink-0"
        style={{ color: 'var(--fg-tertiary)' }}
        onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-primary)')}
        onMouseOut={e => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-tertiary)')}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
