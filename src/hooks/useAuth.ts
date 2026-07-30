import { useCallback, useEffect, useState } from 'react';
import { ApiError, api, decodeUserId, getToken, setToken } from '../lib/apiClient';
import { useAppStore } from '../store/useAppStore';

export function useAuth() {
  const [userId, setUserIdState] = useState<string | null>(() => {
    const token = getToken();
    return token ? decodeUserId(token) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const setStoreUserId = useAppStore((s) => s.setUserId);

  useEffect(() => {
    setStoreUserId(userId);
  }, [userId, setStoreUserId]);

  const signUp = useCallback(async (email: string, password: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const { token, userId: id } = await api.signUp(email, password);
      setToken(token);
      setUserIdState(id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'unknown_error');
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const { token, userId: id } = await api.signIn(email, password);
      setToken(token);
      setUserIdState(id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'unknown_error');
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUserIdState(null);
  }, []);

  return { userId, signUp, signIn, signOut, error, submitting };
}
