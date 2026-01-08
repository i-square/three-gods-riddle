import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
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

  const options = ['True', 'False', 'Random'] as const;

  const getGlowClass = () => {
    if (isSelected) return 'god-glow-selected';
    switch (selectedGuess) {
      case 'True': return 'god-glow-true';
      case 'False': return 'god-glow-false';
      case 'Random': return 'god-glow-random';
      default: return '';
    }
  };

  const getOptionStyle = (option: string) => {
    const isCurrent = selectedGuess === option;
    const isDisabled = disabledOptions.includes(option);

    if (isCurrent) {
      switch (option) {
        case 'True': return 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-400 text-white shadow-lg shadow-green-500/30';
        case 'False': return 'bg-gradient-to-r from-red-600 to-rose-600 border-red-400 text-white shadow-lg shadow-red-500/30';
        case 'Random': return 'bg-gradient-to-r from-yellow-600 to-amber-600 border-yellow-400 text-white shadow-lg shadow-yellow-500/30';
      }
    }
    if (isDisabled) return 'bg-gray-800/50 border-gray-700/50 text-gray-600 cursor-not-allowed';
    return 'bg-gray-800/80 border-gray-600/50 text-gray-300 hover:bg-gray-700/80 hover:border-gray-500';
  };

  return (
    <div
      className={`
        relative glass rounded-2xl p-5 cursor-pointer card-hover
        border-2 transition-all duration-300
        animate-fade-in-up stagger-${godIndex + 1}
        ${isSelected
          ? 'border-indigo-400/70 scale-[1.02]'
          : 'border-white/5 hover:border-indigo-500/30'
        }
        ${getGlowClass()}
      `}
      onClick={onSelect}
    >
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-500/30 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-500/30 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-500/30 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-500/30 rounded-br-2xl" />

      {/* God Avatar */}
      <div className={`
        relative h-32 rounded-xl mb-4 flex flex-col items-center justify-center
        bg-gradient-to-br from-gray-800 to-gray-900
        border border-white/5
        ${isSelected ? 'animate-glow-pulse' : ''}
      `}>
        <div className={`relative ${isSelected ? 'animate-float' : ''}`}>
          <MysticalAvatar isSelected={isSelected} seed={avatarSeed} />
          {isSelected && (
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-pulse" />
          )}
        </div>

        {/* God label */}
        <span className={`
          text-xl font-bold transition-all duration-300
          ${isSelected ? 'gradient-text scale-110' : 'text-indigo-300'}
        `}>
          {godLabel}
        </span>
      </div>

      {/* God name */}
      <div className="text-center mb-3">
        <span className="font-semibold text-gray-200">{t(`game.god${godLabel}`)}</span>
      </div>

      {/* Guess options */}
      <div className="flex flex-col gap-2 mb-4">
        {options.map((option) => {
          const isDisabled = disabledOptions.includes(option);
          const isCurrent = selectedGuess === option;

          return (
            <button
              key={option}
              onClick={(e) => {
                e.stopPropagation();
                onGuessChange(isCurrent ? 'Unsure' : option);
              }}
              disabled={isDisabled}
              className={`
                py-2 px-3 rounded-lg text-sm font-medium
                transition-all duration-200 border
                ${getOptionStyle(option)}
                ${isCurrent ? 'scale-[1.02]' : ''}
              `}
            >
              {t(`identity.${option.toLowerCase()}`)}
            </button>
          );
        })}
      </div>

      {/* Ask button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`
          w-full py-2.5 rounded-xl text-sm font-semibold
          transition-all duration-300 border
          ${isSelected
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400/50 text-white shadow-lg shadow-indigo-500/30'
            : 'bg-indigo-900/50 hover:bg-indigo-800/70 border-indigo-700/50 text-indigo-200 hover:text-white'
          }
        `}
      >
        {t('game.askGod', { god: godLabel })}
      </button>
    </div>
  );
}
