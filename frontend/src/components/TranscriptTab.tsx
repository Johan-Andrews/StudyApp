'use client';

import React, { useState, useMemo } from 'react';
import { AlignLeft, Clock, Search } from 'lucide-react';

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface TranscriptTabProps {
  transcript: {
    raw_text: string;
    segments: TranscriptSegment[];
  };
  onTimestampClick: (seconds: number) => void;
}

export const TranscriptTab: React.FC<TranscriptTabProps> = ({ transcript, onTimestampClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSegments = useMemo(() => {
    if (!transcript.segments?.length) return [];
    if (!searchQuery.trim()) return transcript.segments;
    return transcript.segments.filter(seg =>
      seg.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transcript.segments, searchQuery]);

  if (!transcript.segments?.length && !transcript.raw_text) {
    return (
      <div className="warm-card p-12 text-center">
        <AlignLeft className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border-strong)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No transcript available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="warm-panel p-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="warm-input w-full pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Segments */}
      {transcript.segments?.length > 0 ? (
        <div className="warm-card divide-y" style={{ borderColor: 'var(--border-warm)' }}>
          {filteredSegments.map((seg, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--bg-card-alt)]"
              style={{ borderColor: 'var(--border-warm)' }}
            >
              <button
                onClick={() => onTimestampClick(seg.start)}
                className="timestamp-chip mt-0.5 shrink-0"
              >
                <Clock className="w-3 h-3" />
                {formatTime(seg.start)}
              </button>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {seg.text}
              </p>
            </div>
          ))}
          {filteredSegments.length === 0 && (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No segments match your search.
            </div>
          )}
        </div>
      ) : (
        <div className="warm-card p-6">
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {transcript.raw_text}
          </p>
        </div>
      )}
    </div>
  );
};
