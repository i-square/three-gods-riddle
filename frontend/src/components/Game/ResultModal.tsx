import { useTranslation } from 'react-i18next';
import { Trophy, X, Sparkles, Crown, Skull } from 'lucide-react';
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

  const getIdentityColor = (identity: string) => {
    switch (identity) {
      case 'True': return 'text-green-400';
      case 'False': return 'text-red-400';
      case 'Random': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getIdentityBg = (identity: string) => {
    switch (identity) {
      case 'True': return 'bg-green-500/10 border-green-500/30';
      case 'False': return 'bg-red-500/10 border-red-500/30';
      case 'Random': return 'bg-yellow-500/10 border-yellow-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      {/* Background particles for victory */}
      {isWin && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-yellow-400/60 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                width: `${12 + Math.random() * 12}px`,
              }}
            />
          ))}
        </div>
      )}

      <div className={`
        relative glass rounded-3xl p-8 max-w-md w-full mx-4
        animate-scale-in
        ${isWin ? 'animate-victory-glow' : 'animate-defeat-shake'}
      `}>
        {/* Decorative top accent */}
        <div className={`
          absolute -top-px left-1/2 -translate-x-1/2 w-32 h-1 rounded-full
          ${isWin ? 'bg-gradient-to-r from-transparent via-yellow-400 to-transparent' : 'bg-gradient-to-r from-transparent via-red-400 to-transparent'}
        `} />

        {/* Result header */}
        <div className="text-center mb-6">
          <div className={`
            inline-flex items-center justify-center w-20 h-20 rounded-full mb-4
            animate-bounce-in
            ${isWin
              ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/50'
              : 'bg-gradient-to-br from-red-500 to-rose-700 shadow-lg shadow-red-500/50'
            }
          `}>
            {isWin ? (
              <Crown className="w-10 h-10 text-white" />
            ) : (
              <Skull className="w-10 h-10 text-white" />
            )}
          </div>

          <h2 className={`
            text-3xl font-bold mb-2
            ${isWin ? 'gradient-text' : 'text-red-400'}
          `}>
            {isWin ? t('game.victory') : t('game.defeat')}
          </h2>
          <p className="text-gray-400">
            {isWin ? t('game.victoryMessage') : t('game.defeatMessage')}
          </p>
        </div>

        {/* Truth revealed section */}
        <div className="bg-gray-900/50 rounded-2xl p-5 mb-6 border border-white/5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-indigo-300">{t('game.truthRevealed')}</span>
          </div>

          <div className="space-y-3">
            {result.identities.map((identity, idx) => (
              <div
                key={idx}
                className={`
                  flex items-center justify-between p-3 rounded-xl border
                  animate-fade-in-up
                  ${getIdentityBg(identity)}
                `}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                    <span className="font-bold text-indigo-300">{godLabels[idx]}</span>
                  </div>
                  <span className="text-gray-300">{t(`game.god${godLabels[idx]}`)}</span>
                </div>
                <span className={`font-bold ${getIdentityColor(identity)}`}>
                  {t(`identity.${identity.toLowerCase()}`)}
                </span>
              </div>
            ))}
          </div>

          {/* Language mapping */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Yes =</span>
                <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  "{result.language_map.Yes}"
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">No =</span>
                <span className="font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">
                  "{result.language_map.No}"
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Play again button */}
        <button
          onClick={onClose}
          className={`
            w-full py-3.5 rounded-xl font-bold text-lg
            transition-all duration-300 transform hover:scale-[1.02]
            ${isWin
              ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-gray-900 shadow-lg shadow-yellow-500/30'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30'
            }
          `}
        >
          {t('game.playAgain')}
        </button>
      </div>
    </div>
  );
}
