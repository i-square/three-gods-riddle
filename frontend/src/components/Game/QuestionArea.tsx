import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2, X, ChevronRight, MessageSquare, Sparkles, Brain, AtSign } from 'lucide-react';
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
            t('common.error')
          : t('common.error');
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
    <div className="surface-glass p-5 sm:p-6 h-[600px] flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{t('game.dialogue')}</h3>
            <p className="text-xs text-slate-500">{t('game.communicateSubtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('game.questionsLeft')}</span>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-8 rounded-full transition-all duration-300 ${
                  i < questionsLeft
                    ? 'bg-gradient-to-b from-teal-500 to-amber-500 shadow-[0_0_10px_rgba(13,148,136,0.45)]'
                    : 'bg-slate-300/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1 custom-scrollbar">
        {history.length === 0 && !loading ? (
          <div className="h-full min-h-[170px] flex flex-col items-center justify-center text-slate-500 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-7 h-7 text-teal-600" />
            </div>
            <p className="text-sm">{t('game.noQuestions')}</p>
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={idx} className="space-y-4 animate-fade-in-up">
              {(() => {
                const isMasked = item.is_masked || item.answer === 'Unknown';
                return (
                  <>
                    <div className="flex justify-end">
                      <div className="max-w-[86%]">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-right text-slate-500 mb-1 font-bold">
                          {t('game.toGod', { god: godLabels[item.god_index] })}
                        </p>
                        <div
                          className={`px-5 py-3 rounded-2xl rounded-tr-sm border ${
                            isMasked
                              ? 'bg-slate-100 text-slate-500 border-slate-300'
                              : 'bg-teal-600 text-white border-teal-500'
                          }`}
                        >
                          <p className={`text-sm leading-relaxed ${isMasked ? 'line-through' : ''}`}>{item.question}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-[86%]">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1 font-bold flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {t(`game.god${godLabels[item.god_index]}`)}
                          {isMasked && <span className="text-slate-400">· {t('game.maskedUnknown')}</span>}
                        </p>
                        <div
                          className={`px-5 py-4 rounded-2xl rounded-tl-sm border-l-4 border-l-amber-500 bg-white text-slate-900 ${
                            isMasked ? 'opacity-70' : ''
                          }`}
                        >
                          <p
                            className={`text-xl sm:text-2xl font-bold tracking-[0.12em] ${
                              isMasked ? 'text-slate-500 line-through' : 'text-brand-gradient'
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

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-300 px-5 py-4 rounded-2xl rounded-tl-sm">
              <p className="text-slate-500 mb-2 text-sm">{selectedGod !== null ? t('game.godThinking', { god: godLabels[selectedGod] }) : '...'}</p>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200" />
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        {error && (
          <div className="absolute -top-11 left-0 right-0 bg-rose-100 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-sm flex justify-between items-center animate-scale-in">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="hover:text-rose-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {mentionOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-64 surface-glass rounded-xl overflow-hidden animate-scale-in">
            <div className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200 font-semibold">
              {t('game.selectTarget')}
            </div>
            {godLabels.map((label, idx) => (
              <button
                key={label}
                onClick={() => confirmMention(idx)}
                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors duration-150 ${
                  mentionIndex === idx
                    ? 'bg-teal-100 text-teal-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-black flex items-center justify-center">{label}</span>
                  <span>{t(`game.god${label}`)}</span>
                </div>
                {mentionIndex === idx && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <div
            className={`flex-1 flex items-center rounded-2xl glass-input transition-all duration-300 ${
              selectedGod !== null ? 'ring-2 ring-teal-400/50 border-teal-400/70' : ''
            }`}
          >
            {selectedGod !== null && (
              <div className="ml-2 pl-2 flex items-center gap-1.5">
                <span className="bg-teal-100 text-teal-800 text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <AtSign className="w-3 h-3" />
                  @{godLabels[selectedGod]}
                  <button
                    type="button"
                    onClick={() => onSelectGod(null)}
                    className="hover:bg-slate-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
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
              className="flex-1 bg-transparent border-none px-4 py-3.5 focus:outline-none text-slate-900 placeholder-slate-500 min-w-[100px]"
              autoComplete="off"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={disabled || questionsLeft === 0 || loading || !question.trim() || selectedGod === null}
            className={`px-6 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
              !disabled && questionsLeft > 0 && question.trim() && selectedGod !== null
                ? 'btn-primary'
                : 'btn-soft text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
