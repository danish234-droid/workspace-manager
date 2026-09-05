import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Task, TaskStatus, Priority } from '@/types';
import { MOCK_TASKS } from '@/lib/mockData';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/utils/persistence';
import { generateId } from '@/utils/id';
import { nowISO } from '@/utils/date';

// ─── Undo/Redo History ───────────────────────────────────────────────────────

interface UndoEntry {
  type: 'update' | 'delete' | 'create' | 'move';
  taskSnapshot: Task;
  description: string;
}

const MAX_UNDO_HISTORY = 30;

interface TaskState {
  tasks: Task[];
  selectedTaskIds: string[];
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];
}

function loadInitialState(): TaskState {
  return {
    tasks: getFromStorage(STORAGE_KEYS.TASKS, MOCK_TASKS),
    selectedTaskIds: [],
    undoStack: [],
    redoStack: [],
  };
}

const persist = (state: TaskState) => {
  setToStorage(STORAGE_KEYS.TASKS, state.tasks);
};

const pushUndo = (state: TaskState, entry: UndoEntry) => {
  state.undoStack.push(entry);
  if (state.undoStack.length > MAX_UNDO_HISTORY) state.undoStack.shift();
  state.redoStack = []; // Clear redo on new action
};

const taskSlice = createSlice({
  name: 'task',
  initialState: loadInitialState(),
  reducers: {
    createTask(state, action: PayloadAction<{
      projectId: string;
      workspaceId: string;
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: Priority;
      dueDate?: string;
      assigneeId?: string;
      labelIds?: string[];
      parentTaskId?: string;
      createdBy: string;
    }>) {
      const maxOrder = state.tasks
        .filter(t => t.projectId === action.payload.projectId && t.status === (action.payload.status ?? 'todo'))
        .reduce((max, t) => Math.max(max, t.order), -1);

      const task: Task = {
        id: generateId('task'),
        projectId: action.payload.projectId,
        workspaceId: action.payload.workspaceId,
        parentTaskId: action.payload.parentTaskId,
        title: action.payload.title,
        description: action.payload.description,
        status: action.payload.status ?? 'todo',
        priority: action.payload.priority ?? 'medium',
        dueDate: action.payload.dueDate,
        assigneeId: action.payload.assigneeId,
        labelIds: action.payload.labelIds ?? [],
        attachmentIds: [],
        order: maxOrder + 1,
        createdBy: action.payload.createdBy,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };

      state.tasks.push(task);
      pushUndo(state, { type: 'create', taskSnapshot: { ...task }, description: `Created "${task.title}"` });
      persist(state);
    },

    updateTask(state, action: PayloadAction<{ id: string; updates: Partial<Omit<Task, 'id' | 'createdAt' | 'createdBy'>> }>) {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (!task) return;

      pushUndo(state, { type: 'update', taskSnapshot: { ...task }, description: `Updated "${task.title}"` });
      Object.assign(task, action.payload.updates, { updatedAt: nowISO() });
      persist(state);
    },

    deleteTask(state, action: PayloadAction<string>) {
      const task = state.tasks.find(t => t.id === action.payload);
      if (!task) return;

      pushUndo(state, { type: 'delete', taskSnapshot: { ...task }, description: `Deleted "${task.title}"` });
      // Also remove subtasks
      const subtaskIds = state.tasks.filter(t => t.parentTaskId === action.payload).map(t => t.id);
      state.tasks = state.tasks.filter(t => t.id !== action.payload && !subtaskIds.includes(t.id));
      state.selectedTaskIds = state.selectedTaskIds.filter(id => id !== action.payload && !subtaskIds.includes(id));
      persist(state);
    },

    duplicateTask(state, action: PayloadAction<string>) {
      const original = state.tasks.find(t => t.id === action.payload);
      if (!original) return;

      const copy: Task = {
        ...original,
        id: generateId('task'),
        title: `${original.title} (copy)`,
        status: 'todo',
        order: original.order + 0.5,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      state.tasks.push(copy);
      persist(state);
    },

    moveTask(state, action: PayloadAction<{ taskId: string; newStatus: TaskStatus; newOrder: number }>) {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (!task) return;

      pushUndo(state, { type: 'move', taskSnapshot: { ...task }, description: `Moved "${task.title}"` });
      task.status = action.payload.newStatus;
      task.order = action.payload.newOrder;
      task.updatedAt = nowISO();
      persist(state);
    },

    reorderTasks(state, action: PayloadAction<{ tasks: { id: string; order: number; status: TaskStatus }[] }>) {
      for (const update of action.payload.tasks) {
        const task = state.tasks.find(t => t.id === update.id);
        if (task) {
          task.order = update.order;
          task.status = update.status;
          task.updatedAt = nowISO();
        }
      }
      persist(state);
    },

    convertToSubtask(state, action: PayloadAction<{ taskId: string; parentTaskId: string }>) {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.parentTaskId = action.payload.parentTaskId;
        task.updatedAt = nowISO();
        persist(state);
      }
    },

    convertToTask(state, action: PayloadAction<string>) {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.parentTaskId = undefined;
        task.updatedAt = nowISO();
        persist(state);
      }
    },

    // Bulk operations
    setSelectedTasks(state, action: PayloadAction<string[]>) {
      state.selectedTaskIds = action.payload;
    },

    toggleTaskSelection(state, action: PayloadAction<string>) {
      const idx = state.selectedTaskIds.indexOf(action.payload);
      if (idx === -1) state.selectedTaskIds.push(action.payload);
      else state.selectedTaskIds.splice(idx, 1);
    },

    clearSelection(state) {
      state.selectedTaskIds = [];
    },

    bulkUpdateStatus(state, action: PayloadAction<{ taskIds: string[]; status: TaskStatus }>) {
      for (const id of action.payload.taskIds) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
          task.status = action.payload.status;
          task.updatedAt = nowISO();
        }
      }
      state.selectedTaskIds = [];
      persist(state);
    },

    bulkUpdateAssignee(state, action: PayloadAction<{ taskIds: string[]; assigneeId: string | undefined }>) {
      for (const id of action.payload.taskIds) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
          task.assigneeId = action.payload.assigneeId;
          task.updatedAt = nowISO();
        }
      }
      state.selectedTaskIds = [];
      persist(state);
    },

    bulkDelete(state, action: PayloadAction<string[]>) {
      state.tasks = state.tasks.filter(t => !action.payload.includes(t.id));
      state.selectedTaskIds = [];
      persist(state);
    },

    // Undo / Redo
    undo(state) {
      const entry = state.undoStack.pop();
      if (!entry) return;

      if (entry.type === 'delete') {
        // Restore deleted task
        state.redoStack.push({ type: 'delete', taskSnapshot: entry.taskSnapshot, description: entry.description });
        state.tasks.push(entry.taskSnapshot);
      } else if (entry.type === 'create') {
        // Remove created task
        const current = state.tasks.find(t => t.id === entry.taskSnapshot.id);
        if (current) {
          state.redoStack.push({ type: 'create', taskSnapshot: { ...current }, description: entry.description });
        }
        state.tasks = state.tasks.filter(t => t.id !== entry.taskSnapshot.id);
      } else {
        // Restore previous snapshot
        const current = state.tasks.find(t => t.id === entry.taskSnapshot.id);
        if (current) {
          state.redoStack.push({ type: entry.type, taskSnapshot: { ...current }, description: entry.description });
          Object.assign(current, entry.taskSnapshot);
        }
      }
      persist(state);
    },

    redo(state) {
      const entry = state.redoStack.pop();
      if (!entry) return;

      if (entry.type === 'delete') {
        state.undoStack.push({ type: 'delete', taskSnapshot: entry.taskSnapshot, description: entry.description });
        state.tasks = state.tasks.filter(t => t.id !== entry.taskSnapshot.id);
      } else if (entry.type === 'create') {
        state.undoStack.push({ type: 'create', taskSnapshot: entry.taskSnapshot, description: entry.description });
        state.tasks.push(entry.taskSnapshot);
      } else {
        const current = state.tasks.find(t => t.id === entry.taskSnapshot.id);
        if (current) {
          state.undoStack.push({ type: entry.type, taskSnapshot: { ...current }, description: entry.description });
          Object.assign(current, entry.taskSnapshot);
        }
      }
      persist(state);
    },

    addAttachmentId(state, action: PayloadAction<{ taskId: string; attachmentId: string }>) {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.attachmentIds.push(action.payload.attachmentId);
        task.updatedAt = nowISO();
        persist(state);
      }
    },

    removeAttachmentId(state, action: PayloadAction<{ taskId: string; attachmentId: string }>) {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.attachmentIds = task.attachmentIds.filter(id => id !== action.payload.attachmentId);
        task.updatedAt = nowISO();
        persist(state);
      }
    },

    resetTasks(state) {
      state.tasks = [...MOCK_TASKS];
      state.selectedTaskIds = [];
      state.undoStack = [];
      state.redoStack = [];
      persist(state);
    },

    loadTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
      persist(state);
    },
  },
});

export const {
  createTask, updateTask, deleteTask, duplicateTask, moveTask, reorderTasks,
  convertToSubtask, convertToTask,
  setSelectedTasks, toggleTaskSelection, clearSelection,
  bulkUpdateStatus, bulkUpdateAssignee, bulkDelete,
  undo, redo,
  addAttachmentId, removeAttachmentId,
  resetTasks, loadTasks,
} = taskSlice.actions;
export default taskSlice.reducer;
