import { Paperclip, Pencil, Repeat, Star, Trash2, User } from 'lucide-react';
import type { Category, Client, Task } from '../types';
import { formatDueDate, formatRelativeDays, getRecurrenceLabel, getUrgency } from '../utils/date';
import { useAppStore } from '../store/useAppStore';
import { useLang, useT } from '../i18n/useT';

interface TaskCardProps {
  task: Task;
  categories: Category[];
  clients: Client[];
  onEdit: () => void;
}

const urgencyStyles: Record<string, string> = {
  overdue: 'border-red-400/60 bg-red-50 dark:bg-red-950/30',
  today: 'border-orange-400/60 bg-orange-50 dark:bg-orange-950/30',
  soon: 'border-yellow-400/60 bg-yellow-50 dark:bg-yellow-950/20',
  later: 'border-slate-200 dark:border-slate-800',
  done: 'border-slate-200 opacity-60 dark:border-slate-800',
};

const urgencyTextStyles: Record<string, string> = {
  overdue: 'text-red-600 dark:text-red-400',
  today: 'text-orange-600 dark:text-orange-400',
  soon: 'text-yellow-700 dark:text-yellow-400',
  later: 'text-slate-500 dark:text-slate-400',
  done: 'text-slate-400',
};

export function TaskCard({ task, categories, clients, onEdit }: TaskCardProps) {
  const t = useT();
  const lang = useLang();
  const toggleTaskCompleted = useAppStore((s) => s.toggleTaskCompleted);
  const toggleTaskPinned = useAppStore((s) => s.toggleTaskPinned);
  const removeTask = useAppStore((s) => s.removeTask);
  const urgency = getUrgency(task.dueDate, task.completed);

  return (
    <div
      className={`flex min-h-64 flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm transition dark:bg-[#181a20] ${urgencyStyles[urgency]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <label className="flex flex-1 items-start gap-2">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTaskCompleted(task.id)}
            className="mt-1 size-4 shrink-0 accent-blue-600"
          />
          <span className={`font-medium ${task.completed ? 'line-through text-slate-400' : ''}`}>
            {task.title}
          </span>
        </label>
        <button
          onClick={() => toggleTaskPinned(task.id)}
          aria-label={task.pinned ? t.taskCardRemoveFromPriorities : t.taskCardMarkAsPriority}
          className="shrink-0 rounded-md p-1 text-slate-300 hover:bg-slate-100 dark:text-slate-600 dark:hover:bg-slate-800"
        >
          <Star size={18} className={task.pinned ? 'fill-orange-400 text-orange-400' : ''} />
        </button>
      </div>

      {task.notes && <p className="text-sm text-slate-500 dark:text-slate-400">{task.notes}</p>}

      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
        {categories.map((category) => (
          <span
            key={category.id}
            className="rounded-full px-2 py-0.5 font-medium text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
        ))}
        {clients.map((client) => (
          <span
            key={client.id}
            className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {client.logo ? (
              <img src={client.logo} alt="" className="size-3 shrink-0 rounded-full object-cover" />
            ) : (
              <User size={12} />
            )}
            {client.name}
          </span>
        ))}
        {task.recurrence !== 'none' && (
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Repeat size={12} />
            {getRecurrenceLabel(task.recurrence, t)}
          </span>
        )}
        {task.attachments.length > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Paperclip size={12} />
            {task.attachments.length}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-2">
        <div>
          <div className={`text-sm font-medium ${urgencyTextStyles[urgency]}`}>
            {formatDueDate(task.dueDate, lang)} ·{' '}
            {formatRelativeDays(task.dueDate, task.completed, t, task.dueTime)}
          </div>
          {task.dueTimeLabel && !task.completed && (
            <p className="text-xs text-slate-400">{task.dueTimeLabel}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            aria-label={t.taskCardEdit}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => removeTask(task.id)}
            aria-label={t.taskCardDelete}
            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
