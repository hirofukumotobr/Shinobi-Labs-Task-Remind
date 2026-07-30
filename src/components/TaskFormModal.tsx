import { useState } from 'react';
import { Star } from 'lucide-react';
import type { Attachment, Recurrence, Task } from '../types';
import { useAppStore } from '../store/useAppStore';
import { formatDueDate, getRecurrenceLabel, toISODate } from '../utils/date';
import { useLang, useT } from '../i18n/useT';
import { Modal } from './Modal';
import { Calendar } from './Calendar';
import { ClientModal } from './ClientModal';
import { AttachmentsField } from './AttachmentsField';

interface TaskFormModalProps {
  task?: Task;
  defaultCategoryIds?: string[];
  onClose: () => void;
}

const recurrenceOptions: Recurrence[] = ['none', 'daily', 'weekly', 'monthly'];

export function TaskFormModal({ task, defaultCategoryIds, onClose }: TaskFormModalProps) {
  const t = useT();
  const lang = useLang();
  const categories = useAppStore((s) => s.categories);
  const clients = useAppStore((s) => s.clients);
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);

  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [categoryIds, setCategoryIds] = useState<string[]>(
    task?.categoryIds ?? defaultCategoryIds ?? [],
  );
  const [clientId, setClientId] = useState<string | null>(task?.clientId ?? null);
  const [dueDate, setDueDate] = useState(task?.dueDate ?? toISODate(new Date()));
  const [dueTime, setDueTime] = useState(task?.dueTime ?? '');
  const [dueTimeLabel, setDueTimeLabel] = useState(task?.dueTimeLabel ?? '');
  const [recurrence, setRecurrence] = useState<Recurrence>(task?.recurrence ?? 'none');
  const [pinned, setPinned] = useState(task?.pinned ?? false);
  const [attachments, setAttachments] = useState<Attachment[]>(task?.attachments ?? []);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  function toggleCategory(id: string) {
    setCategoryIds((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const shared = {
      title,
      notes,
      categoryIds,
      clientId,
      dueDate,
      dueTime,
      dueTimeLabel: dueTimeLabel.trim(),
      recurrence,
      pinned,
      attachments,
    };

    if (task) {
      updateTask(task.id, shared);
    } else {
      addTask(shared);
    }
    onClose();
  }

  return (
    <Modal title={task ? t.taskFormEditTitle : t.taskFormNewTitle} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">{t.taskFormTitleLabel}</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.taskFormTitlePlaceholder}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">{t.taskFormNotesLabel}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">{t.taskFormCategoriesLabel}</label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => {
              const active = categoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    active
                      ? 'border-transparent text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                  }`}
                  style={active ? { backgroundColor: category.color } : undefined}
                >
                  {!active && (
                    <span className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                  )}
                  {category.name}
                </button>
              );
            })}
            {categories.length === 0 && (
              <span className="text-sm text-slate-400">{t.taskFormNoCategories}</span>
            )}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-500">{t.taskFormClientLabel}</label>
            <button
              type="button"
              onClick={() => setShowClientModal(true)}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              {t.taskFormManageClients}
            </button>
          </div>
          <select
            value={clientId ?? ''}
            onChange={(e) => setClientId(e.target.value || null)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
          >
            <option value="">{t.taskFormNoClient}</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">{t.taskFormDueDateLabel}</label>
          <button
            type="button"
            onClick={() => setShowCalendar((v) => !v)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-blue-400 dark:border-slate-700 dark:bg-[#12141a]"
          >
            {formatDueDate(dueDate, lang)}
          </button>
          {showCalendar && (
            <div className="mt-2">
              <Calendar
                value={dueDate}
                onChange={(date) => {
                  setDueDate(date);
                  setShowCalendar(false);
                }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="w-full sm:w-32 sm:shrink-0">
            <label className="mb-1 block text-xs font-medium text-slate-500">{t.taskFormTimeLabel}</label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">{t.taskFormTimeCaptionLabel}</label>
            <input
              value={dueTimeLabel}
              onChange={(e) => setDueTimeLabel(e.target.value)}
              placeholder={t.taskFormTimeCaptionPlaceholder}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">{t.taskFormRecurrenceLabel}</label>
          <div className="flex gap-1.5">
            {recurrenceOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRecurrence(option)}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium ${
                  recurrence === option
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-blue-300 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {getRecurrenceLabel(option, t)}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPinned((v) => !v)}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
            pinned
              ? 'border-orange-400 bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400'
              : 'border-slate-200 text-slate-500 hover:border-orange-300 dark:border-slate-700'
          }`}
        >
          <Star size={16} className={pinned ? 'fill-orange-400 text-orange-400' : ''} />
          {pinned ? t.taskFormMarkedAsPriority : t.taskFormMarkAsPriority}
        </button>

        <AttachmentsField attachments={attachments} onChange={setAttachments} />

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t.taskFormCancel}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {task ? t.taskFormSave : t.taskFormCreate}
          </button>
        </div>
      </form>

      {showClientModal && <ClientModal onClose={() => setShowClientModal(false)} />}
    </Modal>
  );
}
