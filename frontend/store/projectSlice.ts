import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Project, KanbanColumn, ViewType, ProjectTemplate } from '@/types';
import { MOCK_PROJECTS, DEFAULT_KANBAN_COLUMNS } from '@/lib/mockData';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/utils/persistence';
import { generateId } from '@/utils/id';
import { nowISO } from '@/utils/date';

interface ProjectState {
  projects: Project[];
}

function loadInitialState(): ProjectState {
  return {
    projects: getFromStorage(STORAGE_KEYS.PROJECTS, MOCK_PROJECTS),
  };
}

const persist = (state: ProjectState) => {
  setToStorage(STORAGE_KEYS.PROJECTS, state.projects);
};

const projectSlice = createSlice({
  name: 'project',
  initialState: loadInitialState(),
  reducers: {
    createProject(state, action: PayloadAction<{
      workspaceId: string;
      name: string;
      description?: string;
      icon: string;
      color: string;
      template: ProjectTemplate;
      createdBy: string;
    }>) {
      const id = generateId('proj');
      const project: Project = {
        id,
        workspaceId: action.payload.workspaceId,
        name: action.payload.name,
        description: action.payload.description,
        icon: action.payload.icon,
        color: action.payload.color,
        status: 'active',
        defaultView: 'kanban',
        template: action.payload.template,
        memberIds: [action.payload.createdBy],
        columns: DEFAULT_KANBAN_COLUMNS.map(c => ({ ...c, id: `${id}-${c.id}` })),
        createdBy: action.payload.createdBy,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      state.projects.push(project);
      persist(state);
    },

    updateProject(state, action: PayloadAction<{
      id: string;
      updates: Partial<Pick<Project, 'name' | 'description' | 'icon' | 'color' | 'defaultView'>>;
    }>) {
      const proj = state.projects.find(p => p.id === action.payload.id);
      if (proj) {
        Object.assign(proj, action.payload.updates, { updatedAt: nowISO() });
        persist(state);
      }
    },

    archiveProject(state, action: PayloadAction<string>) {
      const proj = state.projects.find(p => p.id === action.payload);
      if (proj) {
        proj.status = 'archived';
        proj.updatedAt = nowISO();
        persist(state);
      }
    },

    unarchiveProject(state, action: PayloadAction<string>) {
      const proj = state.projects.find(p => p.id === action.payload);
      if (proj) {
        proj.status = 'active';
        proj.updatedAt = nowISO();
        persist(state);
      }
    },

    deleteProject(state, action: PayloadAction<string>) {
      state.projects = state.projects.filter(p => p.id !== action.payload);
      persist(state);
    },

    addProjectMember(state, action: PayloadAction<{ projectId: string; userId: string }>) {
      const proj = state.projects.find(p => p.id === action.payload.projectId);
      if (proj && !proj.memberIds.includes(action.payload.userId)) {
        proj.memberIds.push(action.payload.userId);
        proj.updatedAt = nowISO();
        persist(state);
      }
    },

    removeProjectMember(state, action: PayloadAction<{ projectId: string; userId: string }>) {
      const proj = state.projects.find(p => p.id === action.payload.projectId);
      if (proj) {
        proj.memberIds = proj.memberIds.filter(id => id !== action.payload.userId);
        proj.updatedAt = nowISO();
        persist(state);
      }
    },

    setProjectView(state, action: PayloadAction<{ projectId: string; view: ViewType }>) {
      const proj = state.projects.find(p => p.id === action.payload.projectId);
      if (proj) {
        proj.defaultView = action.payload.view;
        proj.updatedAt = nowISO();
        persist(state);
      }
    },

    // Kanban column management
    addColumn(state, action: PayloadAction<{ projectId: string; column: KanbanColumn }>) {
      const proj = state.projects.find(p => p.id === action.payload.projectId);
      if (proj) {
        proj.columns.push(action.payload.column);
        persist(state);
      }
    },

    updateColumn(state, action: PayloadAction<{ projectId: string; columnId: string; updates: Partial<KanbanColumn> }>) {
      const proj = state.projects.find(p => p.id === action.payload.projectId);
      if (proj) {
        const col = proj.columns.find(c => c.id === action.payload.columnId);
        if (col) {
          Object.assign(col, action.payload.updates);
          persist(state);
        }
      }
    },

    deleteColumn(state, action: PayloadAction<{ projectId: string; columnId: string }>) {
      const proj = state.projects.find(p => p.id === action.payload.projectId);
      if (proj) {
        proj.columns = proj.columns.filter(c => c.id !== action.payload.columnId);
        persist(state);
      }
    },

    reorderColumns(state, action: PayloadAction<{ projectId: string; columns: KanbanColumn[] }>) {
      const proj = state.projects.find(p => p.id === action.payload.projectId);
      if (proj) {
        proj.columns = action.payload.columns;
        persist(state);
      }
    },

    resetProjects(state) {
      state.projects = [...MOCK_PROJECTS];
      persist(state);
    },

    loadProjects(state, action: PayloadAction<Project[]>) {
      state.projects = action.payload;
      persist(state);
    },
  },
});

export const {
  createProject, updateProject, archiveProject, unarchiveProject, deleteProject,
  addProjectMember, removeProjectMember, setProjectView,
  addColumn, updateColumn, deleteColumn, reorderColumns,
  resetProjects, loadProjects,
} = projectSlice.actions;
export default projectSlice.reducer;
