export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Client {
  id: string;
  name: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  categoryIds: string[];
  clientId: string | null;
  dueDate: string;
  dueTime?: string;
  dueTimeLabel?: string;
  recurrence: Recurrence;
  completed: boolean;
  pinned: boolean;
  attachments: Attachment[];
  createdAt: string;
}

export type SoundId = 'classic' | 'gentle' | 'alert' | 'digital' | 'bell';

export interface AlarmItem {
  id: string;
  time: string;
  reason: string;
  enabled: boolean;
  soundId: SoundId;
}

export interface WeatherCity {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export type Theme = 'light' | 'dark';

export type Lang = 'pt' | 'en';

export type Urgency = 'overdue' | 'today' | 'soon' | 'later' | 'done';

export type TaskFilter =
  | { kind: 'all' }
  | { kind: 'urgent' }
  | { kind: 'category'; categoryId: string };
