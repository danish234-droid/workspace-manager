import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Notification, NotificationType } from '@/types';
import { MOCK_NOTIFICATIONS } from '@/lib/mockData';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/utils/persistence';
import { generateId } from '@/utils/id';
import { nowISO } from '@/utils/date';

interface NotificationState {
  notifications: Notification[];
}

function loadInitialState(): NotificationState {
  return {
    notifications: getFromStorage(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS),
  };
}

const persist = (state: NotificationState) => {
  setToStorage(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState: loadInitialState(),
  reducers: {
    addNotification(state, action: PayloadAction<{
      userId: string;
      type: NotificationType;
      title: string;
      message: string;
      taskId?: string;
      projectId?: string;
      workspaceId?: string;
    }>) {
      state.notifications.unshift({
        id: generateId('notif'),
        userId: action.payload.userId,
        type: action.payload.type,
        title: action.payload.title,
        message: action.payload.message,
        taskId: action.payload.taskId,
        projectId: action.payload.projectId,
        workspaceId: action.payload.workspaceId,
        read: false,
        createdAt: nowISO(),
      });
      // Cap at 100 notifications
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
      persist(state);
    },

    markAsRead(state, action: PayloadAction<string>) {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif) {
        notif.read = true;
        persist(state);
      }
    },

    markAllAsRead(state, action: PayloadAction<string>) {
      for (const notif of state.notifications) {
        if (notif.userId === action.payload) {
          notif.read = true;
        }
      }
      persist(state);
    },

    deleteNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      persist(state);
    },

    resetNotifications(state) {
      state.notifications = [...MOCK_NOTIFICATIONS];
      persist(state);
    },

    loadNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
      persist(state);
    },
  },
});

export const {
  addNotification, markAsRead, markAllAsRead, deleteNotification,
  resetNotifications, loadNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
