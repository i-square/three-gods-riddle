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
    { value: 'True', icon: CheckCircle2, color: 'text-emerald-700', border: 'border-emerald-300', bg: 'bg-emerald-100', ring: 'ring-emerald-300/60' },
    { value: 'False', icon: XCircle, color: 'text-rose-700', border: 'border-rose-300', bg: 'bg-rose-100', ring: 'ring-rose-300/60' },
    { value: 'Random', icon: HelpCircle, color: 'text-amber-700', border: 'border-amber-300', bg: 'bg-amber-100', ring: 'ring-amber-300/60' },
  ] as const;

  return (
    <div
      className={`god-card-wrapper animate-fade-in-up`}
      style={{ animationDelay: `${godIndex * 140}ms` }}
      onClick={onSelect}
    >
      <div
        className={`god-card-inner h-full surface-muted rounded-[var(--radius-3xl)] p-5 border-2 transition-all duration-300 ${
          isSelected
            ? 'border-teal-300/90 shadow-[0_0_0_1px_rgba(13,148,136,0.45)] scale-[1.015]'
            : 'border-slate-300/80 hover:border-teal-300/90 hover:shadow-[0_12px_24px_rgba(13,148,136,0.15)]'
        }`}
      >
        {isSelected && (
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg z-10">
            <Sparkles className="w-4 h-4" />
          </div>
        )}

        <div className="relative h-40 rounded-2xl mb-5 border border-slate-300/80 overflow-hidden bg-gradient-to-b from-white to-slate-100 flex items-center justify-center">
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              isSelected ? 'opacity-80' : 'opacity-40'
            } bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.18),_transparent_50%),_radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.17),_transparent_50%)]`}
          />
          <div
            className={`relative z-10 transform transition-transform duration-400 ${
              isSelected ? 'scale-110' : ''
            }`}
          >
            <MysticalAvatar isSelected={isSelected} seed={avatarSeed} />
          </div>
          <div className="absolute inset-x-0 bottom-3 text-center">
            <span className={`text-2xl font-black tracking-wider section-title ${isSelected ? 'text-brand-gradient' : 'text-slate-700'}`}>
              {godLabel}
            </span>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-600 font-bold">
            {t('game.god')} {godLabel} {t('game.identity')}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
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
                  relative rounded-xl border p-2 transition-all duration-200 flex flex-col items-center justify-center gap-1
                  ${
                    isCurrent
                      ? `${opt.bg} ${opt.border} ${opt.color} shadow-md ring-2 ${opt.ring}`
                      : isDisabled
                      ? 'bg-slate-100/70 text-slate-400 border-transparent cursor-not-allowed'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }
                `}
                title={t(`identity.${opt.value.toLowerCase()}`)}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-bold uppercase">{t(`identity.${opt.value.toLowerCase()}Short`)}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="btn-soft w-full py-2.5 flex items-center justify-center gap-2"
        >
          <Zap className={`w-4 h-4 ${isSelected ? 'text-teal-700' : 'text-slate-600'}`} />
          {t('game.askGod', { god: godLabel })}
        </button>
      </div>
    </div>
  );
}
