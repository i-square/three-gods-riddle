import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2, X, ChevronUp } from 'lucide-react';
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

  // Reset mention index when opening
  useEffect(() => {
    if (mentionOpen) setMentionIndex(0);
  }, [mentionOpen]);

  const handleSubmit = async () => {
    // If menu is open, do not submit, let Enter handle selection
    if (mentionOpen) {
      confirmMention(mentionIndex);
      return;
    }

    let finalQuestion = question.trim();
    let targetGod = selectedGod;

    // Legacy support: Check for @Tag at submission time if user typed it fast
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
    try {
      await onAsk(finalQuestion, targetGod);
      setQuestion('');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuestion(val);

    // Detect @ trigger
    const lastChar = val.slice(-1);
    if (lastChar === '@') {
      setMentionOpen(true);
      return;
    }

    // Close menu if user deletes @
    if (mentionOpen && !val.includes('@')) {
      setMentionOpen(false);
    }

    // Auto-tokenization for @A / @B / @C
    const match = val.match(/@([abcABC])$/);
    if (match) {
      const godChar = match[1].toUpperCase();
      const index = godChar.charCodeAt(0) - 'A'.charCodeAt(0);
      if (index >= 0 && index <= 2) {
        onSelectGod(index);
        // Remove the tag from input
        setQuestion(val.replace(/@([abcABC])$/, ''));
        setMentionOpen(false);
      }
    }
  };

  const confirmMention = (idx: number) => {
    onSelectGod(idx);
    // Remove the @ from the end if it exists
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
        {history.length === 0 && !loading ? (
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
        {loading && (
           <div className="flex justify-start animate-pulse">
                <div className="bg-indigo-900 px-3 py-2 rounded-xl rounded-bl-none border border-indigo-700 flex items-center gap-2">
                  <span className="font-semibold text-indigo-300">
                    {selectedGod !== null ? t(`game.god${godLabels[selectedGod]}`) : '...'}
                  </span>
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
                </div>
           </div>
        )}
      </div>

      <div className="flex gap-2 relative">
        {/* Autocomplete Dropdown */}
        {mentionOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden z-10">
            <div className="px-3 py-2 bg-gray-900 text-xs text-gray-400 font-bold border-b border-gray-700">
              Select God
            </div>
            {godLabels.map((label, idx) => (
              <button
                key={label}
                onClick={() => confirmMention(idx)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                  mentionIndex === idx
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{t(`game.god${label}`)} ({label})</span>
                {mentionIndex === idx && <ChevronUp className="w-3 h-3 transform rotate-90" />}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 flex items-center bg-gray-700 border border-gray-600 rounded focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          {selectedGod !== null && (
            <div className="ml-2 flex items-center gap-1 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-fade-in whitespace-nowrap">
              <span>@{godLabels[selectedGod]}</span>
              <button 
                onClick={() => onSelectGod(null)}
                className="hover:bg-indigo-700 rounded-full p-0.5"
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
            className="flex-1 bg-transparent border-none p-2 focus:ring-0 text-white placeholder-gray-400 min-w-[100px]"
            autoComplete="off"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={
            disabled ||
            questionsLeft === 0 ||
            loading ||
            !question.trim() ||
            (selectedGod === null)
          }
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition flex items-center"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
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
