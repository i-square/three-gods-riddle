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
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_disabled: result.is_disabled } : u))
      );
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
              {t('admin.userId')}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
              {t('admin.createdAt')}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
              {t('admin.gamesPlayed')}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
              {t('admin.winRate')}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
              {t('admin.status')}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">
              {t('admin.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-700/50">
              <td className="px-4 py-3 text-sm">
                <span className="font-medium">{user.id}</span>
                {user.is_admin && (
                  <span className="ml-2 text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm">{user.total_games}</td>
              <td className="px-4 py-3 text-sm">{user.win_rate.toFixed(1)}%</td>
              <td className="px-4 py-3">
                {user.is_disabled ? (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-900 text-red-300">
                    <UserX className="w-3 h-3 mr-1" />
                    {t('admin.disabled')}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-900 text-green-300">
                    <UserCheck className="w-3 h-3 mr-1" />
                    {t('admin.active')}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {user.id !== 'root' && (
                  <button
                    onClick={() => toggleUser(user.id)}
                    className={`text-sm px-3 py-1 rounded ${
                      user.is_disabled
                        ? 'bg-green-900 text-green-300 hover:bg-green-800'
                        : 'bg-red-900 text-red-300 hover:bg-red-800'
                    }`}
                  >
                    {user.is_disabled ? t('admin.enable') : t('admin.disable')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
