import { useMemo } from 'react';
import type { Task } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n/useT';
import { TaskCard } from './TaskCard';

interface TaskGridProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export function TaskGrid({ tasks, onEditTask }: TaskGridProps) {
  const t = useT();
  const categories = useAppStore((s) => s.categories);
  const clients = useAppStore((s) => s.clients);

  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 p-12 text-slate-400 dark:border-slate-700">
        {t.taskGridEmpty}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sorted.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          categories={categories.filter((c) => task.categoryIds.includes(c.id))}
          client={clients.find((c) => c.id === task.clientId)}
          onEdit={() => onEditTask(task)}
        />
      ))}
    </div>
  );
}
