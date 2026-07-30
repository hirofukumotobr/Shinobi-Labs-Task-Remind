import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n/useT';
import { PasswordInput } from './PasswordInput';

function errorMessage(code: string | null, t: ReturnType<typeof useT>): string | null {
  switch (code) {
    case 'invalid_input':
      return t.authErrorInvalidInput;
    case 'email_taken':
      return t.authErrorEmailTaken;
    case 'invalid_credentials':
      return t.authErrorInvalidCredentials;
    case null:
      return null;
    default:
      return t.authErrorUnknown;
  }
}

export function AuthScreen() {
  const t = useT();
  const { signUp, signIn, error, submitting } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mismatchError, setMismatchError] = useState(false);

  function switchMode(next: 'signin' | 'signup') {
    setMode(next);
    setMismatchError(false);
    setConfirmPassword('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMismatchError(false);

    if (mode === 'signup' && password !== confirmPassword) {
      setMismatchError(true);
      return;
    }

    try {
      if (mode === 'signup') {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch {
      // error state is already surfaced via useAuth
    }
  }

  const displayError = mismatchError ? t.authErrorPasswordMismatch : errorMessage(error, t);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-[#0f1115]">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm dark:bg-[#181a20]">
        <h1 className="text-center text-lg font-semibold">{t.headerTitle}</h1>
        <p className="mb-5 text-center text-sm text-slate-400">{t.authSubtitle}</p>

        <div className="mb-4 flex rounded-lg border border-slate-200 text-sm dark:border-slate-700">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 rounded-l-lg py-2 font-medium ${
              mode === 'signin' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.authSignInTab}
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 rounded-r-lg py-2 font-medium ${
              mode === 'signup' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.authSignUpTab}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{t.authEmail}</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
            />
          </div>

          <PasswordInput
            label={t.authPassword}
            value={password}
            onChange={setPassword}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            show={showPassword}
            onToggleShow={() => setShowPassword((v) => !v)}
            showLabel={t.authShowPassword}
            hideLabel={t.authHidePassword}
          />

          {mode === 'signup' && (
            <PasswordInput
              label={t.authConfirmPassword}
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              show={showPassword}
              onToggleShow={() => setShowPassword((v) => !v)}
              showLabel={t.authShowPassword}
              hideLabel={t.authHidePassword}
            />
          )}

          {displayError && <p className="text-sm text-red-600 dark:text-red-400">{displayError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {mode === 'signup' ? t.authSubmitSignUp : t.authSubmitSignIn}
          </button>
        </form>
      </div>
    </div>
  );
}
