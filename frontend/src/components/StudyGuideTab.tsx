'use client';

import React from 'react';
import { FileText, BookMarked } from 'lucide-react';

interface StudyGuideTabProps {
  studyGuide: string;
}

export const StudyGuideTab: React.FC<StudyGuideTabProps> = ({ studyGuide }) => {
  if (!studyGuide) {
    return (
      <div className="warm-card p-12 text-center">
        <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border-strong)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No study guide available.</p>
      </div>
    );
  }

  return (
    <div className="warm-card p-5 sm:p-8 space-y-5">
      <div className="flex items-center gap-2.5 pb-4" style={{ borderBottom: '1px solid var(--border-warm)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(123, 140, 62, 0.12)' }}>
          <BookMarked className="w-4 h-4" style={{ color: 'var(--accent-olive)' }} />
        </div>
        <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>
          Executive Revision Study Guide
        </h3>
      </div>

      <div className="text-sm leading-relaxed whitespace-pre-line space-y-3" style={{ color: 'var(--text-secondary)' }}>
        {studyGuide}
      </div>
    </div>
  );
};
