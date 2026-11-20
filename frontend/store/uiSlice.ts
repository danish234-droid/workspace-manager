import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ToastItem } from '@/types';
import { generateId } from '@/utils/id';

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  commandPaletteOpen: boolean;
  globalSearchOpen: boolean;
  activeModal: string | null;
  toasts: ToastItem[];
  isOnline: boolean;
  isSyncing: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  mobileSidebarOpen: false,
  commandPaletteOpen: false,
  globalSearchOpen: false,
  activeModal: null,
  toasts: [],
  isOnline: true,
  isSyncing: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },

    toggleMobileSidebar(state) {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },

    setMobileSidebarOpen(state, action: PayloadAction<boolean>) {
      state.mobileSidebarOpen = action.payload;
    },

    toggleCommandPalette(state) {
      state.commandPaletteOpen = !state.commandPaletteOpen;
    },

    setCommandPaletteOpen(state, action: PayloadAction<boolean>) {
      state.commandPaletteOpen = action.payload;
    },

    toggleGlobalSearch(state) {
      state.globalSearchOpen = !state.globalSearchOpen;
    },

    setGlobalSearchOpen(state, action: PayloadAction<boolean>) {
      state.globalSearchOpen = action.payload;
    },

    setActiveModal(state, action: PayloadAction<string | null>) {
      state.activeModal = action.payload;
    },

    addToast(state, action: PayloadAction<Omit<ToastItem, 'id'>>) {
      state.toasts.push({
        ...action.payload,
        id: generateId('toast'),
      });
    },

    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },

    clearToasts(state) {
      state.toasts = [];
    },

    setOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },

    setSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
    },
  },
});

export const {
  toggleSidebar, setSidebarOpen,
  toggleMobileSidebar, setMobileSidebarOpen,
  toggleCommandPalette, setCommandPaletteOpen,
  toggleGlobalSearch, setGlobalSearchOpen,
  setActiveModal, addToast, removeToast, clearToasts,
  setOnline, setSyncing,
} = uiSlice.actions;
export default uiSlice.reducer;
