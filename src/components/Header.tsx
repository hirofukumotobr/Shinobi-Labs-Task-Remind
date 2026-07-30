import { LogOut, Moon, Plus, Sun } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n/useT';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onNewTask: () => void;
}

export function Header({ onNewTask }: HeaderProps) {
  const t = useT();
  const { signOut } = useAuth();
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const language = useAppStore((s) => s.language);
  const toggleLanguage = useAppStore((s) => s.toggleLanguage);

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-[#16171d]">
      <div>
        <h1 className="text-lg font-semibold">{t.headerTitle}</h1>
        <p className="text-xs text-slate-400">{t.headerSubtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewTask}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> {t.headerNewTask}
        </button>
        <button
          onClick={toggleLanguage}
          aria-label={t.headerToggleLanguage}
          className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {language === 'pt' ? 'EN' : 'PT'}
        </button>
        <button
          onClick={toggleTheme}
          aria-label={t.headerToggleTheme}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={signOut}
          aria-label={t.headerSignOut}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
