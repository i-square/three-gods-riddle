import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Loader2, Sparkles, ScrollText } from 'lucide-react';
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
  const [avatarSeeds, setAvatarSeeds] = useState<number[]>([0, 1, 2]);

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
      // Generate random avatar seeds for each god
      setAvatarSeeds([
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
      ]);
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
    const response = await gameApi.askQuestion(sessionId, targetGod, question);
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
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        <p className="text-gray-400">{t('common.loading')}</p>
      </div>
    );
  }

  const godLabels = ['A', 'B', 'C'];
  const allGuessed = !guesses.includes('Unsure');

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">{t('game.title')}</h1>
        </div>
        <button
          onClick={() => setShowTip(!showTip)}
          className={`
            p-2.5 rounded-xl transition-all duration-300
            ${showTip
              ? 'bg-yellow-500/20 text-yellow-400 shadow-lg shadow-yellow-500/20'
              : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50'
            }
          `}
          title={t('tutorial.step5Title')}
        >
          <Lightbulb className="w-5 h-5" />
        </button>
      </header>

      {/* Tip panel */}
      {showTip && (
        <div className="glass rounded-2xl p-5 mb-6 border border-yellow-500/20 animate-fade-in-up">
          <h4 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            {t('tutorial.step5Title')}
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">{t('tutorial.step5Desc')}</p>
        </div>
      )}

      {/* God cards */}
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
            avatarSeed={avatarSeeds[idx]}
          />
        ))}
      </div>

      {/* Rules section */}
      <div className="glass rounded-2xl p-5 mb-6 border border-white/5 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-3">
          <ScrollText className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-gray-200">{t('game.rulesTitle')}</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>{t('game.rule1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>{t('game.rule2')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>{t('game.rule3')}</span>
          </li>
        </ul>
      </div>

      {/* Question area */}
      <div className="mb-8">
        <QuestionArea
          history={history}
          questionsLeft={questionsLeft}
          selectedGod={selectedGod}
          onSelectGod={setSelectedGod}
          onAsk={handleAsk}
          disabled={false}
        />
      </div>

      {/* Submit button */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          className={`
            relative px-12 py-4 rounded-2xl font-bold text-lg
            transition-all duration-300 transform hover:scale-105
            ${allGuessed
              ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-gray-900 shadow-xl shadow-yellow-500/30 hover:shadow-yellow-500/50'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50'
            }
          `}
        >
          <span className="relative z-10">{t('game.submitJudgment')}</span>
          {allGuessed && (
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 opacity-0 hover:opacity-20 transition-opacity" />
          )}
        </button>
        {!allGuessed && (
          <p className="mt-3 text-sm text-gray-500 animate-pulse">
            {t('game.selectAllHint', { count: guesses.filter(g => g === 'Unsure').length })}
          </p>
        )}
      </div>

      <ResultModal result={result} onClose={startGame} />
    </div>
  );
}
