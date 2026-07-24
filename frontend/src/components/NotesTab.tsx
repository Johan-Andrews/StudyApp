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
      <div className="p-8 text-center glass-card rounded-2xl">
        <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">No notes generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notes.map((item, idx) => (
        <div 
          key={idx} 
          className="glass-card rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-800">
            <h4 className="text-lg font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400" />
              {item.section_title}
            </h4>
            <button
              onClick={() => onTimestampClick(item.timestamp_reference)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-mono font-medium border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
              title="Click to jump player to this timestamp"
            >
              <Clock className="w-3.5 h-3.5" />
              {formatTime(item.timestamp_reference)}
            </button>
          </div>

          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-2">
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
