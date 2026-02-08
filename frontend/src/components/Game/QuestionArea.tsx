import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2, X, ChevronRight, MessageSquare, Sparkles } from 'lucide-react';
import type { MoveHistory } from '../../types';

interface QuestionAreaProps {
  history: MoveHistory[];
  questionsLeft: number;
  selectedGod: number | null;
  onSelectGod: (index: number | null) => void;
  onAsk: (question: string, godIndex?: number) => Promise<void>;
  disabled: boolean;
}

export function QuestionArea({
  history,
  questionsLeft,
  selectedGod,
  onSelectGod,
  onAsk,
  disabled,
}: QuestionAreaProps) {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const godLabels = ['A', 'B', 'C'];

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [history, loading]);

  useEffect(() => {
    if (mentionOpen) setMentionIndex(0);
  }, [mentionOpen]);

  const handleSubmit = async () => {
    if (mentionOpen) {
      confirmMention(mentionIndex);
      return;
    }

    let finalQuestion = question.trim();
    let targetGod = selectedGod;

    const match = finalQuestion.match(/^@([abcABC])(?:\s+|$)(.*)/);
    if (match) {
      const godChar = match[1].toUpperCase();
      const index = godChar.charCodeAt(0) - 'A'.charCodeAt(0);
      if (index >= 0 && index <= 2) {
        targetGod = index;
        finalQuestion = match[2].trim();
        onSelectGod(targetGod);
      }
    }

    if (!finalQuestion || targetGod === null || disabled || loading) return;

    setLoading(true);
    setError(null);
    try {
      await onAsk(finalQuestion, targetGod);
      setQuestion('');
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ===
          'string'
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
            'Something went wrong'
          : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuestion(val);
    if (error) setError(null);

    if (val.slice(-1) === '@') {
      setMentionOpen(true);
      return;
    }

    if (mentionOpen && !val.includes('@')) {
      setMentionOpen(false);
    }

    const match = val.match(/@([abcABC])$/);
    if (match) {
      const godChar = match[1].toUpperCase();
      const index = godChar.charCodeAt(0) - 'A'.charCodeAt(0);
      if (index >= 0 && index <= 2) {
        onSelectGod(index);
        setQuestion(val.replace(/@([abcABC])$/, ''));
        setMentionOpen(false);
      }
    }
  };

  const confirmMention = (idx: number) => {
    onSelectGod(idx);
    setQuestion((prev) => prev.replace(/@$/, ''));
    setMentionOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionOpen) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((prev) => (prev > 0 ? prev - 1 : 2));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((prev) => (prev < 2 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        confirmMention(mentionIndex);
      } else if (e.key === 'Escape') {
        setMentionOpen(false);
      }
      return;
    }

    if (e.key === 'Backspace' && question === '' && selectedGod !== null) {
      onSelectGod(null);
    } else if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 animate-fade-in-up delay-200 flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-100">{t('game.dialogue')}</h3>
            <p className="text-xs text-gray-500">{t('game.communicateSubtitle')}</p>
          </div>
        </div>
        
        {/* Questions Left Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('game.questionsLeft')}</span>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`
                  w-2 h-8 rounded-full transition-all duration-500
                  ${i < questionsLeft 
                    ? 'bg-gradient-to-b from-indigo-400 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                    : 'bg-gray-800/50'
                  }
                `}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chat history */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 custom-scrollbar"
      >
        {history.length === 0 && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
            <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-8 h-8 text-indigo-500/50" />
            </div>
            <p className="text-sm font-medium">{t('game.noQuestions')}</p>
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={idx} className="space-y-4 animate-fade-in-up">
              {(() => {
                const isMasked = item.is_masked || item.answer === 'Unknown';
                return (
                  <>
              {/* User question */}
              <div className="flex justify-end">
                <div className="max-w-[85%]">
                  <div className="flex items-center justify-end gap-2 mb-1 opacity-70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                      {t('game.toGod', { god: godLabels[item.god_index] })}
                    </span>
                  </div>
                  <div
                    className={`px-5 py-3 rounded-2xl rounded-tr-sm shadow-lg ${
                      isMasked
                        ? 'bg-gray-700/60 text-gray-300 border border-gray-500/30'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    <p className={`text-sm leading-relaxed ${isMasked ? 'line-through opacity-80' : ''}`}>
                      {item.question}
                    </p>
                  </div>
                </div>
              </div>

              {/* God answer */}
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="flex items-center gap-2 mb-1 opacity-70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                      {t(`game.god${godLabels[item.god_index]}`)}
                    </span>
                    {isMasked && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        {t('game.maskedUnknown')}
                      </span>
                    )}
                  </div>
                  <div
                    className={`glass-card px-6 py-4 rounded-2xl rounded-tl-sm border-l-4 ${
                      isMasked ? 'border-gray-500/60' : 'border-purple-500'
                    }`}
                  >
                    <p
                      className={`text-2xl font-bold tracking-widest font-serif ${
                        isMasked
                          ? 'text-gray-400 line-through opacity-80'
                          : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400'
                      }`}
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
                  </>
                );
              })()}
            </div>
          ))
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-gray-800/50 px-5 py-4 rounded-2xl rounded-tl-sm border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {selectedGod !== null ? t('game.godThinking', { god: godLabels[selectedGod] }) : '...'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="relative z-20">
        {/* Error message */}
        {error && (
          <div className="absolute bottom-full left-0 mb-4 w-full bg-rose-500/10 border border-rose-500/20 backdrop-blur-md text-rose-200 px-4 py-3 rounded-xl shadow-lg text-sm flex justify-between items-center animate-scale-in">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mention dropdown */}
        {mentionOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-64 glass-panel rounded-xl overflow-hidden animate-scale-in">
            <div className="px-4 py-2 bg-gray-900/50 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-white/5">
              {t('game.selectTarget')}
            </div>
            {godLabels.map((label, idx) => (
              <button
                key={label}
                onClick={() => confirmMention(idx)}
                className={`
                  w-full text-left px-4 py-3 text-sm flex items-center justify-between
                  transition-all duration-150
                  ${mentionIndex === idx
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                    {label}
                  </div>
                  <span>{t(`game.god${label}`)}</span>
                </div>
                {mentionIndex === idx && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <div className={`
            flex-1 flex items-center rounded-2xl transition-all duration-300
            glass-input
            ${selectedGod !== null ? 'ring-2 ring-indigo-500/30 border-indigo-500/50' : ''}
          `}>
            {selectedGod !== null && (
              <div className="ml-2 pl-2 flex items-center gap-1.5">
                <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-500/20 animate-scale-in">
                  <span>@{godLabels[selectedGod]}</span>
                  <button
                    onClick={() => onSelectGod(null)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={selectedGod !== null ? t('game.enterQuestion') : t('game.mentionHint')}
              disabled={disabled || questionsLeft === 0}
              className="flex-1 bg-transparent border-none px-4 py-4 focus:ring-0 text-white placeholder-gray-500 min-w-[100px]"
              autoComplete="off"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={disabled || questionsLeft === 0 || loading || !question.trim() || selectedGod === null}
            className={`
              px-6 rounded-2xl font-bold transition-all duration-300
              flex items-center gap-2
              ${!disabled && questionsLeft > 0 && question.trim() && selectedGod !== null
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-white/5'
              }
            `}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
