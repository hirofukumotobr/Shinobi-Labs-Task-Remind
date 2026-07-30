import { useEffect, useState } from 'react';
import { AlarmClock, BellOff, Plus, Settings2, Trash2 } from 'lucide-react';
import type { SoundId } from '../types';
import { useAlarms } from '../hooks/useAlarms';
import { getSoundLabel, soundIds } from '../utils/sound';
import { useT } from '../i18n/useT';
import { CarouselNav } from './CarouselNav';

export function AlarmWidget() {
  const t = useT();
  const { alarms, addAlarm, updateAlarm, removeAlarm, ringingId, dismiss } = useAlarms();
  const [index, setIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const safeIndex = Math.min(index, Math.max(alarms.length - 1, 0));
  const current = alarms[safeIndex];

  useEffect(() => {
    if (!ringingId) return;
    const ringingIndex = alarms.findIndex((a) => a.id === ringingId);
    if (ringingIndex >= 0) setIndex(ringingIndex);
  }, [ringingId, alarms]);

  function handleAdd() {
    addAlarm();
    setIndex(alarms.length);
    setShowSettings(true);
  }

  function handleRemove() {
    if (!current) return;
    removeAlarm(current.id);
    setIndex((i) => Math.max(0, i - 1));
  }

  if (alarms.length === 0) {
    return (
      <button
        onClick={handleAdd}
        className="flex min-w-[200px] items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400"
      >
        <AlarmClock size={18} />
        {t.alarmAddEmpty}
      </button>
    );
  }

  const isRinging = current.id === ringingId;

  return (
    <div
      className={`flex min-w-[220px] flex-col justify-center gap-1 rounded-lg border px-4 py-2 ${
        isRinging ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30' : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlarmClock size={18} className="shrink-0 text-slate-400" />
          <div className="flex flex-col">
            <input
              type="time"
              value={current.time}
              onChange={(e) => updateAlarm(current.id, { time: e.target.value })}
              disabled={isRinging}
              className="bg-transparent text-lg font-semibold tabular-nums outline-none"
            />
            {current.reason && <span className="text-xs text-slate-400">{current.reason}</span>}
          </div>
        </div>

        {isRinging ? (
          <button
            onClick={dismiss}
            className="flex items-center gap-1 rounded-md bg-orange-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-orange-600"
          >
            <BellOff size={14} /> {t.alarmStop}
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <label className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                checked={current.enabled}
                onChange={(e) => updateAlarm(current.id, { enabled: e.target.checked })}
                className="size-4 accent-blue-600"
              />
              {t.alarmActive}
            </label>
            <button
              onClick={() => setShowSettings((v) => !v)}
              aria-label={t.alarmSettings}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Settings2 size={14} />
            </button>
            <button
              onClick={handleAdd}
              aria-label={t.alarmAdd}
              disabled={alarms.length >= 5}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={handleRemove}
              aria-label={t.alarmRemove}
              className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {showSettings && !isRinging && (
        <div className="flex items-center gap-1.5 pt-1">
          <input
            value={current.reason}
            onChange={(e) => updateAlarm(current.id, { reason: e.target.value })}
            placeholder={t.alarmReasonPlaceholder}
            className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
          />
          <select
            value={current.soundId}
            onChange={(e) => updateAlarm(current.id, { soundId: e.target.value as SoundId })}
            className="rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
          >
            {soundIds.map((id) => (
              <option key={id} value={id}>
                {getSoundLabel(id, t)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-center pt-0.5">
        <CarouselNav
          index={safeIndex}
          count={alarms.length}
          onPrev={() => setIndex((i) => (i - 1 + alarms.length) % alarms.length)}
          onNext={() => setIndex((i) => (i + 1) % alarms.length)}
        />
      </div>
    </div>
  );
}
