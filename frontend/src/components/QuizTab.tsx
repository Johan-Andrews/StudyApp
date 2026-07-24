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
      <div className="p-8 text-center glass-card rounded-2xl">
        <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">No quiz questions generated for this lecture.</p>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const score = calculateScore();

  return (
    <div className="space-y-6">
      {/* Quiz Controls & Score Header */}
      <div className="glass-card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-100">Self-Assessment Quiz</h4>
            <p className="text-xs text-slate-400">
              Answered {answeredCount} of {quiz.length} questions • Current Score: <span className="font-bold text-cyan-400">{score}</span> / {quiz.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
          >
            {showAnswerKey ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4 text-cyan-400" />}
            {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
          </button>

          <button
            onClick={handleResetQuiz}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Quiz
          </button>
        </div>
      </div>

      {/* Questions List */}
      {quiz.map((q, idx) => {
        const selected = userAnswers[q.id];
        const isAnswered = Boolean(selected);
        const isCorrect = isAnswered && selected.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();

        return (
          <div key={q.id || idx} className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                  Question {idx + 1}
                </span>
                <h4 className="text-base font-medium text-slate-100 leading-snug">
                  {q.question}
                </h4>
              </div>

              <button
                onClick={() => onTimestampClick(q.timestamp_reference)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-500/20 text-cyan-400 text-xs font-mono border border-slate-700 transition-all shrink-0"
              >
                <Clock className="w-3 h-3" />
                {formatTime(q.timestamp_reference)}
              </button>
            </div>

            {/* MCQ Options */}
            {q.type === 'mcq' && q.options && (
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {q.options.map((opt, oIdx) => {
                  const isThisSelected = selected === opt;
                  const isThisCorrect = opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();

                  let btnStyle = "border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300";
                  if (isThisSelected) {
                    if (isThisCorrect) {
                      btnStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-medium";
                    } else {
                      btnStyle = "border-rose-500/50 bg-rose-500/10 text-rose-300";
                    }
                  } else if (showAnswerKey && isThisCorrect) {
                    btnStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-medium";
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(q.id, opt)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isThisSelected && (
                        isThisCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short Answer Input */}
            {q.type === 'short_answer' && (
              <div className="space-y-2 pt-2">
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  value={selected || ''}
                  onChange={(e) => handleSelectOption(q.id, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            )}

            {/* Explanation & Answer Key Reveal */}
            {(showAnswerKey || isAnswered) && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-cyan-400">
                  Correct Answer: <span className="text-slate-100">{q.correct_answer}</span>
                </p>
                {q.explanation && (
                  <p className="text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-medium">Explanation:</span> {q.explanation}
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
