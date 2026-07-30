import { useState } from 'react';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { useClock } from '../hooks/useClock';
import { useLang, useT } from '../i18n/useT';
import { getDateFnsLocale } from '../i18n/dateLocale';
import { TimerWidget } from './TimerWidget';
import { AlarmWidget } from './AlarmWidget';
import { WeatherWidget } from './WeatherWidget';

export function Footer() {
  const t = useT();
  const lang = useLang();
  const now = useClock();
  const [query, setQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(trimmed)}`, '_blank', 'noopener,noreferrer');
  }

  const dateFormat = lang === 'en' ? 'EEEE, MMMM d, yyyy' : "EEEE, d 'de' MMMM 'de' yyyy";

  return (
    <footer className="mt-auto flex flex-wrap gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-[#16171d]">
      <div className="flex min-w-[180px] flex-col justify-center rounded-lg border border-slate-200 px-4 py-2 dark:border-slate-800">
        <span className="text-lg font-semibold tabular-nums">{format(now, 'HH:mm:ss')}</span>
        <span className="text-xs capitalize text-slate-500 dark:text-slate-400">
          {format(now, dateFormat, { locale: getDateFnsLocale(lang) })}
        </span>
      </div>

      <WeatherWidget />
      <TimerWidget />
      <AlarmWidget />

      <form onSubmit={handleSearch} className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 dark:border-slate-800">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.footerSearchPlaceholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          {t.footerSearch}
        </button>
      </form>
    </footer>
  );
}
