import { useTranslation } from 'react-i18next';
import { X, Sparkles, Crown, Skull, RefreshCw, Check, X as XIcon, HelpCircle, Trophy } from 'lucide-react';
import type { GameResult } from '../../types';

interface ResultModalProps {
  result: GameResult | null;
  onClose: () => void;
}

export function ResultModal({ result, onClose }: ResultModalProps) {
  const { t } = useTranslation();

  if (!result) return null;

  const godLabels = ['A', 'B', 'C'];
  const isWin = result.win;

  const particles = Array.from({ length: 28 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    top: `${(i * 53) % 100}%`,
    animationDelay: `${(i % 5) * 0.7}s`,
    opacity: 0.18 + (i % 6) * 0.08,
    size: 9 + (i % 4) * 3,
  }));

  const getIdentityIcon = (identity: string) => {
    switch (identity) {
      case 'True':
        return <Check className="w-4 h-4" />;
      case 'False':
        return <XIcon className="w-4 h-4" />;
      case 'Random':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getIdentityStyle = (identity: string) => {
    switch (identity) {
      case 'True':
        return 'status-win bg-emerald-50 border-emerald-300 text-emerald-700';
      case 'False':
        return 'status-loss bg-rose-50 border-rose-300 text-rose-700';
      case 'Random':
        return 'bg-amber-50 border-amber-300 text-amber-700';
      default:
        return 'status-neutral';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {isWin && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute animate-float-slow"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.animationDelay,
                opacity: particle.opacity,
              }}
            >
              <Sparkles className="text-amber-400" style={{ width: particle.size, height: particle.size }} />
            </div>
          ))}
        </div>
      )}

      <div
        className={`relative w-full max-w-xl surface-elevated p-6 sm:p-8 my-2 sm:my-8 border border-slate-300 animate-scale-in`
        + (isWin ? ' ring-2 ring-amber-200/80' : ' ring-2 ring-slate-200/80')}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700">
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-6">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${
              isWin ? 'bg-amber-500/15 border-amber-300 text-amber-700' : 'bg-slate-700/10 border-slate-300 text-slate-700'
            }`}
          >
            {isWin ? <Crown className="w-11 h-11" /> : <Skull className="w-11 h-11" />}
          </div>
        </div>

        <div className="text-center mb-7">
          <h2 className="text-4xl sm:text-5xl font-black section-title mb-2 text-myth">{isWin ? t('game.victory') : t('game.defeat')}</h2>
          <p className="text-slate-600">{isWin ? t('game.victoryMessage') : t('game.defeatMessage')}</p>
        </div>

        <div className="surface-base p-6 rounded-xl mb-7">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <Trophy className="w-4 h-4 text-teal-700" />
            <span className="font-bold text-slate-700 uppercase tracking-[0.1em] text-xs">{t('game.truthRevealed')}</span>
          </div>

          <div className="space-y-3">
            {result.identities.map((identity, idx) => (
              <div
                key={idx}
                className={`
                  flex items-center justify-between p-3 rounded-xl border text-sm font-semibold
                  ${getIdentityStyle(identity)}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-slate-900/5 flex items-center justify-center font-black">{godLabels[idx]}</span>
                  <span>{t(`game.god${godLabels[idx]}`)}</span>
                </div>
                <span className="flex items-center gap-2">
                  {getIdentityIcon(identity)}
                  {t(`identity.${identity.toLowerCase()}`)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 mb-1">{t('game.yesMeans')}</p>
              <p className="text-lg font-black text-cyan-700">"{result.language_map.Yes}"</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 mb-1">{t('game.noMeans')}</p>
              <p className="text-lg font-black text-rose-700">"{result.language_map.No}"</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {t('game.playAgain')}
        </button>
      </div>
    </div>
  );
}
