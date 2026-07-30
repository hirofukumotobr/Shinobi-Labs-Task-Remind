import { DayPicker } from 'react-day-picker';
import { enUS, ptBR } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { parseDueDate, toISODate } from '../utils/date';
import { useLang } from '../i18n/useT';

interface CalendarProps {
  value: string;
  onChange: (isoDate: string) => void;
}

export function Calendar({ value, onChange }: CalendarProps) {
  const lang = useLang();
  const selected = value ? parseDueDate(value) : undefined;

  return (
    <DayPicker
      mode="single"
      locale={lang === 'en' ? enUS : ptBR}
      selected={selected}
      onSelect={(date) => date && onChange(toISODate(date))}
      className="rdp-root rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-[#1c1e26] dark:text-slate-100"
    />
  );
}
