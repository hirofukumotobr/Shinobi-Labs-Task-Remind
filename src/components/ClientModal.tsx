import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n/useT';
import { Modal } from './Modal';

interface ClientModalProps {
  onClose: () => void;
}

export function ClientModal({ onClose }: ClientModalProps) {
  const t = useT();
  const clients = useAppStore((s) => s.clients);
  const tasks = useAppStore((s) => s.tasks);
  const addClient = useAppStore((s) => s.addClient);
  const removeClient = useAppStore((s) => s.removeClient);
  const updateClient = useAppStore((s) => s.updateClient);

  const [name, setName] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addClient(name.trim());
    setName('');
  }

  function handleRemove(id: string) {
    const count = tasks.filter((t) => (t.clientIds ?? []).includes(id)).length;
    if (count > 0 && !window.confirm(t.clientConfirmRemove(count))) {
      return;
    }
    removeClient(id);
  }

  return (
    <Modal title={t.clientManage} onClose={onClose}>
      <div className="flex flex-col gap-3">
        {clients.length === 0 && <p className="text-sm text-slate-400">{t.clientEmpty}</p>}
        {clients.map((client) => (
          <div key={client.id} className="flex items-center gap-2">
            <input
              value={client.name}
              onChange={(e) => updateClient(client.id, e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
            />
            <button
              onClick={() => handleRemove(client.id)}
              aria-label={t.clientRemove}
              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <form onSubmit={handleAdd} className="mt-2 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.clientNamePlaceholder}
            className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t.commonAdd}
          </button>
        </form>
      </div>
    </Modal>
  );
}
