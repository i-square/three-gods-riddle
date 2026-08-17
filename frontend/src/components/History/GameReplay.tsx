import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Trophy, X, Calendar, Loader2, Sparkles } from 'lucide-react';
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
      <div className="surface-base p-10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="surface-base p-10 text-center">
        <p className="text-slate-700">{t('common.error')}</p>
        <button onClick={onBack} className="text-teal-700 hover:text-teal-800 mt-4 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
      </div>
    );
  }

  const godLabels = ['A', 'B', 'C'];

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="btn-soft px-4 py-2.5 inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </button>

      <header className="surface-base p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black section-title text-slate-900">{t('history.gameDetails')}</h1>
            <p className="text-slate-600">{new Date(game.date).toLocaleDateString()}</p>
          </div>

          {game.win ? (
            <span className="status-win">
              <Trophy className="w-4 h-4" />
              {t('history.win')}
            </span>
          ) : (
            <span className="status-loss">
              <X className="w-4 h-4" />
              {t('history.loss')}
            </span>
          )}
        </div>
      </header>

      <section className="card-grid">
        {godLabels.map((label, idx) => (
          <article key={label} className="surface-base p-5 text-center">
            <div className="text-3xl font-black text-teal-700 mb-1 section-title">{label}</div>
            <p className="text-sm text-slate-500 mb-2">{t('history.actualIdentity')}</p>
            <p className="font-semibold text-lg text-slate-900 mb-4">{t(`identity.${game.god_identities[idx].toLowerCase()}`)}</p>

            {game.user_guesses && (
              <>
                <p className="text-xs text-slate-500 uppercase tracking-[0.14em]">{t('history.yourGuess')}</p>
                <p
                  className={`font-bold text-lg ${
                    game.user_guesses[idx] === game.god_identities[idx] ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {t(`identity.${game.user_guesses[idx].toLowerCase()}`)}
                </p>
              </>
            )}
          </article>
        ))}
      </section>

      <section className="surface-base p-5">
        <div className="text-lg font-bold text-teal-700 mb-2">{t('game.languageMapping')}</div>
        <p className="text-slate-700">
          <Sparkles className="w-4 h-4 inline-block mr-2" />
          Yes = "{game.language_map.Yes}", No = "{game.language_map.No}"
        </p>
      </section>

      <section className="surface-base p-5">
        <div className="text-lg font-bold text-teal-700 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {t('history.questionLog')}
        </div>
        <div className="space-y-3">
          {game.move_history.length === 0 ? (
            <p className="text-slate-600 text-center">{t('game.noQuestions')}</p>
          ) : (
            game.move_history.map((move, idx) => (
              <div key={idx} className="surface-muted p-4 rounded-xl">
                {(() => {
                  const isMasked = move.is_masked || move.answer === 'Unknown';
                  return (
                    <>
                      <p className="text-xs text-slate-500 mb-2">
                        {t('history.round', { num: move.round })} · {t(`game.god${godLabels[move.god_index]}`)}
                      </p>
                      <p className="text-slate-700 mb-2">
                        <span className="text-slate-500">Q:</span> {isMasked ? <span className="line-through opacity-60">{move.question}</span> : move.question}
                      </p>
                      <p className={isMasked ? 'text-slate-500 font-semibold line-through' : 'text-amber-700 font-semibold'}>
                        <span>A:</span> {isMasked ? <span>{move.answer}</span> : <span>{move.answer}</span>}
                      </p>
                    </>
                  );
                })()}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
