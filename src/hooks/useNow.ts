import { useEffect, useState } from 'react';

/**
 * Forces a periodic re-render so date-derived labels (e.g. "vence em 3 dias")
 * stay accurate even if the page is left open/backgrounded for a long time.
 * Also refreshes immediately when the tab/PWA regains focus, since mobile
 * OSes typically suspend timers while backgrounded — the interval alone
 * wouldn't have kept ticking during that time.
 */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, intervalMs);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, [intervalMs]);

  return now;
}
