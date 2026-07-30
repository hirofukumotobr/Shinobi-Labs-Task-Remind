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

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = format(new Date(), 'HH:mm');
      const store = useAppStore.getState();
      const match = store.alarms.find((a) => a.enabled && a.time === now);
      if (match) {
        const t = translations[store.language];
        setRingingId(match.id);
        store.updateAlarm(match.id, { enabled: false });
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
