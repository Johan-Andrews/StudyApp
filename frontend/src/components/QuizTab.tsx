'use client';

import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Eye, EyeOff, RotateCcw, Clock, Award } from 'lucide-react';

interface QuizItem {
  id: number;
  question: string;
  type: 'mcq' | 'short_answer';
  options: string[];
  correct_answer: string;
  explanation?: string;
  timestamp_reference: number;
}

interface QuizTabProps {
  quiz: QuizItem[];
  onTimestampClick: (seconds: number) => void;
}

export const QuizTab: React.FC<QuizTabProps> = ({ quiz, onTimestampClick }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  const handleSelectOption = (qId: number, option: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach(q => {
      if (userAnswers[q.id] && userAnswers[q.id].trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
        score += 1;
      }
    });
    return score;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz || quiz.length === 0) {
    return (
      <div className="warm-card p-12 text-center">
        <HelpCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border-strong)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No quiz questions generated for this lecture.</p>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const score = calculateScore();

  return (
    <div className="space-y-4">
      {/* Quiz Controls & Score Header */}
      <div className="warm-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(123, 140, 62, 0.12)' }}>
            <Award className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--accent-olive)' }} />
          </div>
          <div>
            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Self-Assessment Quiz</h4>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Answered {answeredCount} of {quiz.length} &bull; Score: <span className="font-bold" style={{ color: 'var(--accent-olive)' }}>{score}</span> / {quiz.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className="btn-warm inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs"
          >
            {showAnswerKey ? <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            <span className="hidden sm:inline">{showAnswerKey ? 'Hide Answers' : 'Show Answers'}</span>
            <span className="sm:hidden">{showAnswerKey ? 'Hide' : 'Show'}</span>
          </button>

          <button
            onClick={handleResetQuiz}
            className="btn-warm inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs"
          >
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Questions */}
      {quiz.map((q, idx) => {
        const selected = userAnswers[q.id];
        const isAnswered = Boolean(selected);
        const isCorrect = isAnswered && selected.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();

        return (
          <div key={q.id || idx} className="warm-card p-4 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                <span className="section-number text-xs shrink-0" style={{ background: 'var(--accent-brown)', minWidth: '28px', width: '28px', height: '28px' }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h4 className="text-xs sm:text-sm font-medium leading-snug pt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {q.question}
                </h4>
              </div>

              <button
                onClick={() => onTimestampClick(q.timestamp_reference)}
                className="timestamp-chip shrink-0"
              >
                <Clock className="w-3 h-3" />
                {formatTime(q.timestamp_reference)}
              </button>
            </div>

            {/* MCQ Options */}
            {q.type === 'mcq' && q.options && (
              <div className="grid grid-cols-1 gap-2 sm:pl-10">
                {q.options.map((opt, oIdx) => {
                  const isThisSelected = selected === opt;
                  const isThisCorrect = opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();

                  let optClass = 'quiz-option';
                  if (isThisSelected) {
                    optClass = isThisCorrect ? 'quiz-option quiz-option-correct' : 'quiz-option quiz-option-wrong';
                  } else if (showAnswerKey && isThisCorrect) {
                    optClass = 'quiz-option quiz-option-correct';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(q.id, opt)}
                      className={`w-full text-left text-xs sm:text-sm flex items-center justify-between ${optClass}`}
                    >
                      <span className="break-words pr-2">{opt}</span>
                      {isThisSelected && (
                        isThisCorrect 
                          ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" style={{ color: 'var(--accent-olive)' }} /> 
                          : <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" style={{ color: 'var(--accent-terracotta)' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short Answer */}
            {q.type === 'short_answer' && (
              <div className="sm:pl-10">
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  value={selected || ''}
                  onChange={(e) => handleSelectOption(q.id, e.target.value)}
                  className="warm-input w-full px-3 sm:px-4 py-2 text-xs sm:text-sm"
                />
              </div>
            )}

            {/* Explanation */}
            {(showAnswerKey || isAnswered) && (
              <div className="sm:ml-10 p-3 rounded-xl text-xs space-y-1" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-warm)' }}>
                <p className="font-semibold" style={{ color: 'var(--accent-olive)' }}>
                  Correct Answer: <span style={{ color: 'var(--text-primary)' }}>{q.correct_answer}</span>
                </p>
                {q.explanation && (
                  <p style={{ color: 'var(--text-muted)' }}>
                    <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Explanation:</span> {q.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
