'use client';

import React from 'react';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';

interface NoteItem {
  section_title: string;
  content: string;
  timestamp_reference: number;
}

interface NotesTabProps {
  notes: NoteItem[];
  onTimestampClick: (seconds: number) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({ notes, onTimestampClick }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!notes || notes.length === 0) {
    return (
      <div className="warm-card p-12 text-center">
        <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border-strong)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notes generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((item, idx) => (          <div key={idx} className="warm-card p-4 sm:p-6 group">
          {/* Section Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-warm)' }}>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="section-number shrink-0">{String(idx + 1).padStart(2, '0')}</span>
              <h4 className="text-sm sm:text-base font-semibold break-words" style={{ color: 'var(--text-primary)' }}>
                {item.section_title}
              </h4>
            </div>
            <button
              onClick={() => onTimestampClick(item.timestamp_reference)}
              className="timestamp-chip shrink-0 ml-auto"
              title="Click to jump player to this timestamp"
            >
              <Clock className="w-3 h-3" />
              {formatTime(item.timestamp_reference)}
            </button>
          </div>

          {/* Content */}
          <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-2 sm:pl-11" style={{ color: 'var(--text-secondary)' }}>
            {item.content.split('\n').map((line, lIdx) => (
              <p key={lIdx} className="leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
