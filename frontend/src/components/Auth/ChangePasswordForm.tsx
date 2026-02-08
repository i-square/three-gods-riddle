import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

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
    <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-center text-indigo-400">
        {t('auth.changePasswordTitle')}
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6">
        {t('auth.changePasswordDesc')}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('auth.currentPassword')}</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('auth.newPassword')}</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('auth.confirmPassword')}</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          {loading ? t('common.loading') : t('auth.changePassword')}
        </button>
      </form>
    </div>
  );
}
