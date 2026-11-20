/**
 * SSR-safe localStorage wrapper.
 * All reads/writes are try/catch wrapped to handle quota errors and private browsing.
 */

const isBrowser = typeof window !== 'undefined';

export function getFromStorage<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[persistence] Failed to write key "${key}":`, e);
  }
}

export function removeFromStorage(key: string): void {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function clearAllStorage(): void {
  if (!isBrowser) return;
  try {
    localStorage.clear();
  } catch {
    // ignore
  }
}

// Storage keys
export const STORAGE_KEYS = {
  AUTH_SESSION: 'wm_auth_session',
  SETTINGS: 'wm_settings',
  WORKSPACES: 'wm_workspaces',
  WORKSPACE_MEMBERS: 'wm_workspace_members',
  PROJECTS: 'wm_projects',
  TASKS: 'wm_tasks',
  COMMENTS: 'wm_comments',
  ACTIVITIES: 'wm_activities',
  NOTIFICATIONS: 'wm_notifications',
  LABELS: 'wm_labels',
  FILTER_PRESETS: 'wm_filter_presets',
  USERS: 'wm_users',
  ACTIVE_WORKSPACE: 'wm_active_workspace',
  THEME: 'wm_theme',
  VIEW_PREFERENCES: 'wm_view_preferences',
} as const;
