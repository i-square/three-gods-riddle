import { useTranslation } from 'react-i18next';
import { Sparkles, CheckCircle2, HelpCircle, XCircle, Zap } from 'lucide-react';
import { MysticalAvatar } from './MysticalAvatar';

interface GodCardProps {
  godIndex: number;
  godLabel: string;
  selectedGuess: string;
  onGuessChange: (guess: string) => void;
  isSelected: boolean;
  onSelect: () => void;
  disabledOptions: string[];
  avatarSeed: number;
}

export function GodCard({
  godIndex,
  godLabel,
  selectedGuess,
  onGuessChange,
  isSelected,
  onSelect,
  disabledOptions,
  avatarSeed,
}: GodCardProps) {
  const { t } = useTranslation();

  const options = [
    { value: 'True', icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/20' },
    { value: 'False', icon: XCircle, color: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-500/20' },
    { value: 'Random', icon: HelpCircle, color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/20' },
  ] as const;

  return (
    <div
      className={`
        god-card-wrapper relative group cursor-pointer
        animate-fade-in-up
      `}
      style={{ animationDelay: `${godIndex * 150}ms` }}
      onClick={onSelect}
    >
      <div className={`
        god-card-inner relative h-full
        glass-card rounded-3xl p-6
        border-2 transition-all duration-500
        ${isSelected 
          ? 'border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.3)] scale-[1.02]' 
          : 'border-white/5 hover:border-indigo-500/30 hover:shadow-lg'
        }
      `}>
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute -top-3 -right-3 bg-indigo-500 text-white p-2 rounded-full shadow-lg animate-bounce-in z-20">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
        )}

        {/* Avatar Section */}
        <div className={`
          relative h-40 rounded-2xl mb-6 flex flex-col items-center justify-center
          bg-gradient-to-b from-gray-800/50 to-gray-900/50
          border border-white/5 overflow-hidden
          group-hover:border-indigo-500/20 transition-colors duration-500
        `}>
          {/* Background Glow */}
          <div className={`
            absolute inset-0 opacity-30 transition-opacity duration-500
            bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]
            ${isSelected ? 'from-indigo-500/40 via-transparent to-transparent opacity-60' : 'from-gray-700/20 via-transparent to-transparent'}
          `} />
          
          <div className={`relative z-10 transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
            <MysticalAvatar isSelected={isSelected} seed={avatarSeed} />
          </div>

          <div className="absolute bottom-3 left-0 right-0 text-center">
            <span className={`
              text-2xl font-bold tracking-wider
              ${isSelected ? 'text-gradient-mystic' : 'text-gray-400'}
            `}>
              {godLabel}
            </span>
          </div>
        </div>

        {/* Identity Selection */}
        <div className="space-y-3 mb-6">
          <p className="text-xs text-center text-gray-500 uppercase tracking-widest font-semibold mb-2">
            {t('game.god')} {godLabel} {t('game.identity')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {options.map((opt) => {
              const isCurrent = selectedGuess === opt.value;
              const isDisabled = disabledOptions.includes(opt.value);
              const Icon = opt.icon;

              return (
                <button
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) onGuessChange(isCurrent ? 'Unsure' : opt.value);
                  }}
                  disabled={isDisabled}
                  className={`
                    relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200
                    ${isCurrent 
                      ? `${opt.bg} ${opt.border} ${opt.color} shadow-lg scale-105 ring-1 ring-inset ring-white/10` 
                      : isDisabled
                        ? 'opacity-30 cursor-not-allowed border-transparent bg-gray-800/50'
                        : 'border-white/5 bg-gray-800/30 text-gray-400 hover:bg-gray-700/50 hover:border-white/10'
                    }
                  `}
                  title={t(`identity.${opt.value.toLowerCase()}`)}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isCurrent ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-bold uppercase">{t(`identity.${opt.value.toLowerCase()}Short`)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`
            w-full py-3 rounded-xl font-bold text-sm tracking-wide
            flex items-center justify-center gap-2
            transition-all duration-300
            ${isSelected
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-400/50'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-white/5'
            }
          `}
        >
          <Zap className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} />
          {t('game.askGod', { god: godLabel })}
        </button>
      </div>
    </div>
  );
}
