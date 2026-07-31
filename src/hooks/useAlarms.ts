import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useAppStore } from '../store/useAppStore';
import { notifyUser, playAlertSound } from '../utils/sound';
import { translations } from '../i18n/translations';

export function useAlarms() {
  const alarms = useAppStore((s) => s.alarms);
  const addAlarm = useAppStore((s) => s.addAlarm);
  const updateAlarm = useAppStore((s) => s.updateAlarm);
  const removeAlarm = useAppStore((s) => s.removeAlarm);
  const [ringingId, setRingingId] = useState<string | null>(null);
  const stopSoundRef = useRef<(() => void) | null>(null);
  const firedRef = useRef<{ minute: string; ids: Set<string> }>({ minute: '', ids: new Set() });

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = new Date();
      const nowStr = format(now, 'HH:mm');
      const today = now.getDay();

      if (firedRef.current.minute !== nowStr) {
        firedRef.current = { minute: nowStr, ids: new Set() };
      }

      const store = useAppStore.getState();
      const match = store.alarms.find(
        (a) =>
          a.enabled &&
          a.time === nowStr &&
          (a.days ?? [0, 1, 2, 3, 4, 5, 6]).includes(today) &&
          !firedRef.current.ids.has(a.id),
      );
      if (match) {
        firedRef.current.ids.add(match.id);
        const t = translations[store.language];
        setRingingId(match.id);
        stopSoundRef.current = playAlertSound(match.soundId);
        notifyUser(t.alarmNotificationTitle, match.reason || t.alarmNotificationBody(match.time));
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  function dismiss() {
    stopSoundRef.current?.();
    stopSoundRef.current = null;
    setRingingId(null);
  }

  return { alarms, addAlarm, updateAlarm, removeAlarm, ringingId, dismiss };
}
