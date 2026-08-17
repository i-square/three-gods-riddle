import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Loader2, Sparkles, ScrollText, ArrowRight, Clock3, WandSparkles } from 'lucide-react';
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
          <div className="absolute inset-0 bg-teal-200 blur-2xl opacity-35 animate-pulse-glow" />
          <Loader2 className="relative z-10 w-14 h-14 text-teal-600 animate-spin-slow" />
        </div>
        <p className="text-teal-700 font-semibold tracking-wide uppercase text-sm animate-pulse">
          {t('common.loading')}
        </p>
      </div>
    );
  }

  const godLabels = ['A', 'B', 'C'];
  const allGuessed = !guesses.includes('Unsure');

  return (
    <div className="space-y-6">
      <header className="surface-base p-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="badge">{t('game.rulesTitle')}</div>
          <h1 className="mt-3 text-3xl sm:text-4xl section-title text-myth font-black">
            <span className="text-brand-gradient">{t('game.headerTitle')}</span> {t('game.headerSubtitle')}
          </h1>
          <p className="mt-3 text-slate-700 max-w-2xl">{t('game.description')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
          <div className="surface-muted px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
            <Clock3 className="w-4 h-4 text-teal-700" />
            <span className="font-semibold text-slate-700">{t('game.questionsLeft')}</span>
            <span className="text-teal-700 font-black">{questionsLeft}</span>
          </div>

          <button
            onClick={() => setShowTip(!showTip)}
            className={`btn-soft px-4 py-2.5 flex items-center gap-2 text-sm ${
              showTip ? 'bg-teal-50 text-teal-800 border-teal-300' : ''
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            {t('tutorial.step5Title')}
          </button>
        </div>
      </header>

      {showTip && (
        <div className="surface-base p-6 border-l-4 border-teal-500 animate-fade-in-up rounded-xl">
          <h4 className="font-bold text-teal-700 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t('game.strategicInsight')}
          </h4>
          <p className="text-slate-700 leading-relaxed">{t('tutorial.step5Desc')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_410px] gap-6">
        <section className="surface-base p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

          <div className="surface-muted p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <ScrollText className="w-4 h-4 text-teal-700" />
              <h3 className="font-bold text-slate-800 section-title uppercase tracking-[0.08em] text-xs">
                {t('game.rulesTitle')}
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-teal-600" />
                {t('game.rule1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-teal-600" />
                {t('game.rule2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-teal-600" />
                {t('game.rule3')}
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center justify-center pt-2">
            <button
              onClick={handleSubmit}
              className={`w-full sm:w-auto min-w-[220px] py-3 px-8 rounded-2xl font-bold text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                allGuessed
                  ? 'btn-primary shadow-[0_14px_30px_rgba(13,148,136,0.25)]'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
              }`}
            >
              {t('game.submitJudgment')}
              <ArrowRight className="w-5 h-5" />
            </button>

            {!allGuessed && (
              <p className="mt-3 text-sm text-slate-600 flex items-center gap-2">
                <WandSparkles className="w-3.5 h-3.5 text-teal-700" />
                {t('game.selectAllHint', { count: guesses.filter((g) => g === 'Unsure').length })}
              </p>
            )}
          </div>
        </section>

        <section>
          <QuestionArea
            history={history}
            questionsLeft={questionsLeft}
            selectedGod={selectedGod}
            onSelectGod={setSelectedGod}
            onAsk={handleAsk}
            disabled={false}
          />
        </section>
      </div>

      <ResultModal result={result} onClose={startGame} />
    </div>
  );
}
