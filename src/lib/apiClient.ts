import type { Category, Client, Task } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? '';
const TOKEN_KEY = 'shinobi_auth_token';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function decodeUserId(token: string): string | null {
  try {
    const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(payloadBase64));
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let errorCode = 'request_failed';
    try {
      const body = await res.json();
      errorCode = body.error ?? errorCode;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(errorCode, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

interface AuthResponse {
  token: string;
  userId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

interface SyncResponse {
  categories: Category[];
  clients: Client[];
  tasks: Task[];
}

export const api = {
  signUp: (email: string, password: string) =>
    request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) }),

  signIn: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  fetchSync: () => request<SyncResponse>('/sync'),

  migrate: (payload: SyncResponse) =>
    request<SyncResponse>('/migrate', { method: 'POST', body: JSON.stringify(payload) }),

  createCategory: (category: Category) =>
    request('/categories', { method: 'POST', body: JSON.stringify(category) }),
  updateCategory: (id: string, changes: Partial<Pick<Category, 'name' | 'color'>> & { position?: number }) =>
    request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(changes) }),
  deleteCategory: (id: string) => request(`/categories/${id}`, { method: 'DELETE' }),

  createClient: (client: Client) => request('/clients', { method: 'POST', body: JSON.stringify(client) }),
  updateClient: (id: string, name: string) =>
    request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteClient: (id: string) => request(`/clients/${id}`, { method: 'DELETE' }),

  createTask: (task: Task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>) =>
    request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) }),
  deleteTask: (id: string) => request(`/tasks/${id}`, { method: 'DELETE' }),

  getProfile: () => request<UserProfile>('/me'),
  updateProfile: (changes: Partial<Pick<UserProfile, 'name' | 'avatar'>>) =>
    request<UserProfile>('/me', { method: 'PUT', body: JSON.stringify(changes) }),
  changeEmail: (newEmail: string, currentPassword: string) =>
    request<UserProfile>('/me/email', { method: 'PUT', body: JSON.stringify({ newEmail, currentPassword }) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request('/me/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
};
