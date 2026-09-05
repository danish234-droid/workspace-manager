import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import workspaceReducer from './workspaceSlice';
import projectReducer from './projectSlice';
import taskReducer from './taskSlice';
import commentReducer from './commentSlice';
import activityReducer from './activitySlice';
import notificationReducer from './notificationSlice';
import settingsReducer from './settingsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    project: projectReducer,
    task: taskReducer,
    comment: commentReducer,
    activity: activityReducer,
    notification: notificationReducer,
    settings: settingsReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
