import { useTranslation } from 'react-i18next';
import { X, Sparkles, Crown, Skull, RefreshCw, Check, X as XIcon, HelpCircle } from 'lucide-react';
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

  const particles = Array.from({ length: 30 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    top: `${(i * 53) % 100}%`,
    animationDelay: `${(i % 5) * 0.8}s`,
    opacity: 0.2 + (i % 6) * 0.08,
    size: 10 + (i % 5) * 4,
  }));

  const getIdentityIcon = (identity: string) => {
    switch (identity) {
      case 'True': return <Check className="w-5 h-5" />;
      case 'False': return <XIcon className="w-5 h-5" />;
      case 'Random': return <HelpCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const getIdentityStyle = (identity: string) => {
    switch (identity) {
      case 'True': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'False': return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'Random': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default: return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/90 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />

      {/* Victory Particles */}
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
              <Sparkles 
                className="text-yellow-400" 
                style={{ width: particle.size, height: particle.size }} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal Content */}
      <div className={`
        relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 my-2 sm:my-8 pr-14
        max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto
        shadow-2xl border border-white/10
        animate-scale-in
        ${isWin ? 'shadow-yellow-500/20' : 'shadow-rose-500/20'}
      `}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className={`
            relative w-24 h-24 rounded-full flex items-center justify-center
            bg-gradient-to-br shadow-lg animate-bounce-in
            ${isWin 
              ? 'from-yellow-400 to-amber-600 shadow-yellow-500/40' 
              : 'from-rose-500 to-red-700 shadow-rose-500/40'
            }
          `}>
            {isWin ? (
              <Crown className="w-12 h-12 text-white drop-shadow-md" />
            ) : (
              <Skull className="w-12 h-12 text-white drop-shadow-md" />
            )}
            
            {/* Glow Ring */}
            <div className={`
              absolute inset-0 rounded-full animate-pulse-glow opacity-50
              ${isWin ? 'bg-yellow-400 blur-xl' : 'bg-rose-500 blur-xl'}
            `} />
          </div>
        </div>

        {/* Title & Message */}
        <div className="text-center mb-8">
          <h2 className={`
            text-4xl font-bold mb-3 tracking-tight
            ${isWin ? 'text-gradient-gold' : 'text-rose-400'}
          `}>
            {isWin ? t('game.victory') : t('game.defeat')}
          </h2>
          <p className="text-gray-400 text-lg">
            {isWin ? t('game.victoryMessage') : t('game.defeatMessage')}
          </p>
        </div>

        {/* Truth Revealed */}
        <div className="bg-gray-900/50 rounded-2xl p-6 mb-8 border border-white/5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-indigo-200 uppercase tracking-wider text-xs">
              {t('game.truthRevealed')}
            </span>
          </div>

          <div className="space-y-3">
            {result.identities.map((identity, idx) => (
              <div
                key={idx}
                className={`
                  flex items-center justify-between p-4 rounded-xl border
                  animate-fade-in-up
                  ${getIdentityStyle(identity)}
                `}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-900/50 flex items-center justify-center font-bold text-lg">
                    {godLabels[idx]}
                  </div>
                  <span className="font-medium text-gray-200">{t(`game.god${godLabels[idx]}`)}</span>
                </div>
                
                <div className="flex items-center gap-2 font-bold">
                  {getIdentityIcon(identity)}
                  <span>{t(`identity.${identity.toLowerCase()}`)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Language Map */}
          <div className="mt-6 pt-4 border-t border-white/5 flex justify-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-gray-500 font-bold mb-1">{t('game.yesMeans')}</span>
              <span className="font-mono text-xl font-bold text-cyan-400">"{result.language_map.Yes}"</span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-gray-500 font-bold mb-1">{t('game.noMeans')}</span>
              <span className="font-mono text-xl font-bold text-pink-400">"{result.language_map.No}"</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`
            w-full py-4 rounded-xl font-bold text-lg tracking-wide
            flex items-center justify-center gap-2
            transition-all duration-300 transform hover:scale-[1.02]
            ${isWin
              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/30'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
            }
          `}
        >
          <RefreshCw className="w-5 h-5" />
          {t('game.playAgain')}
        </button>
      </div>
    </div>
  );
}
