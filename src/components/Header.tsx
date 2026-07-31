import { LogOut, Plus, User } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n/useT';
import { useAuth } from '../hooks/useAuth';
import type { UserProfile } from '../lib/apiClient';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onNewTask: () => void;
  profile: UserProfile | null;
  onOpenProfile: () => void;
}

export function Header({ onNewTask, profile, onOpenProfile }: HeaderProps) {
  const t = useT();
  const { signOut } = useAuth();
  const language = useAppStore((s) => s.language);
  const toggleLanguage = useAppStore((s) => s.toggleLanguage);
  const firstName = profile?.name?.trim().split(/\s+/)[0];

  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-[#16171d] sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <h1 className="text-lg font-semibold">{t.headerTitle}</h1>
        <p className="text-xs text-slate-400">{t.headerSubtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {firstName && (
          <span className="mr-1 text-base font-semibold text-slate-700 dark:text-slate-200">
            {t.headerGreeting(firstName)}
          </span>
        )}
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
        <ThemeToggle />
        <button
          onClick={onOpenProfile}
          aria-label={t.headerOpenProfile}
          className="overflow-hidden rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {profile?.avatar ? (
            <img src={profile.avatar} alt="" className="-m-2 size-[34px] rounded-full object-cover" />
          ) : (
            <User size={18} />
          )}
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
