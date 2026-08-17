import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Loader2, KeyRound } from 'lucide-react';

export function ChangePasswordForm() {
  const { t } = useTranslation();
  const { setMustChangePassword } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword(currentPassword, newPassword);
      setMustChangePassword(false);
    } catch (err: unknown) {
      const detail =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { detail?: string } } }).response?.data?.detail === 'string'
          ? (err as { response: { data: { detail: string } } }).response.data.detail
          : null;
      setError(detail || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{t('auth.changePasswordTitle')}</h2>
        <p className="input-help mt-1">{t('auth.changePasswordDesc')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">{t('auth.currentPassword')}</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="input-label">{t('auth.newPassword')}</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="input-label">{t('auth.confirmPassword')}</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            required
          />
        </div>

        {error && <p className="text-sm text-rose-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('common.loading')}</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>{t('auth.changePassword')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
