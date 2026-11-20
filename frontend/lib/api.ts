const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Allow relative fallback if backend URL is not reachable or endpoint starts with /api
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    // If backend server on port 5000 is down and endpoint was for auth, try local Next.js route fallback
    if (error.message?.includes('Failed to fetch') && !endpoint.startsWith('/api')) {
      try {
        const localUrl = `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        const localRes = await fetch(localUrl, { ...options, headers });
        const localData = await localRes.json().catch(() => ({}));
        if (!localRes.ok) {
          throw new Error(localData.error || localData.message || 'Request failed');
        }
        return localData as T;
      } catch {
        throw error;
      }
    }
    throw error;
  }
}

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: { name: string; email: string; password: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  socialLogin: (payload: { provider: 'google' | 'github'; email?: string; name?: string; avatarUrl?: string }) =>
    apiRequest('/auth/social', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => apiRequest('/auth/me', { method: 'GET' }),

  logout: () => {
    removeAuthToken();
    return apiRequest('/auth/logout', { method: 'POST' }).catch(() => ({}));
  },

  updateProfile: (profile: { name?: string; bio?: string; avatarUrl?: string }) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
};

// ─── Workspaces API ──────────────────────────────────────────────────────────
export const workspaceApi = {
  getAll: () => apiRequest('/workspaces', { method: 'GET' }),
  getById: (id: string) => apiRequest(`/workspaces/${id}`, { method: 'GET' }),
  create: (data: any) =>
    apiRequest('/workspaces', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiRequest(`/workspaces/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest(`/workspaces/${id}`, { method: 'DELETE' }),
  inviteMember: (id: string, data: { userId: string; role?: string }) =>
    apiRequest(`/workspaces/${id}/members`, { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Projects API ────────────────────────────────────────────────────────────
export const projectApi = {
  getByWorkspace: (workspaceId: string) =>
    apiRequest(`/projects?workspaceId=${workspaceId}`, { method: 'GET' }),
  getById: (id: string) => apiRequest(`/projects/${id}`, { method: 'GET' }),
  create: (data: any) =>
    apiRequest('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiRequest(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),
};

// ─── Tasks API ───────────────────────────────────────────────────────────────
export const taskApi = {
  getByProject: (projectId: string) =>
    apiRequest(`/tasks?projectId=${projectId}`, { method: 'GET' }),
  getById: (id: string) => apiRequest(`/tasks/${id}`, { method: 'GET' }),
  create: (data: any) =>
    apiRequest('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiRequest(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),
};

export default {
  auth: authApi,
  workspaces: workspaceApi,
  projects: projectApi,
  tasks: taskApi,
};
