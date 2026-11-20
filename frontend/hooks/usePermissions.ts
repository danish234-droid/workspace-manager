import { useMemo } from 'react';
import { useAppSelector } from './useRedux';
import type { Role } from '@/types';
import { hasPermission, type PermissionAction } from '@/utils/permissions';

export function usePermissions(workspaceId?: string) {
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const members = useAppSelector(state => state.workspace.members);

  const membership = useMemo(() => {
    if (!currentUser || !workspaceId) return null;
    return members.find(m => m.workspaceId === workspaceId && m.userId === currentUser.id) ?? null;
  }, [currentUser, workspaceId, members]);

  const role: Role | undefined = membership?.role;

  const can = (action: PermissionAction): boolean => hasPermission(role, action);

  return { role, membership, can };
}
