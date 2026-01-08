import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2, X, ChevronRight, MessageCircle } from 'lucide-react';
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
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Something went wrong';
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
    <div className="glass rounded-2xl p-6 border border-white/5 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-gray-200">{t('game.dialogue')}</h3>
        </div>
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
          ${questionsLeft > 0
            ? 'bg-indigo-500/20 text-indigo-300'
            : 'bg-red-500/20 text-red-300'
          }
        `}>
          <span className="text-gray-400">{t('game.questionsLeft')}:</span>
          <span className="font-bold text-lg">{questionsLeft}</span>
        </div>
      </div>

      {/* Chat history */}
      <div
        ref={chatRef}
        className="bg-gray-900/50 rounded-xl p-4 h-52 overflow-y-auto mb-4 space-y-4"
      >
        {history.length === 0 && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm italic">{t('game.noQuestions')}</p>
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={idx} className="space-y-2 animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
              {/* User question */}
              <div className="flex justify-end">
                <div className="bg-gray-700/80 px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[85%] animate-slide-in-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-indigo-400">
                      → {t(`game.god${godLabels[item.god_index]}`)}
                    </span>
                  </div>
                  <p className="text-gray-200">{item.question}</p>
                </div>
              </div>
              {/* God answer */}
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-[85%] border border-indigo-500/20 animate-slide-in-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-indigo-300">
                      {t(`game.god${godLabels[item.god_index]}`)}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-yellow-300 tracking-wide">{item.answer}</p>
                </div>
              </div>
            </div>
          ))
        )}
        {/* Loading state */}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 px-4 py-3 rounded-2xl rounded-bl-sm border border-indigo-500/20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-indigo-300">
                  {selectedGod !== null ? t(`game.god${godLabels[selectedGod]}`) : '...'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full typing-dot" />
                <span className="w-2 h-2 bg-yellow-400 rounded-full typing-dot" />
                <span className="w-2 h-2 bg-yellow-400 rounded-full typing-dot" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex gap-3 relative">
        {/* Error message */}
        {error && (
          <div className="absolute bottom-full left-0 mb-2 w-full bg-red-900/90 border border-red-500/50 text-red-200 px-4 py-2.5 rounded-xl shadow-lg text-sm flex justify-between items-center z-20 animate-fade-in">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mention dropdown */}
        {mentionOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-52 glass rounded-xl shadow-2xl overflow-hidden z-10 animate-scale-in border border-white/10">
            <div className="px-3 py-2 bg-gray-900/80 text-xs text-gray-400 font-semibold border-b border-white/5">
              Select God
            </div>
            {godLabels.map((label, idx) => (
              <button
                key={label}
                onClick={() => confirmMention(idx)}
                className={`
                  w-full text-left px-4 py-2.5 text-sm flex items-center justify-between
                  transition-all duration-150
                  ${mentionIndex === idx
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700/50'
                  }
                `}
              >
                <span>{t(`game.god${label}`)} ({label})</span>
                {mentionIndex === idx && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}

        {/* Input field */}
        <div className={`
          flex-1 flex items-center rounded-xl border transition-all duration-300
          ${selectedGod !== null
            ? 'bg-gray-800/80 border-indigo-500/50 ring-2 ring-indigo-500/20'
            : 'bg-gray-800/50 border-gray-600/50 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20'
          }
        `}>
          {selectedGod !== null && (
            <div className="ml-3 flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg animate-scale-in">
              <span>@{godLabels[selectedGod]}</span>
              <button
                onClick={() => onSelectGod(null)}
                className="hover:bg-white/20 rounded p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={selectedGod !== null ? t('game.enterQuestion') : "Type '@' to select God..."}
            disabled={disabled || questionsLeft === 0}
            className="flex-1 bg-transparent border-none px-3 py-3 focus:ring-0 text-white placeholder-gray-500 min-w-[100px]"
            autoComplete="off"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={disabled || questionsLeft === 0 || loading || !question.trim() || selectedGod === null}
          className={`
            px-5 rounded-xl font-semibold transition-all duration-300
            flex items-center gap-2
            ${!disabled && questionsLeft > 0 && question.trim() && selectedGod !== null
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50'
              : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">{t('game.ask')}</span>
        </button>
      </div>

      {/* Target indicator */}
      <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
        {t('game.targeting')}:
        <span className={`font-semibold ${selectedGod !== null ? 'text-indigo-400' : 'text-gray-600'}`}>
          {selectedGod !== null ? t(`game.god${godLabels[selectedGod]}`) : t('game.none')}
        </span>
      </p>
    </div>
  );
}
