'use client';

import React, { useState } from 'react';
import { AlignLeft, Clock, Search } from 'lucide-react';

interface Segment {
  start_time: number;
  end_time: number;
  text: string;
}

interface TranscriptTabProps {
  transcript: {
    raw_text: string;
    segments: Segment[];
  };
  onTimestampClick: (seconds: number) => void;
}

export const TranscriptTab: React.FC<TranscriptTabProps> = ({ transcript, onTimestampClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const segments = transcript?.segments || [];
  const filtered = segments.filter(s =>
    s.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!segments || segments.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl">
        <AlignLeft className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">
          {transcript?.raw_text ? transcript.raw_text : "No transcript segments available."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-slate-800">
        <Search className="w-4 h-4 text-cyan-400 shrink-0" />
        <input
          type="text"
          placeholder="Search within transcript..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
        />
        {searchTerm && (
          <span className="text-[10px] text-slate-400 font-mono shrink-0">
            {filtered.length} matches
          </span>
        )}
      </div>

      {/* Segments List */}
      <div className="glass-card rounded-2xl p-6 space-y-3 max-h-[550px] overflow-y-auto border border-slate-800">
        {filtered.map((seg, idx) => (
          <div
            key={idx}
            onClick={() => onTimestampClick(seg.start_time)}
            className="p-3 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-cyan-500/20 transition-all cursor-pointer group flex items-start gap-3"
          >
            <button
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 text-xs font-mono border border-cyan-500/20 transition-all shrink-0 mt-0.5"
            >
              <Clock className="w-3 h-3" />
              {formatTime(seg.start_time)}
            </button>
            <p className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors leading-relaxed">
              {seg.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
