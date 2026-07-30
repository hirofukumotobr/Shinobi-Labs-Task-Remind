import { useState } from 'react';
import { Octagon, Pause, Play, RotateCcw, Settings2, TimerIcon } from 'lucide-react';
import type { SoundId } from '../types';
import { useCountdownTimer } from '../hooks/useCountdownTimer';
import { getSoundLabel, soundIds } from '../utils/sound';
import { useT } from '../i18n/useT';

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function TimerWidget() {
  const t = useT();
  const timer = useCountdownTimer();
  const [showSettings, setShowSettings] = useState(false);
  const [minutesInput, setMinutesInput] = useState('5');
  const [secondsInput, setSecondsInput] = useState('0');
  const [reasonInput, setReasonInput] = useState('');
  const [soundInput, setSoundInput] = useState<SoundId>('classic');

  function applySettings(e: React.FormEvent) {
    e.preventDefault();
    timer.configure(Number(minutesInput) || 0, Number(secondsInput) || 0, reasonInput, soundInput);
    setShowSettings(false);
  }

  if (timer.phase === 'overtime') {
    return (
      <div className="flex min-w-[200px] flex-1 flex-col justify-center gap-1 rounded-lg border border-red-400 bg-red-50 px-4 py-2 dark:bg-red-950/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            {timer.reason && <span className="text-xs text-red-500">{timer.reason}</span>}
            <span className="text-lg font-bold tabular-nums text-red-600 dark:text-red-400">
              +{formatSeconds(timer.overtimeSeconds)}
            </span>
          </div>
          <button
            onClick={timer.stop}
            className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            <Octagon size={14} /> {t.timerStop}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-[200px] flex-1 flex-col justify-center gap-1 rounded-lg border border-slate-200 px-4 py-2 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          {timer.reason && <span className="truncate text-xs text-slate-400">{timer.reason}</span>}
          <div className="flex items-center gap-2">
            <TimerIcon size={18} className="shrink-0 text-slate-400" />
            <span className="text-lg font-semibold tabular-nums">{formatSeconds(timer.remainingSeconds)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {timer.phase === 'running' ? (
            <button
              onClick={timer.pause}
              aria-label={t.timerPause}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Pause size={16} />
            </button>
          ) : (
            <button
              onClick={timer.start}
              aria-label={t.timerStart}
              disabled={timer.remainingSeconds === 0}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            >
              <Play size={16} />
            </button>
          )}
          <button
            onClick={timer.stop}
            aria-label={t.timerReset}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setShowSettings((v) => !v)}
            aria-label={t.timerSettings}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      {showSettings && (
        <form onSubmit={applySettings} className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              value={minutesInput}
              onChange={(e) => setMinutesInput(e.target.value)}
              className="w-14 rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
            />
            <span className="text-xs text-slate-400">{t.timerMinutes}</span>
            <input
              type="number"
              min={0}
              max={59}
              value={secondsInput}
              onChange={(e) => setSecondsInput(e.target.value)}
              className="w-14 rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
            />
            <span className="text-xs text-slate-400">{t.timerSeconds}</span>
          </div>
          <input
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            placeholder={t.timerReasonPlaceholder}
            className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
          />
          <div className="flex items-center gap-1.5">
            <select
              value={soundInput}
              onChange={(e) => setSoundInput(e.target.value as SoundId)}
              className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
            >
              {soundIds.map((id) => (
                <option key={id} value={id}>
                  {getSoundLabel(id, t)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              {t.timerApply}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
