import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AlarmItem,
  Attachment,
  Category,
  Client,
  Lang,
  Recurrence,
  Task,
  Theme,
  WeatherCity,
} from '../types';
import { nextDueDate, toISODate } from '../utils/date';
import { translations } from '../i18n/translations';
import { api } from '../lib/apiClient';

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function detectInitialLang(): Lang {
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'pt';
}

function getDefaultCategories(lang: Lang): Category[] {
  const t = translations[lang];
  return [
    { id: 'artigos', name: t.defaultCategoryArticles, color: '#3b82f6' },
    { id: 'gbp', name: t.defaultCategoryGbp, color: '#f97316' },
    { id: 'financeiro', name: t.defaultCategoryFinance, color: '#22c55e' },
  ];
}

function fireAndForget(promise: Promise<unknown>) {
  promise.catch((err) => console.error('Cloud sync failed:', err));
}

const MAX_ALARMS = 5;
const MAX_WEATHER_CITIES = 5;

interface NewTaskInput {
  title: string;
  notes?: string;
  categoryIds: string[];
  clientId: string | null;
  dueDate: string;
  recurrence: Recurrence;
  pinned: boolean;
  attachments: Attachment[];
}

interface CloudData {
  categories: Category[];
  clients: Client[];
  tasks: Task[];
}

interface AppState {
  userId: string | null;
  categories: Category[];
  clients: Client[];
  tasks: Task[];
  theme: Theme;
  language: Lang;
  alarms: AlarmItem[];
  weatherCities: WeatherCity[];
  selectedWeatherCityId: string | null;

