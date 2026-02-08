import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Trophy, X, Calendar, Loader2 } from 'lucide-react';
import { historyApi } from '../../services/api';
import type { GameDetail } from '../../types';

interface GameReplayProps {
  gameId: number;
  onBack: () => void;
}

export function GameReplay({ gameId, onBack }: GameReplayProps) {
  const { t } = useTranslation();
  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGame = async () => {
      setLoading(true);
      try {
        const data = await historyApi.getGameDetail(gameId);
        setGame(data);
      } finally {
        setLoading(false);
      }
    };
    loadGame();
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">{t('common.error')}</p>
        <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 mt-4">
          {t('common.back')}
        </button>
      </div>
    );
  }

  const godLabels = ['A', 'B', 'C'];

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('common.back')}
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-indigo-400">{t('history.gameDetails')}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-gray-400 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(game.date).toLocaleDateString()}
          </div>
          {game.win ? (
            <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-green-900 text-green-300">
              <Trophy className="w-4 h-4 mr-1" />
              {t('history.win')}
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-red-900 text-red-300">
              <X className="w-4 h-4 mr-1" />
              {t('history.loss')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {godLabels.map((label, idx) => (
          <div key={label} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-300 mb-2">{label}</div>
              <div className="text-sm text-gray-400 mb-1">{t('history.actualIdentity')}</div>
              <div className="text-lg font-semibold text-white">
                {t(`identity.${game.god_identities[idx].toLowerCase()}`)}
              </div>
              {game.user_guesses && (
                <>
                  <div className="text-sm text-gray-400 mt-2 mb-1">{t('history.yourGuess')}</div>
                  <div
                    className={`text-lg font-semibold ${
                      game.user_guesses[idx] === game.god_identities[idx]
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {t(`identity.${game.user_guesses[idx].toLowerCase()}`)}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-8">
        <div className="text-indigo-300 font-semibold mb-2">{t('game.languageMapping')}</div>
        <div className="text-yellow-400">
          Yes = "{game.language_map.Yes}", No = "{game.language_map.No}"
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="font-semibold">{t('history.questionLog')}</h3>
        </div>
        <div className="p-4 space-y-4">
          {game.move_history.length === 0 ? (
            <p className="text-gray-400 text-center">{t('game.noQuestions')}</p>
          ) : (
            game.move_history.map((move, idx) => (
              <div key={idx} className="bg-gray-900 rounded-lg p-4">
                {(() => {
                  const isMasked = move.is_masked || move.answer === 'Unknown';
                  return (
                    <>
                <div className="text-sm text-indigo-400 mb-2">
                  {t('history.round', { num: move.round })} - {t(`game.god${godLabels[move.god_index]}`)}
                </div>
                <div className="mb-2">
                  <span className="text-gray-400">Q:</span>{' '}
                  <span className={isMasked ? 'text-gray-500 line-through' : ''}>{move.question}</span>
                </div>
                <div>
                  <span className="text-gray-400">A:</span>{' '}
                  <span className={isMasked ? 'text-gray-500 line-through font-bold' : 'text-yellow-300 font-bold'}>
                    {move.answer}
                  </span>
                </div>
                    </>
                  );
                })()}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
