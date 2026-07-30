import { useCallback, useState } from 'react';
import { ApiError, api, setToken } from '../lib/apiClient';
import { useAppStore } from '../store/useAppStore';

export function useAuth() {
  const userId = useAppStore((s) => s.userId);
  const setStoreUserId = useAppStore((s) => s.setUserId);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signUp = useCallback(
    async (email: string, password: string) => {
      setSubmitting(true);
      setError(null);
      try {
        const { token, userId: id } = await api.signUp(email, password);
        setToken(token);
        setStoreUserId(id);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'unknown_error');
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [setStoreUserId],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setSubmitting(true);
      setError(null);
      try {
        const { token, userId: id } = await api.signIn(email, password);
        setToken(token);
        setStoreUserId(id);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'unknown_error');
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [setStoreUserId],
  );

  const signOut = useCallback(() => {
    setToken(null);
    setStoreUserId(null);
  }, [setStoreUserId]);

  return { userId, signUp, signIn, signOut, error, submitting };
}
