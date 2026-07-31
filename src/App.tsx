import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import type { Task, TaskFilter } from './types';
import { useAuth } from './hooks/useAuth';
import { useT } from './i18n/useT';
import { api, type UserProfile } from './lib/apiClient';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskGrid } from './components/TaskGrid';
import { Footer } from './components/Footer';
import { TaskFormModal } from './components/TaskFormModal';
import { CategoryModal } from './components/CategoryModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthScreen } from './components/AuthScreen';

interface LocalSnapshot {
  categories: ReturnType<typeof useAppStore.getState>['categories'];
  clients: ReturnType<typeof useAppStore.getState>['clients'];
  tasks: ReturnType<typeof useAppStore.getState>['tasks'];
}

type LoadState = 'loading' | 'needs-import-decision' | 'ready';

function seedDefaultCategories(t: ReturnType<typeof useT>) {
  const { addCategory } = useAppStore.getState();
  addCategory(t.defaultCategoryArticles, '#3b82f6');
  addCategory(t.defaultCategoryGbp, '#f97316');
  addCategory(t.defaultCategoryFinance, '#22c55e');
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-[#0f1115]">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-sm dark:bg-[#181a20]">
        {children}
      </div>
    </div>
  );
}

function App() {
  const t = useT();
  const { userId } = useAuth();
  const theme = useAppStore((s) => s.theme);
  const tasks = useAppStore((s) => s.tasks);
  const setCloudData = useAppStore((s) => s.setCloudData);
  const justSignedUp = useAppStore((s) => s.justSignedUp);
  const setJustSignedUp = useAppStore((s) => s.setJustSignedUp);

  const [filter, setFilter] = useState<TaskFilter>({ kind: 'all' });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [loadState, setLoadState] = useState<LoadState>(userId ? 'loading' : 'ready');
  const [pendingLocalData, setPendingLocalData] = useState<LocalSnapshot | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (!justSignedUp) return;
    const timer = setTimeout(() => setJustSignedUp(false), 6000);
    return () => clearTimeout(timer);
  }, [justSignedUp, setJustSignedUp]);

  useEffect(() => {
    if (!userId) {
      setLoadState('ready');
      return;
    }

    let cancelled = false;
    setLoadState('loading');

    const localSnapshot: LocalSnapshot = {
      categories: useAppStore.getState().categories,
      clients: useAppStore.getState().clients,
      tasks: useAppStore.getState().tasks,
    };
    const hasLocalTasks = localSnapshot.tasks.length > 0;

    api
      .fetchSync()
      .then((data) => {
        if (cancelled) return;
        const cloudIsEmpty = data.categories.length === 0 && data.clients.length === 0 && data.tasks.length === 0;

        if (cloudIsEmpty && hasLocalTasks) {
          setPendingLocalData(localSnapshot);
          setLoadState('needs-import-decision');
          return;
        }

        setCloudData(data);
        if (cloudIsEmpty) seedDefaultCategories(t);
        setLoadState('ready');
      })
      .catch((err) => {
        console.error('Failed to load cloud data:', err);
        if (!cancelled) setLoadState('ready');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    api
      .getProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => console.error('Failed to load profile:', err));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const filteredTasks = useMemo(() => {
    if (filter.kind === 'all') return tasks;
    if (filter.kind === 'urgent') return tasks.filter((t) => t.pinned);
    return tasks.filter((t) => t.categoryIds.includes(filter.categoryId));
  }, [tasks, filter]);

  function handleEditTask(task: Task) {
    setEditingTask(task);
    setShowTaskForm(true);
  }

  function handleNewTask() {
    setEditingTask(null);
    setShowTaskForm(true);
  }

  async function handleImportLocalData() {
    if (!pendingLocalData) return;
    setLoadState('loading');
    try {
      const merged = await api.migrate(pendingLocalData);
      setCloudData(merged);
    } catch (err) {
      console.error('Failed to import local data:', err);
    } finally {
      setPendingLocalData(null);
      setLoadState('ready');
    }
  }

  function handleSkipImport() {
    setCloudData({ categories: [], clients: [], tasks: [] });
    seedDefaultCategories(t);
    setPendingLocalData(null);
    setLoadState('ready');
  }

  if (!userId) return <AuthScreen />;

  if (loadState === 'loading') {
    return (
      <CenteredCard>
        <p className="text-sm text-slate-400">{t.authLoadingCloudData}</p>
      </CenteredCard>
    );
  }

  if (loadState === 'needs-import-decision') {
    return (
      <CenteredCard>
        <h2 className="mb-2 text-base font-semibold">{t.authImportLocalTitle}</h2>
        <p className="mb-4 text-sm text-slate-400">{t.authImportLocalBody}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleImportLocalData}
            className="rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t.authImportLocalButton}
          </button>
          <button
            onClick={handleSkipImport}
            className="rounded-lg py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t.authImportLocalSkip}
          </button>
        </div>
      </CenteredCard>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header onNewTask={handleNewTask} profile={profile} onOpenProfile={() => setShowProfileModal(true)} />

      {justSignedUp && (
        <div className="flex items-center justify-between bg-green-50 px-6 py-2 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          <span>{t.authSignUpSuccess}</span>
          <button
            onClick={() => setJustSignedUp(false)}
            aria-label={t.modalClose}
            className="rounded p-1 hover:bg-green-100 dark:hover:bg-green-900/40"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar filter={filter} onFilterChange={setFilter} onManageCategories={() => setShowCategoryModal(true)} />

        <main className="flex-1 p-4 sm:p-6">
          <TaskGrid tasks={filteredTasks} onEditTask={handleEditTask} />
        </main>
      </div>

      <Footer />

      {showTaskForm && (
        <TaskFormModal
          task={editingTask ?? undefined}
          defaultCategoryIds={filter.kind === 'category' ? [filter.categoryId] : []}
          onClose={() => setShowTaskForm(false)}
        />
      )}

      {showCategoryModal && <CategoryModal onClose={() => setShowCategoryModal(false)} />}

      {showProfileModal && profile && (
        <ProfileModal profile={profile} onUpdate={setProfile} onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}

export default App;
