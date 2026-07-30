import { useEffect, useRef, useState } from 'react';
import type { SoundId } from '../types';
import { notifyUser, playAlertSound } from '../utils/sound';
import { useT } from '../i18n/useT';

type Phase = 'idle' | 'running' | 'overtime';

export function useCountdownTimer() {
  const t = useT();
  const [totalSeconds, setTotalSeconds] = useState(5 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(5 * 60);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [reason, setReason] = useState('');
  const [soundId, setSoundId] = useState<SoundId>('classic');
  const stopSoundRef = useRef<(() => void) | null>(null);
  const firedRef = useRef(false);

  // Countdown ticker: purely decrements remaining time, no side effects here.
  useEffect(() => {
    if (phase !== 'running') return;

    const id = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [phase]);

  // Overtime ticker: counts elapsed seconds past zero.
  useEffect(() => {
    if (phase !== 'overtime') return;

    const id = window.setInterval(() => {
      setOvertimeSeconds((s) => s + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [phase]);

  // Fires exactly once when the countdown reaches zero. `firedRef` (not a
  // cleanup) guards re-entry: this effect's own setPhase('overtime') call
  // changes `phase`, which is also in the deps below, so it re-runs itself on
  // the next render — a cleanup here would stop the sound a moment after it
  // started. The ref flag makes the second pass a no-op instead.
  useEffect(() => {
    if (phase !== 'running' || remainingSeconds !== 0 || firedRef.current) return;

    firedRef.current = true;
    setPhase('overtime');
    stopSoundRef.current = playAlertSound(soundId);
    notifyUser(t.timerNotificationTitle, reason || t.timerNotificationBody);
  }, [phase, remainingSeconds, soundId, reason, t]);

  function configure(minutes: number, seconds: number, newReason: string, newSoundId: SoundId) {
    stopSoundRef.current?.();
    stopSoundRef.current = null;
    firedRef.current = false;
    const total = Math.max(0, minutes * 60 + seconds);
    setTotalSeconds(total);
    setRemainingSeconds(total);
    setOvertimeSeconds(0);
    setReason(newReason);
    setSoundId(newSoundId);
    setPhase('idle');
  }

  function start() {
    if (remainingSeconds <= 0) return;
    setPhase('running');
  }

  function pause() {
    setPhase('idle');
  }

  function stop() {
    stopSoundRef.current?.();
    stopSoundRef.current = null;
    firedRef.current = false;
    setPhase('idle');
    setRemainingSeconds(totalSeconds);
    setOvertimeSeconds(0);
  }

  return {
    totalSeconds,
    remainingSeconds,
    overtimeSeconds,
    phase,
    reason,
    soundId,
    configure,
    start,
    pause,
    stop,
  };
}
