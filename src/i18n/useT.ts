import { useAppStore } from '../store/useAppStore';
import { translations } from './translations';

export function useT() {
  const lang = useAppStore((s) => s.language);
  return translations[lang];
}

export function useLang() {
  return useAppStore((s) => s.language);
}