  setUserId: (userId: string | null) => void;
  setCloudData: (data: CloudData) => void;

  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, changes: Partial<Pick<Category, 'name' | 'color'>>) => void;
  removeCategory: (id: string) => void;

  addClient: (name: string) => void;
  updateClient: (id: string, name: string) => void;
  removeClient: (id: string) => void;

  addTask: (input: NewTaskInput) => void;
  updateTask: (id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  removeTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  toggleTaskPinned: (id: string) => void;

  addAlarm: () => void;
  updateAlarm: (id: string, changes: Partial<Omit<AlarmItem, 'id'>>) => void;
  removeAlarm: (id: string) => void;

  addWeatherCity: (name: string, latitude: number, longitude: number) => void;
  removeWeatherCity: (id: string) => void;
  setSelectedWeatherCityId: (id: string | null) => void;

  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleLanguage: () => void;
  setLanguage: (language: Lang) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userId: null,
      categories: getDefaultCategories(detectInitialLang()),
      clients: [],
      tasks: [],
      theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      language: detectInitialLang(),
      alarms: [],
      weatherCities: [],
      selectedWeatherCityId: null,

      setUserId: (userId) => {
        if (!userId) {
          // Signed out: clear cloud-backed data so the next login (possibly a
          // different account on a shared device) starts from a clean slate.
          set({ userId: null, categories: [], clients: [], tasks: [] });
        } else {
          set({ userId });
        }
      },

      setCloudData: ({ categories, clients, tasks }) => set({ categories, clients, tasks }),

      addCategory: (name, color) => {
        const id = uid();
        set((state) => ({
          categories: [...state.categories, { id, name, color }],
        }));
        if (get().userId) fireAndForget(api.createCategory({ id, name, color }));
      },

      updateCategory: (id, changes) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...changes } : c)),
        }));
        if (get().userId) fireAndForget(api.updateCategory(id, changes));
      },

      removeCategory: (id) => {
        const affectedTaskIds = get()
          .tasks.filter((t) => t.categoryIds.includes(id))
          .map((t) => t.id);

        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          tasks: state.tasks.map((t) =>
            t.categoryIds.includes(id)
              ? { ...t, categoryIds: t.categoryIds.filter((c) => c !== id) }
              : t,
          ),
        }));

        if (get().userId) {
          fireAndForget(api.deleteCategory(id));
          const updatedTasks = get().tasks;
          for (const taskId of affectedTaskIds) {
            const task = updatedTasks.find((t) => t.id === taskId);
            if (task) fireAndForget(api.updateTask(taskId, { categoryIds: task.categoryIds }));
          }
        }
      },

      addClient: (name) => {
        const id = uid();
        set((state) => ({
          clients: [...state.clients, { id, name }],
        }));
        if (get().userId) fireAndForget(api.createClient({ id, name }));
      },

      updateClient: (id, name) => {
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, name } : c)),
        }));
        if (get().userId) fireAndForget(api.updateClient(id, name));
      },

      removeClient: (id) => {
        const affectedTaskIds = get()
          .tasks.filter((t) => t.clientId === id)
          .map((t) => t.id);

        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
          tasks: state.tasks.map((t) => (t.clientId === id ? { ...t, clientId: null } : t)),
        }));

        if (get().userId) {
          fireAndForget(api.deleteClient(id));
          for (const taskId of affectedTaskIds) {
            fireAndForget(api.updateTask(taskId, { clientId: null }));
          }
        }
      },

      addTask: ({ title, notes, categoryIds, clientId, dueDate, recurrence, pinned, attachments }) => {
        const newTask: Task = {
          id: uid(),
          title,
          notes,
          categoryIds,
          clientId,
          dueDate,
          recurrence,
          pinned,
          attachments,
          completed: false,
          createdAt: toISODate(new Date()),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        if (get().userId) fireAndForget(api.createTask(newTask));
      },

      updateTask: (id, changes) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...changes } : t)),
        }));
        if (get().userId) fireAndForget(api.updateTask(id, changes));
      },

      removeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
        if (get().userId) fireAndForget(api.deleteTask(id));
      },

      toggleTaskCompleted: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const willComplete = !task.completed;

        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: willComplete } : t)),
        }));
        if (get().userId) fireAndForget(api.updateTask(id, { completed: willComplete }));

        if (willComplete && task.recurrence !== 'none') {
          const nextTask: Task = {
            id: uid(),
            title: task.title,
            notes: task.notes,
            categoryIds: task.categoryIds,
            clientId: task.clientId,
            dueDate: nextDueDate(task.dueDate, task.recurrence),
            recurrence: task.recurrence,
            completed: false,
            pinned: false,
            attachments: [],
            createdAt: toISODate(new Date()),
          };
          set((state) => ({ tasks: [...state.tasks, nextTask] }));
          if (get().userId) fireAndForget(api.createTask(nextTask));
        }
      },

      toggleTaskPinned: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const pinned = !task.pinned;
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, pinned } : t)),
        }));
        if (get().userId) fireAndForget(api.updateTask(id, { pinned }));
      },

      addAlarm: () =>
        set((state) => {
          if (state.alarms.length >= MAX_ALARMS) return state;
          const newAlarm: AlarmItem = {
            id: uid(),
            time: '07:00',
            reason: '',
            enabled: false,
            soundId: 'classic',
          };
          return { alarms: [...state.alarms, newAlarm] };
        }),

      updateAlarm: (id, changes) =>
        set((state) => ({
          alarms: state.alarms.map((a) => (a.id === id ? { ...a, ...changes } : a)),
        })),

      removeAlarm: (id) =>
        set((state) => ({
          alarms: state.alarms.filter((a) => a.id !== id),
        })),

      addWeatherCity: (name, latitude, longitude) =>
        set((state) => {
          if (state.weatherCities.length >= MAX_WEATHER_CITIES) return state;
          const city: WeatherCity = { id: uid(), name, latitude, longitude };
          return {
            weatherCities: [...state.weatherCities, city],
            selectedWeatherCityId: state.selectedWeatherCityId ?? city.id,
          };
        }),

      removeWeatherCity: (id) =>
        set((state) => {
          const weatherCities = state.weatherCities.filter((c) => c.id !== id);
          const selectedWeatherCityId =
            state.selectedWeatherCityId === id
              ? (weatherCities[0]?.id ?? null)
              : state.selectedWeatherCityId;
          return { weatherCities, selectedWeatherCityId };
        }),

      setSelectedWeatherCityId: (id) => set({ selectedWeatherCityId: id }),

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      setTheme: (theme) => set({ theme }),

      toggleLanguage: () =>
        set((state) => ({ language: state.language === 'pt' ? 'en' : 'pt' })),

      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'lembretes-app-storage',
      partialize: (state) => {
        // userId is never persisted directly — the auth token (which encodes
        // it) is the source of truth in localStorage, restored via useAuth.
        const { userId: _userId, ...rest } = state;
        return rest;
      },
    },
  ),
);
