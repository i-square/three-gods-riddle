import { useTranslation } from 'react-i18next';
import { Trophy, X } from 'lucide-react';
import type { GameResult } from '../../types';

interface ResultModalProps {
  result: GameResult | null;
  onClose: () => void;
}

export function ResultModal({ result, onClose }: ResultModalProps) {
  const { t } = useTranslation();

  if (!result) return null;

  const godLabels = ['A', 'B', 'C'];

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-2xl border border-gray-600 mx-4">
        <div className="text-center mb-4">
          {result.win ? (
            <>
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-green-400">{t('game.victory')}</h2>
              <p className="text-gray-300">{t('game.victoryMessage')}</p>
            </>
          ) : (
            <>
              <X className="w-16 h-16 text-red-400 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-red-400">{t('game.defeat')}</h2>
              <p className="text-gray-300">{t('game.defeatMessage')}</p>
            </>
          )}
        </div>

        <div className="bg-gray-900 p-4 rounded text-sm font-mono mb-6">
          <div className="mb-2 text-indigo-300 border-b border-gray-700 pb-2 font-semibold">
            {t('game.truthRevealed')}
          </div>
          {result.identities.map((identity, idx) => (
            <div key={idx} className="flex justify-between mb-1">
              <span>{t(`game.god${godLabels[idx]}`)}</span>
              <span className="text-white">{identity}</span>
            </div>
          ))}
          <div className="mt-4 pt-2 border-t border-gray-700 text-yellow-500">
            {t('game.languageMapping')}: Yes = "{result.language_map.Yes}", No = "{result.language_map.No}"
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition"
        >
          {t('game.playAgain')}
        </button>
      </div>
    </div>
  );
}
