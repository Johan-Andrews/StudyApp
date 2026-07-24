'use client';

import React from 'react';
import { FileText } from 'lucide-react';

interface StudyGuideTabProps {
  studyGuide: string;
}

export const StudyGuideTab: React.FC<StudyGuideTabProps> = ({ studyGuide }) => {
  if (!studyGuide) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl">
        <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">No study guide available.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-8 space-y-4 border border-cyan-500/20">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800 text-cyan-400">
        <FileText className="w-5 h-5" />
        <h3 className="text-lg font-bold text-slate-100">Executive Revision Study Guide</h3>
      </div>

      <div className="prose prose-invert prose-cyan max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-4">
        {studyGuide}
      </div>
    </div>
  );
};
