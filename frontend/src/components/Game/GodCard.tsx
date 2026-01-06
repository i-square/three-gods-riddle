import { useTranslation } from 'react-i18next';

interface GodCardProps {
  godIndex: number;
  godLabel: string;
  selectedGuess: string;
  onGuessChange: (guess: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

export function GodCard({
  godLabel,
  selectedGuess,
  onGuessChange,
  isSelected,
  onSelect,
}: GodCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`bg-gray-800 p-4 rounded-lg border-2 transition cursor-pointer ${
        isSelected ? 'border-indigo-500 shadow-lg bg-gray-700' : 'border-transparent hover:border-gray-600'
      }`}
      onClick={onSelect}
    >
      <div className="h-32 bg-gray-700 rounded mb-4 flex items-center justify-center text-4xl font-bold text-indigo-300">
        {godLabel}
      </div>
      <div className="text-center mb-2 font-bold">{t(`game.god${godLabel}`)}</div>
      <select
        value={selectedGuess}
        onChange={(e) => {
          e.stopPropagation();
          onGuessChange(e.target.value);
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm mb-2"
      >
        <option value="Unsure">{t('game.selectIdentity')}</option>
        <option value="True">{t('game.true')}</option>
        <option value="False">{t('game.false')}</option>
        <option value="Random">{t('game.random')}</option>
      </select>
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
