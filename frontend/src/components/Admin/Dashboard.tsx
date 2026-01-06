import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Gamepad2, Trophy, Percent, Loader2 } from 'lucide-react';
import { adminApi } from '../../services/api';
import { UserList } from './UserList';
import type { AdminStats } from '../../types';

export function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: t('admin.totalUsers'), value: stats.total_users, icon: Users },
        { label: t('admin.totalGames'), value: stats.total_games, icon: Gamepad2 },
        { label: t('admin.completedGames'), value: stats.completed_games, icon: Gamepad2 },
        { label: t('admin.totalWins'), value: stats.total_wins, icon: Trophy },
        { label: t('admin.overallWinRate'), value: `${stats.overall_win_rate.toFixed(1)}%`, icon: Percent },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-indigo-400 mb-6">{t('admin.title')}</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-300 mb-4">{t('admin.stats')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <card.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="text-sm text-gray-400">{card.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-300 mb-4">{t('admin.users')}</h2>
        <UserList />
      </div>
    </div>
  );
}
