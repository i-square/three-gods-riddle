import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb } from 'lucide-react';
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
  const [showTip, setShowTip] = useState(false);

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

  const handleAsk = async (question: string, overrideGodIndex?: number) => {
    const targetGod = overrideGodIndex !== undefined ? overrideGodIndex : selectedGod;
    
    if (sessionId === null || targetGod === null) return;
    
    console.log('Sending question to god:', targetGod, 'Question:', question);
    const response = await gameApi.askQuestion(sessionId, targetGod, question);
    console.log('API Response:', response);
    console.log('Setting history to:', response.history);
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
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-400">{t('game.title')}</h1>
        <button
          onClick={() => setShowTip(!showTip)}
          className={`p-2 rounded-full transition-colors ${
            showTip ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800'
          }`}
          title={t('tutorial.step5Title')}
        >
          <Lightbulb className="w-6 h-6" />
        </button>
      </header>

      {showTip && (
        <div className="bg-yellow-900/30 p-4 rounded mb-6 border border-yellow-500/30 animate-fade-in relative">
          <h4 className="font-bold text-yellow-400 mb-1 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            {t('tutorial.step5Title')}
          </h4>
          <p className="text-sm text-gray-200">{t('tutorial.step5Desc')}</p>
        </div>
      )}

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
            disabledOptions={guesses.filter((g, i) => i !== idx && g !== 'Unsure')}
          />
        ))}
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700/50 text-sm">
        <h3 className="font-bold text-gray-300 mb-2">{t('game.rulesTitle')}</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-400">
          <li>{t('game.rule1')}</li>
          <li>{t('game.rule2')}</li>
          <li>{t('game.rule3')}</li>
        </ul>
      </div>

      <div className="mb-6">
        <QuestionArea
          history={history}
          questionsLeft={questionsLeft}
          selectedGod={selectedGod}
          onSelectGod={setSelectedGod}
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
