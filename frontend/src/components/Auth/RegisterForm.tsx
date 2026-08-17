import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Loader2, UserPlus } from 'lucide-react';

export function RegisterForm() {
  const { t } = useTranslation();
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.register(username, password);
      setAuth(response.access_token, response.must_change_password, response.is_admin);
    } catch {
      setError(t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="input-label">{t('auth.username')}</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
          placeholder={t('auth.username')}
          required
        />
      </div>

      <div>
        <label className="input-label">{t('auth.password')}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder={t('auth.password')}
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
            <UserPlus className="w-4 h-4" />
            <span>{t('auth.registerButton')}</span>
          </>
        )}
      </button>

      <p className="input-help">{t('auth.registerRuleHint')}</p>
    </form>
  );
}
