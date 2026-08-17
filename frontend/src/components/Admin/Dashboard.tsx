import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Gamepad2, Trophy, Percent, Loader2 } from 'lucide-react';
import { adminApi } from '../../services/api';
import { UserList } from './UserList';
import { LLMConfigPanel } from './LLMConfigPanel';
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
      <div className="surface-base p-10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
      </div>
    );
  }

  const statCards =
    stats
      ? [
          { label: t('admin.totalUsers'), value: stats.total_users, icon: Users },
          { label: t('admin.totalGames'), value: stats.total_games, icon: Gamepad2 },
          { label: t('admin.completedGames'), value: stats.completed_games, icon: Gamepad2 },
          { label: t('admin.totalWins'), value: stats.total_wins, icon: Trophy },
          {
            label: t('admin.overallWinRate'),
            value: `${stats.overall_win_rate.toFixed(1)}%`,
            icon: Percent,
          },
        ]
      : [];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black section-title text-slate-900">{t('admin.title')}</h1>
        <p className="text-slate-600">{t('admin.stats')}</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <article key={idx} className="surface-base p-5">
            <div className="flex items-center justify-between mb-2">
              <card.icon className="w-5 h-5 text-teal-700" />
            </div>
            <p className="text-2xl font-black section-title text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-600">{card.label}</p>
          </article>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-3">{t('admin.users')}</h2>
        <UserList />
      </section>

      <section>
        <LLMConfigPanel />
      </section>
    </div>
  );
}
