import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Cloud, Plus, Search, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useWeather } from '../hooks/useWeather';
import { useAutoDetectCity } from '../hooks/useAutoDetectCity';
import { searchCities, type CitySearchResult } from '../utils/geocoding';
import { useLang, useT } from '../i18n/useT';
import { getDateFnsLocale } from '../i18n/dateLocale';
import { getWeatherIcon } from '../utils/weatherIcon';
import { CarouselNav } from './CarouselNav';
import type { Translations } from '../i18n/translations';

type WeatherView = 'today' | 'week';

export function WeatherWidget() {
  const t = useT();
  const lang = useLang();
  useAutoDetectCity();

  const weatherCities = useAppStore((s) => s.weatherCities);
  const selectedWeatherCityId = useAppStore((s) => s.selectedWeatherCityId);
  const setSelectedWeatherCityId = useAppStore((s) => s.setSelectedWeatherCityId);
  const addWeatherCity = useAppStore((s) => s.addWeatherCity);
  const removeWeatherCity = useAppStore((s) => s.removeWeatherCity);

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [view, setView] = useState<WeatherView>('today');

  const index = Math.max(
    0,
    weatherCities.findIndex((c) => c.id === selectedWeatherCityId),
  );
  const current = weatherCities[index];
  const weather = useWeather(current?.latitude ?? null, current?.longitude ?? null);
  const TodayIcon = weather.data ? getWeatherIcon(weather.data.weatherCode) : Cloud;

  function selectByOffset(offset: number) {
    if (weatherCities.length === 0) return;
    const nextIndex = (index + offset + weatherCities.length) % weatherCities.length;
    setSelectedWeatherCityId(weatherCities[nextIndex].id);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const found = await searchCities(query, lang);
    setResults(found);
    setSearching(false);
  }

  function handlePick(result: CitySearchResult) {
    const label = [result.name, result.admin1].filter(Boolean).join(', ');
    addWeatherCity(label, result.latitude, result.longitude);
    setShowSearch(false);
    setQuery('');
    setResults([]);
  }

  if (weatherCities.length === 0) {
    return (
      <div className="flex min-w-[220px] flex-1 flex-col gap-1.5 rounded-lg border border-slate-200 px-4 py-2 dark:border-slate-800">
        <button
          onClick={() => setShowSearch((v) => !v)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400"
        >
          <Cloud size={18} />
          {t.weatherAddCity}
        </button>
        {showSearch && (
          <CitySearchForm
            t={t}
            query={query}
            setQuery={setQuery}
            onSubmit={handleSearch}
            results={results}
            searching={searching}
            onPick={handlePick}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-w-[220px] flex-1 flex-col gap-1 rounded-lg border border-slate-200 px-4 py-2 dark:border-slate-800">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <TodayIcon size={20} className="shrink-0 text-slate-400" />
          {weather.loading && <span className="text-sm text-slate-500 dark:text-slate-400">{t.weatherLoading}</span>}
          {weather.error && <span className="text-sm text-slate-500 dark:text-slate-400">{weather.error}</span>}
          {weather.data && (
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                {current.name}
              </span>
              {view === 'today' ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-lg font-semibold">{weather.data.temperature}°C</span>
                  <span className="text-slate-500 dark:text-slate-400">{weather.data.description}</span>
                  <span className="text-xs text-slate-400">
                    ↓{weather.data.tempMin}° ↑{weather.data.tempMax}°
                  </span>
                  <span className="text-xs text-slate-400">{weather.data.humidity}%</span>
                  <span className="text-xs text-slate-400">{weather.data.windSpeed}km/h</span>
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-0.5">
                  {weather.data.daily.map((day) => {
                    const DayIcon = getWeatherIcon(day.weatherCode);
                    return (
                      <div
                        key={day.date}
                        title={day.description}
                        className="flex shrink-0 flex-col items-center rounded-md bg-slate-100 px-1.5 py-1 dark:bg-slate-800"
                      >
                        <span className="text-[10px] font-medium uppercase text-slate-400">
                          {format(parseISO(day.date), 'EEE', { locale: getDateFnsLocale(lang) })}
                        </span>
                        <DayIcon size={16} className="my-0.5 text-slate-400" />
                        <span className="text-[11px] font-medium">{day.tempMax}°</span>
                        <span className="text-[11px] text-slate-400">{day.tempMin}°</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {weather.data && (
            <div className="mr-1 flex rounded-md border border-slate-200 text-[10px] dark:border-slate-700">
              <button
                onClick={() => setView('today')}
                className={`rounded-l-md px-1.5 py-1 font-medium ${
                  view === 'today' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.weatherViewToday}
              </button>
              <button
                onClick={() => setView('week')}
                className={`rounded-r-md px-1.5 py-1 font-medium ${
                  view === 'week' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.weatherViewWeek}
              </button>
            </div>
          )}
          <button
            onClick={() => setShowSearch((v) => !v)}
            aria-label={t.weatherAddCityAria}
            disabled={weatherCities.length >= 5}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => removeWeatherCity(current.id)}
            aria-label={t.weatherRemoveCityAria}
            className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {showSearch && (
        <CitySearchForm
          t={t}
          query={query}
          setQuery={setQuery}
          onSubmit={handleSearch}
          results={results}
          searching={searching}
          onPick={handlePick}
        />
      )}

      <div className="flex justify-center pt-0.5">
        <CarouselNav
          index={index}
          count={weatherCities.length}
          onPrev={() => selectByOffset(-1)}
          onNext={() => selectByOffset(1)}
        />
      </div>
    </div>
  );
}

interface CitySearchFormProps {
  t: Translations;
  query: string;
  setQuery: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  results: CitySearchResult[];
  searching: boolean;
  onPick: (result: CitySearchResult) => void;
}

function CitySearchForm({ t, query, setQuery, onSubmit, results, searching, onPick }: CitySearchFormProps) {
  return (
    <div className="flex flex-col gap-1.5 pt-1">
      <form onSubmit={onSubmit} className="flex items-center gap-1.5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.weatherCityPlaceholder}
          className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          <Search size={12} />
          {searching ? '...' : t.weatherSearch}
        </button>
      </form>
      {results.length > 0 && (
        <ul className="flex flex-col gap-1">
          {results.map((result, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onPick(result)}
                className="w-full truncate rounded-md px-2 py-1 text-left text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {[result.name, result.admin1, result.country].filter(Boolean).join(', ')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
