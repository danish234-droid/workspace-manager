import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthSession } from '@/types';
import { MOCK_USERS, MOCK_CREDENTIALS } from '@/lib/mockData';
import { getFromStorage, setToStorage, removeFromStorage, STORAGE_KEYS } from '@/utils/persistence';
import { generateId } from '@/utils/id';
import { nowISO } from '@/utils/date';
import { setAuthToken, removeAuthToken } from '@/lib/api';

interface AuthState {
  currentUser: User | null;
  session: AuthSession | null;
  users: User[];
  isAuthenticated: boolean;
  loginError: string | null;
  isLoading: boolean;
}

function loadInitialState(): AuthState {
  const session = getFromStorage<AuthSession | null>(STORAGE_KEYS.AUTH_SESSION, null);
  const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, MOCK_USERS);
  let currentUser = getFromStorage<User | null>('wm_current_user', null);
  let isAuthenticated = false;

  if (session) {
    if (!currentUser) {
      currentUser = users.find(u => u.id === session.userId) ?? users[0] ?? null;
    }
    isAuthenticated = !!currentUser;
  }

  return { currentUser, session, users, isAuthenticated, loginError: null, isLoading: false };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    setAuthSession(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      const { user, token } = action.payload;
      const session: AuthSession = {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      state.currentUser = user;
      state.session = session;
      state.isAuthenticated = true;
      state.loginError = null;
      state.isLoading = false;

      setToStorage(STORAGE_KEYS.AUTH_SESSION, session);
      setToStorage('wm_current_user', user);
      setAuthToken(token);

      const existsIdx = state.users.findIndex(u => u.id === user.id || u.email === user.email);
      if (existsIdx >= 0) {
        state.users[existsIdx] = user;
      } else {
        state.users.push(user);
      }
      setToStorage(STORAGE_KEYS.USERS, state.users);
    },

    setLoginError(state, action: PayloadAction<string>) {
      state.loginError = action.payload;
      state.isLoading = false;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

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

      const token = generateId('tok');
      const session: AuthSession = {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      state.currentUser = user;
      state.session = session;
      state.isAuthenticated = true;
      state.loginError = null;
      setToStorage(STORAGE_KEYS.AUTH_SESSION, session);
      setToStorage('wm_current_user', user);
      setAuthToken(token);
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
      (MOCK_CREDENTIALS as Record<string, string>)[email] = password;

      const token = generateId('tok');
      const session: AuthSession = {
        userId: newUser.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      state.currentUser = newUser;
      state.session = session;
      state.isAuthenticated = true;
      state.loginError = null;
      setToStorage(STORAGE_KEYS.AUTH_SESSION, session);
      setToStorage(STORAGE_KEYS.USERS, state.users);
      setAuthToken(token);
    },

    logout(state) {
      state.currentUser = null;
      state.session = null;
      state.isAuthenticated = false;
      state.loginError = null;
      removeFromStorage(STORAGE_KEYS.AUTH_SESSION);
      removeFromStorage('wm_current_user');
      removeAuthToken();
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

      const token = generateId('tok');
      const session: AuthSession = {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      state.currentUser = user;
      state.session = session;
      state.isAuthenticated = true;
      state.loginError = null;
      setToStorage(STORAGE_KEYS.AUTH_SESSION, session);
      setToStorage('wm_current_user', user);
      setAuthToken(token);
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
      removeAuthToken();
      setToStorage(STORAGE_KEYS.USERS, MOCK_USERS);
    },
  },
});

export const {
  setAuthSession,
  setLoginError,
  setLoading,
  login,
  signup,
  logout,
  updateProfile,
  switchUser,
  clearLoginError,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
