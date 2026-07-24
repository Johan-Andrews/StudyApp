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
      <div className="warm-card p-12 text-center">
        <Lightbulb className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border-strong)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No key concepts found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {concepts.map((concept, idx) => (
        <div key={idx} className="warm-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201, 169, 110, 0.15)' }}>
                  <Lightbulb className="w-4 h-4" style={{ color: 'var(--accent-brown-light)' }} />
                </div>
                <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {concept.term}
                </h4>
              </div>
              <button
                onClick={() => onTimestampClick(concept.timestamp_reference)}
                className="timestamp-chip shrink-0"
              >
                <Clock className="w-3 h-3" />
                {formatTime(concept.timestamp_reference)}
              </button>
            </div>
            <p className="text-sm leading-relaxed pl-10" style={{ color: 'var(--text-secondary)' }}>
              {concept.definition}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
