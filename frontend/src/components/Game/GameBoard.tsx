import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gameApi } from '../../services/api';
import { GodCard } from './GodCard';
import { QuestionArea } from './QuestionArea';
import { ResultModal } from './ResultModal';
import type { MoveHistory, GameResult } from '../../types';

export function GameBoard() {
  const { t } = useTranslation();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [selectedGod, setSelectedGod] = useState<number | null>(null);
  const [guesses, setGuesses] = useState<string[]>(['Unsure', 'Unsure', 'Unsure']);
  const [history, setHistory] = useState<MoveHistory[]>([]);
  const [questionsLeft, setQuestionsLeft] = useState(3);
  const [result, setResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(true);

  const startGame = async () => {
    setLoading(true);
    try {
      const session = await gameApi.startGame();
      setSessionId(session.session_id);
      setSelectedGod(null);
      setGuesses(['Unsure', 'Unsure', 'Unsure']);
      setHistory([]);
      setQuestionsLeft(3);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startGame();
  }, []);

  const handleAsk = async (question: string) => {
    if (sessionId === null || selectedGod === null) return;
    const response = await gameApi.askQuestion(sessionId, selectedGod, question);
    setHistory(response.history);
    setQuestionsLeft(response.questions_left);
  };

  const handleSubmit = async () => {
    if (sessionId === null) return;

    if (guesses.includes('Unsure')) {
      if (!window.confirm(t('game.confirmIncomplete'))) return;
    }

    const gameResult = await gameApi.submitGuess(sessionId, guesses);
    setResult(gameResult);
  };

  const handleGuessChange = (index: number, value: string) => {
    const newGuesses = [...guesses];
    newGuesses[index] = value;
    setGuesses(newGuesses);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">{t('common.loading')}</p>
      </div>
    );
  }

  const godLabels = ['A', 'B', 'C'];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-indigo-400">{t('game.title')}</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {godLabels.map((label, idx) => (
          <GodCard
            key={label}
            godIndex={idx}
            godLabel={label}
            selectedGuess={guesses[idx]}
            onGuessChange={(value) => handleGuessChange(idx, value)}
            isSelected={selectedGod === idx}
            onSelect={() => setSelectedGod(idx)}
          />
        ))}
      </div>

      <div className="mb-6">
        <QuestionArea
          history={history}
          questionsLeft={questionsLeft}
          selectedGod={selectedGod}
          onAsk={handleAsk}
          disabled={false}
        />
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="bg-yellow-600 hover:bg-yellow-700 text-white text-lg font-bold py-3 px-10 rounded-full shadow-lg transform transition hover:scale-105"
        >
          {t('game.submitJudgment')}
        </button>
      </div>

      <ResultModal result={result} onClose={startGame} />
    </div>
  );
}
