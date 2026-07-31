import { useState } from 'react';
import { User } from 'lucide-react';
import { useT } from '../i18n/useT';
import { ApiError, api, type UserProfile } from '../lib/apiClient';
import { cropImageToSquareDataUrl } from '../utils/image';
import { Modal } from './Modal';
import { PasswordInput } from './PasswordInput';

interface ProfileModalProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onClose: () => void;
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

function errorMessage(code: string, t: ReturnType<typeof useT>): string {
  switch (code) {
    case 'incorrect_password':
      return t.profileErrorIncorrectPassword;
    case 'email_taken':
      return t.profileErrorEmailTaken;
    case 'invalid_input':
      return t.profileErrorInvalidInput;
    default:
      return t.profileErrorUnknown;
  }
}

export function ProfileModal({ profile, onUpdate, onClose }: ProfileModalProps) {
  const t = useT();

  const [name, setName] = useState(profile.name ?? '');
  const [avatar, setAvatar] = useState(profile.avatar);
  const [showPassword, setShowPassword] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleAvatarChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    if (file.size > MAX_AVATAR_SIZE) {
      window.alert(t.attachmentTooLarge(file.name));
      return;
    }
    const dataUrl = await cropImageToSquareDataUrl(file);
    setAvatar(dataUrl);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileMessage(null);
    try {
      const updated = await api.updateProfile({ name: name.trim() || null, avatar });
      onUpdate(updated);
      setProfileMessage(t.profileProfileSaved);
    } catch (err) {
      setProfileError(err instanceof ApiError ? errorMessage(err.message, t) : errorMessage('unknown', t));
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailSaving(true);
    setEmailError(null);
    setEmailMessage(null);
    try {
      const updated = await api.changeEmail(newEmail.trim(), emailPassword);
      onUpdate(updated);
      setEmailMessage(t.profileEmailChanged);
      setNewEmail('');
      setEmailPassword('');
    } catch (err) {
      setEmailError(err instanceof ApiError ? errorMessage(err.message, t) : errorMessage('unknown', t));
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordError(t.profileErrorPasswordMismatch);
      return;
    }
    setPasswordSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordMessage(t.profilePasswordChanged);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof ApiError ? errorMessage(err.message, t) : errorMessage('unknown', t));
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <Modal title={t.profileTitle} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {avatar ? (
              <img src={avatar} alt="" className="size-16 rounded-full object-cover" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <User size={28} />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="cursor-pointer text-xs font-medium text-blue-600 hover:underline">
                {t.profileAvatarChange}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleAvatarChange(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar(null)}
                  className="text-left text-xs font-medium text-slate-400 hover:underline"
                >
                  {t.profileAvatarRemove}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{t.profileNameLabel}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.profileNamePlaceholder}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
            />
          </div>

          {profileError && <p className="text-sm text-red-600 dark:text-red-400">{profileError}</p>}
          {profileMessage && <p className="text-sm text-green-600 dark:text-green-400">{profileMessage}</p>}

          <button
            type="submit"
            disabled={profileSaving}
            className="self-start rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {t.profileSaveProfile}
          </button>
        </form>

        <form
          onSubmit={handleChangeEmail}
          className="flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800"
        >
          <h4 className="text-sm font-semibold">{t.profileEmailSectionTitle}</h4>
          <p className="text-xs text-slate-400">
            {t.profileCurrentEmailLabel}: {profile.email}
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{t.profileNewEmailLabel}</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#12141a]"
            />
          </div>
          <PasswordInput
            label={t.profileCurrentPasswordLabel}
            value={emailPassword}
            onChange={setEmailPassword}
            autoComplete="current-password"
            show={showPassword}
            onToggleShow={() => setShowPassword((v) => !v)}
            showLabel={t.authShowPassword}
            hideLabel={t.authHidePassword}
          />

          {emailError && <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>}
          {emailMessage && <p className="text-sm text-green-600 dark:text-green-400">{emailMessage}</p>}

          <button
            type="submit"
            disabled={emailSaving || !newEmail || !emailPassword}
            className="self-start rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {t.profileChangeEmail}
          </button>
        </form>

        <form
          onSubmit={handleChangePassword}
          className="flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800"
        >
          <h4 className="text-sm font-semibold">{t.profilePasswordSectionTitle}</h4>
          <PasswordInput
            label={t.profileCurrentPasswordLabel}
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            show={showPassword}
            onToggleShow={() => setShowPassword((v) => !v)}
            showLabel={t.authShowPassword}
            hideLabel={t.authHidePassword}
          />
          <PasswordInput
            label={t.profileNewPasswordLabel}
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            show={showPassword}
            onToggleShow={() => setShowPassword((v) => !v)}
            showLabel={t.authShowPassword}
            hideLabel={t.authHidePassword}
          />
          <PasswordInput
            label={t.profileConfirmPasswordLabel}
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            show={showPassword}
            onToggleShow={() => setShowPassword((v) => !v)}
            showLabel={t.authShowPassword}
            hideLabel={t.authHidePassword}
          />

          {passwordError && <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>}
          {passwordMessage && <p className="text-sm text-green-600 dark:text-green-400">{passwordMessage}</p>}

          <button
            type="submit"
            disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
            className="self-start rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {t.profileChangePassword}
          </button>
        </form>
      </div>
    </Modal>
  );
}
