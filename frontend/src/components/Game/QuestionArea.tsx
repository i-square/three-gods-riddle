import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import type { MoveHistory } from '../../types';

interface QuestionAreaProps {
  history: MoveHistory[];
  questionsLeft: number;
  selectedGod: number | null;
  onAsk: (question: string) => Promise<void>;
  disabled: boolean;
}

export function QuestionArea({
  history,
  questionsLeft,
  selectedGod,
  onAsk,
  disabled,
}: QuestionAreaProps) {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const godLabels = ['A', 'B', 'C'];

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async () => {
    if (!question.trim() || selectedGod === null || disabled || loading) return;
    setLoading(true);
    try {
      await onAsk(question.trim());
      setQuestion('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <div className="flex justify-between mb-4">
        <h3 className="font-bold text-lg">{t('game.dialogue')}</h3>
        <span className="text-sm bg-gray-700 px-2 py-1 rounded">
          {t('game.questionsLeft')}: <span className="text-indigo-400 font-bold">{questionsLeft}</span>
        </span>
      </div>

      <div
        ref={chatRef}
        className="bg-gray-900 rounded p-4 h-48 overflow-y-auto mb-4 space-y-3 text-sm"
      >
        {history.length === 0 ? (
          <p className="text-gray-500 italic text-center">{t('game.noQuestions')}</p>
        ) : (
          history.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-end">
                <div className="bg-gray-700 px-3 py-2 rounded-xl rounded-br-none max-w-[80%]">
                  <span className="font-semibold text-indigo-300">
                    {t('game.toGod', { god: godLabels[item.god_index] })}:
                  </span>{' '}
                  {item.question}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-indigo-900 px-3 py-2 rounded-xl rounded-bl-none max-w-[80%] border border-indigo-700">
                  <span className="font-semibold text-indigo-300">
                    {t(`game.god${godLabels[item.god_index]}`)}:
                  </span>{' '}
                  <span className="text-yellow-300 font-bold">{item.answer}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={t('game.enterQuestion')}
          disabled={disabled || selectedGod === null || questionsLeft === 0}
          className="flex-1 bg-gray-700 border border-gray-600 rounded p-2 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || selectedGod === null || questionsLeft === 0 || loading || !question.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition flex items-center"
        >
          <Send className="w-4 h-4 mr-1" />
          {t('game.ask')}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {t('game.targeting')}:{' '}
        <span className="text-indigo-300 font-bold">
          {selectedGod !== null ? t(`game.god${godLabels[selectedGod]}`) : t('game.none')}
        </span>
      </p>
    </div>
  );
}
