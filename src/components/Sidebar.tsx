import { LayoutGrid, Settings2, Star } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { TaskFilter } from '../types';
import { useT } from '../i18n/useT';

interface SidebarProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  onManageCategories: () => void;
}

export function Sidebar({ filter, onFilterChange, onManageCategories }: SidebarProps) {
  const t = useT();
  const categories = useAppStore((s) => s.categories);
  const tasks = useAppStore((s) => s.tasks);

  const activeTasks = tasks.filter((t) => !t.completed);
  const priorityCount = activeTasks.filter((t) => t.pinned).length;

  const isActive = (f: TaskFilter) =>
    f.kind === 'category' && filter.kind === 'category'
      ? f.categoryId === filter.categoryId
      : f.kind === filter.kind;

  const isPriorityActive = isActive({ kind: 'urgent' });

  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#16171d] md:w-60 md:border-b-0 md:border-r">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.sidebarCategories}</h2>
        <button
          onClick={onManageCategories}
          aria-label={t.sidebarManageCategories}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Settings2 size={16} />
        </button>
      </div>

      <nav className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        <button
          onClick={() => onFilterChange({ kind: 'all' })}
          className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
            isActive({ kind: 'all' })
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-2">
            <LayoutGrid size={16} /> {t.sidebarAll}
          </span>
          <span className="text-xs opacity-70">{activeTasks.length}</span>
        </button>

        <button
          onClick={() => onFilterChange({ kind: 'urgent' })}
          className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
            isPriorityActive
              ? 'bg-orange-500 text-white'
              : 'text-orange-500 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30'
          }`}
        >
          <span className="flex items-center gap-2">
            <Star size={16} /> {t.sidebarPriorities}
          </span>
          <span className="text-xs opacity-70" title={t.sidebarPrioritiesHint}>
            {priorityCount}
          </span>
        </button>

        <div className="my-2 hidden border-t border-slate-100 dark:border-slate-800 md:block" />

        {categories.map((category) => {
          const count = activeTasks.filter((t) => t.categoryIds.includes(category.id)).length;
          const active = isActive({ kind: 'category', categoryId: category.id });
          return (
            <button
              key={category.id}
              onClick={() => onFilterChange({ kind: 'category', categoryId: category.id })}
              className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: active ? 'white' : category.color }}
                />
                {category.name}
              </span>
              <span className="text-xs opacity-70">{count}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
