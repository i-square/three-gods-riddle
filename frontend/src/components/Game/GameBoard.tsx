import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Loader2, Sparkles, ScrollText, ArrowRight, BrainCircuit } from 'lucide-react';
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
      const availableSeeds = Array.from({ length: 10 }, (_, i) => i);
      const shuffled = availableSeeds.sort(() => Math.random() - 0.5);
      setAvatarSeeds(shuffled.slice(0, 3));
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse-glow" />
          <Loader2 className="w-16 h-16 text-indigo-400 animate-spin-slow relative z-10" />
        </div>
        <p className="text-indigo-200 font-medium tracking-widest uppercase text-sm animate-pulse">
          {t('common.loading')}
        </p>
      </div>
    );
  }

  const godLabels = ['A', 'B', 'C'];
  const allGuessed = !guesses.includes('Unsure');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {t('game.headerTitle')}
              </span> {t('game.headerSubtitle')}
            </h1>
          </div>
          <p className="text-gray-400 max-w-xl leading-relaxed">
            {t('game.description')}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowTip(!showTip)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border
              ${showTip
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-gray-800/50 border-white/5 text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            `}
          >
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-medium">{t('tutorial.step5Title')}</span>
          </button>
        </div>
      </header>

      {/* Tip Panel */}
      {showTip && (
        <div className="glass-panel rounded-2xl p-6 mb-8 border-l-4 border-l-amber-500 animate-fade-in-up">
          <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t('game.strategicInsight')}
          </h4>
          <p className="text-gray-300 leading-relaxed">{t('tutorial.step5Desc')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: God Cards */}
        <div className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

          {/* Rules Summary */}
          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <ScrollText className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-gray-200 uppercase tracking-wider text-sm">{t('game.rulesTitle')}</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                <span>{t('game.rule1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                <span>{t('game.rule2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                <span>{t('game.rule3')}</span>
              </li>
            </ul>
          </div>

          {/* Submit Action */}
          <div className="flex flex-col items-center justify-center pt-4">
            <button
              onClick={handleSubmit}
              className={`
                group relative px-8 py-4 rounded-2xl font-bold text-lg tracking-wide
                transition-all duration-500 w-full sm:w-auto min-w-[200px]
                ${allGuessed
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] hover:scale-105'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                }
              `}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t('game.submitJudgment')}
                {allGuessed && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
              {allGuessed && (
                <div className="absolute inset-0 rounded-2xl bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
            </button>
            
            {!allGuessed && (
              <p className="mt-4 text-sm text-gray-500 animate-pulse flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                {t('game.selectAllHint', { count: guesses.filter(g => g === 'Unsure').length })}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Chat Interface */}
        <div className="lg:col-span-5">
          <div className="sticky top-8">
            <QuestionArea
              history={history}
              questionsLeft={questionsLeft}
              selectedGod={selectedGod}
              onSelectGod={setSelectedGod}
              onAsk={handleAsk}
              disabled={false}
            />
          </div>
        </div>
      </div>

      <ResultModal result={result} onClose={startGame} />
    </div>
  );
}
