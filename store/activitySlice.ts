import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Activity, ActivityAction } from '@/types';
import { MOCK_ACTIVITIES } from '@/lib/mockData';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/utils/persistence';
import { generateId } from '@/utils/id';
import { nowISO } from '@/utils/date';

interface ActivityState {
  activities: Activity[];
}

function loadInitialState(): ActivityState {
  return {
    activities: getFromStorage(STORAGE_KEYS.ACTIVITIES, MOCK_ACTIVITIES),
  };
}

const persist = (state: ActivityState) => {
  setToStorage(STORAGE_KEYS.ACTIVITIES, state.activities);
};

const activitySlice = createSlice({
  name: 'activity',
  initialState: loadInitialState(),
  reducers: {
    addActivity(state, action: PayloadAction<{
      workspaceId: string;
      projectId?: string;
      taskId?: string;
      actorId: string;
      action: ActivityAction;
      metadata: Record<string, unknown>;
    }>) {
      state.activities.unshift({
        id: generateId('act'),
        workspaceId: action.payload.workspaceId,
        projectId: action.payload.projectId,
        taskId: action.payload.taskId,
        actorId: action.payload.actorId,
        action: action.payload.action,
        metadata: action.payload.metadata,
        createdAt: nowISO(),
      });
      // Keep last 500 activities
      if (state.activities.length > 500) {
        state.activities = state.activities.slice(0, 500);
      }
      persist(state);
    },

    resetActivities(state) {
      state.activities = [...MOCK_ACTIVITIES];
      persist(state);
    },

    loadActivities(state, action: PayloadAction<Activity[]>) {
      state.activities = action.payload;
      persist(state);
    },
  },
});

export const { addActivity, resetActivities, loadActivities } = activitySlice.actions;
export default activitySlice.reducer;
