import { enUS, ptBR } from 'date-fns/locale';
import type { Lang } from '../types';

export function getDateFnsLocale(lang: Lang) {
  return lang === 'en' ? enUS : ptBR;
}
