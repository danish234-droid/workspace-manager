import type { Role } from '@/types';

/**
 * Permission action types for the workspace manager.
 */
export type PermissionAction =
  | 'workspace:edit'
  | 'workspace:delete'
  | 'workspace:manage_members'
  | 'workspace:invite'
  | 'project:create'
  | 'project:edit'
  | 'project:delete'
  | 'project:archive'
  | 'project:manage_members'
  | 'task:create'
  | 'task:edit'
  | 'task:delete'
  | 'task:assign'
  | 'task:change_status'
  | 'task:bulk_edit'
  | 'comment:create'
  | 'comment:edit_own'
  | 'comment:delete_own'
  | 'comment:edit_any'
  | 'comment:delete_any'
  | 'member:change_role'
  | 'member:remove';

/**
 * Role hierarchy: owner > admin > member > viewer
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

/**
 * Permission matrix: which roles can do what.
 */
const PERMISSION_MAP: Record<PermissionAction, Role[]> = {
  'workspace:edit': ['owner', 'admin'],
  'workspace:delete': ['owner'],
  'workspace:manage_members': ['owner', 'admin'],
  'workspace:invite': ['owner', 'admin'],
  'project:create': ['owner', 'admin', 'member'],
  'project:edit': ['owner', 'admin', 'member'],
  'project:delete': ['owner', 'admin'],
  'project:archive': ['owner', 'admin'],
  'project:manage_members': ['owner', 'admin'],
  'task:create': ['owner', 'admin', 'member'],
  'task:edit': ['owner', 'admin', 'member'],
  'task:delete': ['owner', 'admin', 'member'],
  'task:assign': ['owner', 'admin', 'member'],
  'task:change_status': ['owner', 'admin', 'member'],
  'task:bulk_edit': ['owner', 'admin', 'member'],
  'comment:create': ['owner', 'admin', 'member'],
  'comment:edit_own': ['owner', 'admin', 'member'],
  'comment:delete_own': ['owner', 'admin', 'member'],
  'comment:edit_any': ['owner', 'admin'],
  'comment:delete_any': ['owner', 'admin'],
  'member:change_role': ['owner', 'admin'],
  'member:remove': ['owner', 'admin'],
};

export function hasPermission(role: Role | undefined, action: PermissionAction): boolean {
  if (!role) return false;
  return PERMISSION_MAP[action]?.includes(role) ?? false;
}

export function getRoleLevel(role: Role): number {
  return ROLE_HIERARCHY[role];
}

export function isRoleHigherOrEqual(a: Role, b: Role): boolean {
  return ROLE_HIERARCHY[a] >= ROLE_HIERARCHY[b];
}

export function getPermissionDeniedMessage(action: PermissionAction): string {
  const messages: Partial<Record<PermissionAction, string>> = {
    'workspace:edit': 'You need admin or owner permissions to edit workspace settings.',
    'workspace:delete': 'Only the workspace owner can delete a workspace.',
    'project:delete': 'You need admin or owner permissions to delete projects.',
    'task:create': 'Viewers cannot create tasks. Ask an admin to change your role.',
    'task:edit': 'Viewers cannot edit tasks.',
    'comment:create': 'Viewers cannot add comments.',
  };
  return messages[action] ?? 'You do not have permission to perform this action.';
}
