import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n/useT';

const stars = [
  { top: '22%', left: '18%', size: 2 },
  { top: '60%', left: '14%', size: 1.5 },
  { top: '35%', left: '32%', size: 1.5 },
  { top: '70%', left: '30%', size: 2 },
  { top: '20%', left: '40%', size: 1.5 },
];

export function ThemeToggle() {
  const t = useT();
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t.headerToggleTheme}
      className="relative h-7 w-14 shrink-0 overflow-hidden rounded-full shadow-inner"
    >
      {/* Night sky */}
      <span
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isDark ? 1 : 0,
          background: 'linear-gradient(135deg, #1e2352 0%, #2d3373 55%, #171a42 100%)',
        }}
      >
        {stars.map((star, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{ top: star.top, left: star.left, width: star.size, height: star.size, opacity: 0.9 }}
          />
        ))}
      </span>

      {/* Day sky */}
      <span
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isDark ? 0 : 1,
          background: 'linear-gradient(135deg, #7dd3fc 0%, #bae6fd 60%, #e0f2fe 100%)',
        }}
      >
        <span className="absolute bottom-0.5 left-1 size-3.5 rounded-full bg-white/80" />
        <span className="absolute bottom-1 left-3.5 size-4 rounded-full bg-white/80" />
        <span className="absolute bottom-0.5 left-6 size-3 rounded-full bg-white/70" />
      </span>

      {/* Thumb */}
      <span
        className="absolute left-0.5 top-0.5 size-6 rounded-full shadow-md transition-transform duration-500 ease-in-out"
        style={{
          transform: isDark ? 'translateX(0px)' : 'translateX(28px)',
          background: isDark
            ? 'radial-gradient(circle at 35% 35%, #f1f5f9, #94a3b8)'
            : 'radial-gradient(circle at 35% 35%, #fef3c7, #f59e0b)',
        }}
      >
        {isDark && (
          <>
            <span className="absolute left-[6px] top-[7px] size-[3px] rounded-full bg-slate-400/70" />
            <span className="absolute left-[13px] top-[11px] size-[4px] rounded-full bg-slate-400/70" />
            <span className="absolute left-[8px] top-[15px] size-[2px] rounded-full bg-slate-400/70" />
          </>
        )}
      </span>
    </button>
  );
}
