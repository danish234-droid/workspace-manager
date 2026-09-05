import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Workspace, WorkspaceMember, Role } from '@/types';
import { MOCK_WORKSPACES, MOCK_WORKSPACE_MEMBERS } from '@/lib/mockData';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/utils/persistence';
import { generateId } from '@/utils/id';
import { nowISO } from '@/utils/date';

interface WorkspaceState {
  workspaces: Workspace[];
  members: WorkspaceMember[];
  activeWorkspaceId: string | null;
}

function loadInitialState(): WorkspaceState {
  return {
    workspaces: getFromStorage(STORAGE_KEYS.WORKSPACES, MOCK_WORKSPACES),
    members: getFromStorage(STORAGE_KEYS.WORKSPACE_MEMBERS, MOCK_WORKSPACE_MEMBERS),
    activeWorkspaceId: getFromStorage(STORAGE_KEYS.ACTIVE_WORKSPACE, 'ws-1'),
  };
}

const persist = (state: WorkspaceState) => {
  setToStorage(STORAGE_KEYS.WORKSPACES, state.workspaces);
  setToStorage(STORAGE_KEYS.WORKSPACE_MEMBERS, state.members);
  setToStorage(STORAGE_KEYS.ACTIVE_WORKSPACE, state.activeWorkspaceId);
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: loadInitialState(),
  reducers: {
    setActiveWorkspace(state, action: PayloadAction<string>) {
      state.activeWorkspaceId = action.payload;
      persist(state);
    },

    createWorkspace(state, action: PayloadAction<{ name: string; icon: string; color: string; ownerId: string }>) {
      const ws: Workspace = {
        id: generateId('ws'),
        name: action.payload.name,
        icon: action.payload.icon,
        color: action.payload.color,
        ownerId: action.payload.ownerId,
        defaultView: 'kanban',
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      state.workspaces.push(ws);

      const ownerMember: WorkspaceMember = {
        id: generateId('wm'),
        workspaceId: ws.id,
        userId: action.payload.ownerId,
        role: 'owner',
        joinedAt: nowISO(),
      };
      state.members.push(ownerMember);
      state.activeWorkspaceId = ws.id;
      persist(state);
    },

    updateWorkspace(state, action: PayloadAction<{ id: string; updates: Partial<Pick<Workspace, 'name' | 'icon' | 'color' | 'description' | 'defaultView'>> }>) {
      const ws = state.workspaces.find(w => w.id === action.payload.id);
      if (ws) {
        Object.assign(ws, action.payload.updates, { updatedAt: nowISO() });
        persist(state);
      }
    },

    deleteWorkspace(state, action: PayloadAction<string>) {
      state.workspaces = state.workspaces.filter(w => w.id !== action.payload);
      state.members = state.members.filter(m => m.workspaceId !== action.payload);
      if (state.activeWorkspaceId === action.payload) {
        state.activeWorkspaceId = state.workspaces[0]?.id ?? null;
      }
      persist(state);
    },

    inviteMember(state, action: PayloadAction<{ workspaceId: string; userId: string; role: Role }>) {
      const exists = state.members.some(
        m => m.workspaceId === action.payload.workspaceId && m.userId === action.payload.userId,
      );
      if (exists) return;

      state.members.push({
        id: generateId('wm'),
        workspaceId: action.payload.workspaceId,
        userId: action.payload.userId,
        role: action.payload.role,
        joinedAt: nowISO(),
      });
      persist(state);
    },

    updateMemberRole(state, action: PayloadAction<{ memberId: string; role: Role }>) {
      const member = state.members.find(m => m.id === action.payload.memberId);
      if (member) {
        member.role = action.payload.role;
        persist(state);
      }
    },

    removeMember(state, action: PayloadAction<string>) {
      state.members = state.members.filter(m => m.id !== action.payload);
      persist(state);
    },

    resetWorkspaces(state) {
      state.workspaces = [...MOCK_WORKSPACES];
      state.members = [...MOCK_WORKSPACE_MEMBERS];
      state.activeWorkspaceId = 'ws-1';
      persist(state);
    },

    loadWorkspaces(state, action: PayloadAction<{ workspaces: Workspace[]; members: WorkspaceMember[] }>) {
      state.workspaces = action.payload.workspaces;
      state.members = action.payload.members;
      persist(state);
    },
  },
});

export const {
  setActiveWorkspace, createWorkspace, updateWorkspace, deleteWorkspace,
  inviteMember, updateMemberRole, removeMember, resetWorkspaces, loadWorkspaces,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
