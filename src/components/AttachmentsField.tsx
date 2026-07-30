import { File, Trash2, Upload } from 'lucide-react';
import type { Attachment } from '../types';
import { useT } from '../i18n/useT';

interface AttachmentsFieldProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

const MAX_FILE_SIZE = 3 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AttachmentsField({ attachments, onChange }: AttachmentsFieldProps) {
  const t = useT();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;

    const accepted: Attachment[] = [];
    for (const file of Array.from(fileList)) {
      if (file.size > MAX_FILE_SIZE) {
        window.alert(t.attachmentTooLarge(file.name));
        continue;
      }
      const dataUrl = await readFileAsDataUrl(file);
      accepted.push({ id: `${Date.now()}-${file.name}`, name: file.name, type: file.type, dataUrl });
    }

    onChange([...attachments, ...accepted]);
  }

  function handleRemove(id: string) {
    onChange(attachments.filter((a) => a.id !== id));
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{t.attachmentsLabel}</label>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400">
        <Upload size={16} />
        {t.attachmentsUpload}
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </label>

      {attachments.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-700"
            >
              {attachment.type.startsWith('image/') ? (
                <img src={attachment.dataUrl} alt={attachment.name} className="size-8 rounded object-cover" />
              ) : (
                <File size={18} className="shrink-0 text-slate-400" />
              )}
              <span className="flex-1 truncate">{attachment.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(attachment.id)}
                aria-label={t.attachmentsRemove}
                className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
