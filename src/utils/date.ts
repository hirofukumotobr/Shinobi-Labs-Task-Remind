import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
} from 'date-fns';
import { getDateFnsLocale } from '../i18n/dateLocale';
import type { Translations } from '../i18n/translations';
import type { Lang, Recurrence, Urgency } from '../types';

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseDueDate(dueDate: string): Date {
  return parseISO(dueDate);
}

export function nextDueDate(dueDate: string, recurrence: Recurrence): string {
  const date = parseDueDate(dueDate);
  switch (recurrence) {
    case 'daily':
      return toISODate(addDays(date, 1));
    case 'weekly':
      return toISODate(addWeeks(date, 1));
    case 'monthly':
      return toISODate(addMonths(date, 1));
    default:
      return dueDate;
  }
}

export function getUrgency(dueDate: string, completed: boolean): Urgency {
  if (completed) return 'done';
  const date = parseDueDate(dueDate);
  if (!isValid(date)) return 'later';
  const diff = differenceInCalendarDays(date, new Date());
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 7) return 'soon';
  return 'later';
}

export function formatDueDate(dueDate: string, lang: Lang): string {
  const date = parseDueDate(dueDate);
  if (!isValid(date)) return dueDate;
  const pattern = lang === 'en' ? 'MMMM d' : "d 'de' MMMM";
  return format(date, pattern, { locale: getDateFnsLocale(lang) });
}

export function formatRelativeDays(
  dueDate: string,
  completed: boolean,
  t: Translations,
  dueTime?: string,
): string {
  if (completed) return t.taskDateCompleted;
  const diff = differenceInCalendarDays(parseDueDate(dueDate), new Date());
  const base =
    diff < 0
      ? t.taskDateOverdue(Math.abs(diff))
      : diff === 0
        ? t.taskDateDueToday
        : diff === 1
          ? t.taskDateDueTomorrow
          : t.taskDateDueInDays(diff);
  return dueTime ? `${base} ${t.taskDateAtTime(dueTime)}` : base;
}

export function getRecurrenceLabel(recurrence: Recurrence, t: Translations): string {
  switch (recurrence) {
    case 'daily':
      return t.recurrenceDaily;
    case 'weekly':
      return t.recurrenceWeekly;
    case 'monthly':
      return t.recurrenceMonthly;
    default:
      return t.recurrenceNone;
  }
}
