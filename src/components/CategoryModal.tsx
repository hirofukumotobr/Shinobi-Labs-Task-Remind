import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n/useT';
import { Modal } from './Modal';

interface CategoryModalProps {
  onClose: () => void;
}

const colorPalette = ['#3b82f6', '#f97316', '#22c55e', '#a855f7', '#ef4444', '#06b6d4', '#eab308', '#ec4899'];

export function CategoryModal({ onClose }: CategoryModalProps) {
  const t = useT();
  const categories = useAppStore((s) => s.categories);
  const tasks = useAppStore((s) => s.tasks);
  const addCategory = useAppStore((s) => s.addCategory);
  const removeCategory = useAppStore((s) => s.removeCategory);
  const updateCategory = useAppStore((s) => s.updateCategory);
  const moveCategory = useAppStore((s) => s.moveCategory);

  const [name, setName] = useState('');
  const [color, setColor] = useState(colorPalette[0]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addCategory(name.trim(), color);
    setName('');
  }

  function handleRemove(id: string) {
    const count = tasks.filter((t) => t.categoryIds.includes(id)).length;
    if (count > 0 && !window.confirm(t.categoryConfirmRemove(count))) {
      return;
    }
    removeCategory(id);
  }

  return (
    <Modal title={t.categoryManage} onClose={onClose}>
      <div className="flex flex-col gap-3">
        {categories.map((category, index) => (
          <div key={category.id} className="flex items-center gap-2">
            <div className="flex shrink-0 flex-col">
              <button
                onClick={() => moveCategory(category.id, 'up')}
                disabled={index === 0}
                aria-label={t.categoryMoveUp}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-800"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => moveCategory(category.id, 'down')}
                disabled={index === categories.length - 1}
                aria-label={t.categoryMoveDown}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-800"
              >
                <ChevronDown size={14} />
              </button>
            </div>
            <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
            <input
              value={category.name}
              onChange={(e) => updateCategory(category.id, { name: e.target.value })}
              className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
            />
            <button
              onClick={() => handleRemove(category.id)}
              aria-label={t.categoryRemove}
              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <form onSubmit={handleAdd} className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <label className="text-xs font-medium text-slate-500">{t.categoryNewLabel}</label>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.categoryNamePlaceholder}
              className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t.commonAdd}
            </button>
          </div>
          <div className="flex gap-1.5">
            {colorPalette.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`${t.categoryColorAria} ${c}`}
                className={`size-6 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-[#1c1e26]' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <label
              aria-label={t.categoryCustomColorAria}
              className={`relative size-6 shrink-0 cursor-pointer overflow-hidden rounded-full ${
                !colorPalette.includes(color) ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-[#1c1e26]' : ''
              }`}
              style={{
                background: !colorPalette.includes(color)
                  ? color
                  : 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
              }}
            >
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
            </label>
          </div>
        </form>
      </div>
    </Modal>
  );
}
