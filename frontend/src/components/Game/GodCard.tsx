import { useTranslation } from 'react-i18next';
import { VenetianMask } from 'lucide-react';

interface GodCardProps {
  godIndex: number;
  godLabel: string;
  selectedGuess: string;
  onGuessChange: (guess: string) => void;
  isSelected: boolean;
  onSelect: () => void;
  disabledOptions: string[];
}

export function GodCard({
  godLabel,
  selectedGuess,
  onGuessChange,
  isSelected,
  onSelect,
  disabledOptions,
}: GodCardProps) {
  const { t } = useTranslation();

  const options = ['True', 'False', 'Random'];

  return (
    <div
      className={`bg-gray-800 p-4 rounded-lg border-2 transition cursor-pointer ${
        isSelected ? 'border-indigo-500 shadow-lg bg-gray-700' : 'border-transparent hover:border-gray-600'
      }`}
      onClick={onSelect}
    >
      <div className="h-32 bg-gray-700 rounded mb-4 flex flex-col items-center justify-center text-indigo-300">
        <VenetianMask className="w-12 h-12 mb-2" />
        <span className="text-3xl font-bold">{godLabel}</span>
      </div>
      <div className="text-center mb-2 font-bold">{t(`game.god${godLabel}`)}</div>
      
      <div className="flex flex-col gap-2 mb-4">
        {options.map((option) => {
          const isDisabled = disabledOptions.includes(option);
          const isCurrent = selectedGuess === option;
          
          return (
            <button
              key={option}
              onClick={(e) => {
                e.stopPropagation();
                // If clicking currently selected, unselect (set to Unsure)
                if (isCurrent) {
                  onGuessChange('Unsure');
                } else {
                  onGuessChange(option);
                }
              }}
              disabled={isDisabled}
              className={`py-1 px-2 rounded text-sm font-medium transition-colors border ${
                isCurrent
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : isDisabled
                  ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-900 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500'
              }`}
            >
              {t(`identity.${option.toLowerCase()}`)}
            </button>
          );
        })}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`w-full text-xs py-2 rounded border transition ${
          isSelected
            ? 'bg-indigo-600 border-indigo-500 text-white'
            : 'bg-indigo-900 hover:bg-indigo-800 border-indigo-700'
        }`}
      >
        {t('game.askGod', { god: godLabel })}
      </button>
    </div>
  );
}
