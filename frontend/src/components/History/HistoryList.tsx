import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Calendar, ChevronRight, Loader2, Clock3 } from 'lucide-react';
import { historyApi } from '../../services/api';
import type { GameHistoryItem } from '../../types';

interface HistoryListProps {
  onSelectGame: (gameId: number) => void;
}

export function HistoryList({ onSelectGame }: HistoryListProps) {
  const { t } = useTranslation();
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);

  const loadGames = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const newOffset = reset ? 0 : offsetRef.current;
      const data = await historyApi.getHistory(20, newOffset);
      if (reset) {
        setGames(data);
      } else {
        setGames((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 20);
      offsetRef.current = newOffset + data.length;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGames(true);
  }, [loadGames]);

  if (loading && games.length === 0) {
    return (
      <div className="surface-base p-10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
      </div>
    );
  }

  if (games.length === 0) {
    return <p className="surface-base p-10 text-center text-slate-600">{t('history.noHistory')}</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-black section-title text-slate-900">{t('history.title')}</h1>
          <p className="text-slate-600">{t('nav.history')}</p>
        </div>
      </div>

      <div className="surface-base overflow-hidden">
        <div className="hidden lg:grid grid-cols-[1.5fr_0.9fr_0.9fr_0.4fr] gap-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-600 px-4 py-3 border-b border-slate-200">
          <span>{t('history.date')}</span>
          <span>{t('history.questions')}</span>
          <span>{t('history.result')}</span>
          <span className="text-right">{t('game.title')}</span>
        </div>

        <div className="divide-y divide-slate-200">
          {games.map((game) => (
            <div key={game.id} className="p-4 sm:p-5 lg:rounded-none rounded-xl">
              <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.9fr_0.9fr_0.4fr] gap-2 lg:items-center">
                <div className="text-sm text-slate-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                  <span>{new Date(game.date).toLocaleDateString()}</span>
                </div>

                <div className="text-sm text-slate-700">{t('history.questions')}：{game.questions_asked}</div>

                <div>
                  {!game.completed ? (
                    <span className="status-neutral">
                      <Clock3 className="w-3.5 h-3.5" />
                      {t('history.inProgress')}
                    </span>
                  ) : game.win ? (
                    <span className="status-win">
                      <Trophy className="w-3.5 h-3.5" />
                      {t('history.win')}
                    </span>
                  ) : (
                    <span className="status-loss">
                      {t('history.loss')}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  {game.completed && (
                    <button
                      onClick={() => onSelectGame(game.id)}
                      className="btn-soft px-3 py-2 text-xs inline-flex items-center"
                    >
                      {t('history.viewDetails')}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => loadGames()}
            disabled={loading}
            className="btn-soft px-4 py-2"
          >
            {loading ? t('common.loading') : t('game.loadMore')}
          </button>
        </div>
      )}
    </section>
  );
}
