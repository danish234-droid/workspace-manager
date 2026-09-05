import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppSettings, Label, FilterPreset } from '@/types';
import { DEFAULT_SETTINGS, MOCK_LABELS } from '@/lib/mockData';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/utils/persistence';
import { generateId } from '@/utils/id';
import { nowISO } from '@/utils/date';

interface SettingsState {
  settings: AppSettings;
  labels: Label[];
  filterPresets: FilterPreset[];
}

function loadInitialState(): SettingsState {
  return {
    settings: getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
    labels: getFromStorage(STORAGE_KEYS.LABELS, MOCK_LABELS),
    filterPresets: getFromStorage(STORAGE_KEYS.FILTER_PRESETS, []),
  };
}

const persist = (state: SettingsState) => {
  setToStorage(STORAGE_KEYS.SETTINGS, state.settings);
  setToStorage(STORAGE_KEYS.LABELS, state.labels);
  setToStorage(STORAGE_KEYS.FILTER_PRESETS, state.filterPresets);
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadInitialState(),
  reducers: {
    updateSettings(state, action: PayloadAction<Partial<AppSettings>>) {
      Object.assign(state.settings, action.payload);
      persist(state);
    },

    setTheme(state, action: PayloadAction<'light' | 'dark' | 'system'>) {
      state.settings.theme = action.payload;
      persist(state);
    },

    toggleCompactMode(state) {
      state.settings.compactMode = !state.settings.compactMode;
      persist(state);
    },

    updateNotificationPreferences(state, action: PayloadAction<Partial<AppSettings['notificationPreferences']>>) {
      Object.assign(state.settings.notificationPreferences, action.payload);
      persist(state);
    },

    // Labels
    addLabel(state, action: PayloadAction<{ workspaceId: string; name: string; color: string }>) {
      state.labels.push({
        id: generateId('label'),
        workspaceId: action.payload.workspaceId,
        name: action.payload.name,
        color: action.payload.color,
      });
      persist(state);
    },

    updateLabel(state, action: PayloadAction<{ id: string; updates: Partial<Pick<Label, 'name' | 'color'>> }>) {
      const label = state.labels.find(l => l.id === action.payload.id);
      if (label) {
        Object.assign(label, action.payload.updates);
        persist(state);
      }
    },

    deleteLabel(state, action: PayloadAction<string>) {
      state.labels = state.labels.filter(l => l.id !== action.payload);
      persist(state);
    },

    // Filter Presets
    saveFilterPreset(state, action: PayloadAction<Omit<FilterPreset, 'id' | 'createdAt'>>) {
      state.filterPresets.push({
        ...action.payload,
        id: generateId('preset'),
        createdAt: nowISO(),
      });
      persist(state);
    },

    deleteFilterPreset(state, action: PayloadAction<string>) {
      state.filterPresets = state.filterPresets.filter(p => p.id !== action.payload);
      persist(state);
    },

    resetSettings(state) {
      state.settings = { ...DEFAULT_SETTINGS };
      state.labels = [...MOCK_LABELS];
      state.filterPresets = [];
      persist(state);
    },

    loadSettings(state, action: PayloadAction<{ settings: AppSettings; labels: Label[]; filterPresets: FilterPreset[] }>) {
      state.settings = action.payload.settings;
      state.labels = action.payload.labels;
      state.filterPresets = action.payload.filterPresets;
      persist(state);
    },
  },
});

export const {
  updateSettings, setTheme, toggleCompactMode, updateNotificationPreferences,
  addLabel, updateLabel, deleteLabel,
  saveFilterPreset, deleteFilterPreset,
  resetSettings, loadSettings,
} = settingsSlice.actions;
export default settingsSlice.reducer;
