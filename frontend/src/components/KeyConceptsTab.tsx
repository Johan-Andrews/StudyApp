'use client';

import React from 'react';
import { Lightbulb, Clock } from 'lucide-react';

interface ConceptItem {
  term: string;
  definition: string;
  timestamp_reference: number;
}

interface KeyConceptsTabProps {
  concepts: ConceptItem[];
  onTimestampClick: (seconds: number) => void;
}

export const KeyConceptsTab: React.FC<KeyConceptsTabProps> = ({ concepts, onTimestampClick }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!concepts || concepts.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl">
        <Lightbulb className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">No key concepts found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {concepts.map((concept, idx) => (
        <div 
          key={idx} 
          className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="text-base font-bold text-indigo-300 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                {concept.term}
              </h4>
              <button
                onClick={() => onTimestampClick(concept.timestamp_reference)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-mono border border-indigo-500/20 transition-all shrink-0"
              >
                <Clock className="w-3 h-3" />
                {formatTime(concept.timestamp_reference)}
              </button>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {concept.definition}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
