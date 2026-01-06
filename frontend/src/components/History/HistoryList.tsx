import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, X, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { historyApi } from '../../services/api';
import type { GameHistoryItem } from '../../types';

interface HistoryListProps {
  onSelectGame: (gameId: number) => void;
}

export function HistoryList({ onSelectGame }: HistoryListProps) {
  const { t } = useTranslation();
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadGames = async (reset = false) => {
    setLoading(true);
    try {
      const newOffset = reset ? 0 : offset;
      const data = await historyApi.getHistory(20, newOffset);
      if (reset) {
        setGames(data);
      } else {
        setGames((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 20);
      setOffset(newOffset + data.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames(true);
  }, []);

  if (loading && games.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">{t('history.noHistory')}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-indigo-400 mb-6">{t('history.title')}</h1>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                {t('history.date')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                {t('history.questions')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                {t('history.result')}
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {games.map((game) => (
              <tr key={game.id} className="hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {new Date(game.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{game.questions_asked}</td>
                <td className="px-4 py-3">
                  {!game.completed ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-600 text-gray-300">
                      {t('history.inProgress')}
                    </span>
                  ) : game.win ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-900 text-green-300">
                      <Trophy className="w-3 h-3 mr-1" />
                      {t('history.win')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-900 text-red-300">
                      <X className="w-3 h-3 mr-1" />
                      {t('history.loss')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {game.completed && (
                    <button
                      onClick={() => onSelectGame(game.id)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center ml-auto"
                    >
                      {t('history.viewDetails')}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={() => loadGames()}
            disabled={loading}
            className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
          >
            {loading ? t('common.loading') : 'Load more...'}
          </button>
        </div>
      )}
    </div>
  );
}
