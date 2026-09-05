import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthSession } from '@/types';
import { MOCK_USERS, MOCK_CREDENTIALS } from '@/lib/mockData';
import { getFromStorage, setToStorage, removeFromStorage, STORAGE_KEYS } from '@/utils/persistence';
import { generateId } from '@/utils/id';
import { nowISO } from '@/utils/date';

interface AuthState {
  currentUser: User | null;
  session: AuthSession | null;
  users: User[];
  isAuthenticated: boolean;
  loginError: string | null;
}

function loadInitialState(): AuthState {
  const session = getFromStorage<AuthSession | null>(STORAGE_KEYS.AUTH_SESSION, null);
  const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, MOCK_USERS);
  let currentUser: User | null = null;
  let isAuthenticated = false;

  if (session) {
    currentUser = users.find(u => u.id === session.userId) ?? null;
    isAuthenticated = !!currentUser;
  }

  return { currentUser, session, users, isAuthenticated, loginError: null };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    login(state, action: PayloadAction<{ email: string; password: string }>) {
      const { email, password } = action.payload;
      const correctPassword = MOCK_CREDENTIALS[email];

      if (!correctPassword || correctPassword !== password) {
        state.loginError = 'Invalid email or password.';
        return;
      }

      const user = state.users.find(u => u.email === email);
      if (!user) {
        state.loginError = 'User not found.';
        return;
      }

      const session: AuthSession = {
        userId: user.id,
        token: generateId('tok'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      state.currentUser = user;
      state.session = session;
      state.isAuthenticated = true;
      state.loginError = null;
      setToStorage(STORAGE_KEYS.AUTH_SESSION, session);
    },

    signup(state, action: PayloadAction<{ name: string; email: string; password: string }>) {
      const { name, email, password } = action.payload;

      if (state.users.some(u => u.email === email)) {
        state.loginError = 'An account with this email already exists.';
        return;
      }

      const newUser: User = {
        id: generateId('user'),
        name,
        email,
        avatarColor: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };

      state.users.push(newUser);

      // Store password in credentials (mock)
      (MOCK_CREDENTIALS as Record<string, string>)[email] = password;

      const session: AuthSession = {
        userId: newUser.id,
        token: generateId('tok'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      state.currentUser = newUser;
      state.session = session;
      state.isAuthenticated = true;
      state.loginError = null;
      setToStorage(STORAGE_KEYS.AUTH_SESSION, session);
      setToStorage(STORAGE_KEYS.USERS, state.users);
    },

    logout(state) {
      state.currentUser = null;
      state.session = null;
      state.isAuthenticated = false;
      state.loginError = null;
      removeFromStorage(STORAGE_KEYS.AUTH_SESSION);
    },

    updateProfile(state, action: PayloadAction<{ name?: string; email?: string; avatarUrl?: string }>) {
      if (!state.currentUser) return;
      const updates = action.payload;
      if (updates.name) state.currentUser.name = updates.name;
      if (updates.email) state.currentUser.email = updates.email;
      if (updates.avatarUrl !== undefined) state.currentUser.avatarUrl = updates.avatarUrl;
      state.currentUser.updatedAt = nowISO();

      const idx = state.users.findIndex(u => u.id === state.currentUser!.id);
      if (idx !== -1) state.users[idx] = { ...state.currentUser };
      setToStorage(STORAGE_KEYS.USERS, state.users);
    },

    switchUser(state, action: PayloadAction<string>) {
      const user = state.users.find(u => u.id === action.payload);
      if (!user) return;

      const session: AuthSession = {
        userId: user.id,
        token: generateId('tok'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      state.currentUser = user;
      state.session = session;
      state.isAuthenticated = true;
      state.loginError = null;
      setToStorage(STORAGE_KEYS.AUTH_SESSION, session);
    },

    clearLoginError(state) {
      state.loginError = null;
    },

    resetAuth(state) {
      state.users = [...MOCK_USERS];
      state.currentUser = null;
      state.session = null;
      state.isAuthenticated = false;
      state.loginError = null;
      removeFromStorage(STORAGE_KEYS.AUTH_SESSION);
      setToStorage(STORAGE_KEYS.USERS, MOCK_USERS);
    },
  },
});

export const { login, signup, logout, updateProfile, switchUser, clearLoginError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
