import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '../i18n/useT';

interface CarouselNavProps {
  index: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
}

export function CarouselNav({ index, count, onPrev, onNext }: CarouselNavProps) {
  const t = useT();
  if (count <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onPrev}
        aria-label={t.carouselPrev}
        className="rounded p-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ChevronLeft size={14} />
      </button>
      <div className="flex gap-1">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={`size-1.5 rounded-full ${
              i === index ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onNext}
        aria-label={t.carouselNext}
        className="rounded p-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
