import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, UserX, Loader2 } from 'lucide-react';
import { adminApi } from '../../services/api';
import type { AdminUser } from '../../types';

export function UserList() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await adminApi.getUsers();
        setUsers(data);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const toggleUser = async (userId: string) => {
    try {
      const result = await adminApi.toggleUserDisabled(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_disabled: result.is_disabled } : u)));
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  if (loading) {
    return (
      <div className="surface-base p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-teal-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="surface-base overflow-hidden">
      <div className="hidden lg:grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-3 px-4 py-3 border-b border-slate-200 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
        <span>{t('admin.userId')}</span>
        <span>{t('admin.createdAt')}</span>
        <span>{t('admin.gamesPlayed')}</span>
        <span>{t('admin.winRate')}</span>
        <span>{t('admin.status')}</span>
        <span className="text-right">{t('admin.actions')}</span>
      </div>

      <div className="divide-y divide-slate-200">
        {users.map((user) => (
          <div key={user.id} className="p-4 sm:p-5">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-2 items-center">
              <div>
                <p className="font-bold text-slate-800">{user.id}</p>
                {user.is_admin && <span className="status-neutral mt-1 inline-flex">{t('nav.admin')}</span>}
              </div>

              <p className="text-sm text-slate-600">{new Date(user.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-slate-700">{user.total_games}</p>
              <p className="text-sm text-slate-700">{user.win_rate.toFixed(1)}%</p>

              <div>
                {user.is_disabled ? (
                  <span className="status-loss">
                    <UserX className="w-3 h-3" />
                    {t('admin.disabled')}
                  </span>
                ) : (
                  <span className="status-win">
                    <UserCheck className="w-3 h-3" />
                    {t('admin.active')}
                  </span>
                )}
              </div>

              <div className="lg:text-right">
                {user.id !== 'root' && (
                  <button
                    onClick={() => toggleUser(user.id)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      user.is_disabled ? 'btn-soft text-emerald-700' : 'btn-danger'
                    }`}
                  >
                    {user.is_disabled ? t('admin.enable') : t('admin.disable')}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
