'use client';

import React, { useState } from 'react';
import { Download, FileText, FileCode, Layers, X, Check } from 'lucide-react';

interface ExportModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ jobId, isOpen, onClose }) => {
  const [withAnswers, setWithAnswers] = useState(true);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = (format: 'pdf' | 'md' | 'anki') => {
    setDownloadingFormat(format);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const exportUrl = `${apiBaseUrl}/api/lectures/${jobId}/export?format=${format}&with_answers=${withAnswers}`;
    
    // Trigger download
    const link = document.createElement('a');
    link.href = exportUrl;
    link.download = `clipnote_export.${format === 'anki' ? 'txt' : format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingFormat(null);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700/80 p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            Export Study Material
          </h3>
          <p className="text-xs text-slate-400">
            Choose your preferred document or flashcard export format.
          </p>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <span className="text-slate-300 font-medium">Include Quiz Answer Keys</span>
          <button
            onClick={() => setWithAnswers(!withAnswers)}
            className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
              withAnswers ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                withAnswers ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Export Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleExport('pdf')}
            disabled={downloadingFormat === 'pdf'}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 text-slate-100 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">PDF Document</p>
                <p className="text-xs text-slate-400">Formatted summary, notes & concept tables</p>
              </div>
            </div>
            {downloadingFormat === 'pdf' ? <Check className="w-4 h-4 text-cyan-400 animate-bounce" /> : <Download className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />}
          </button>

          <button
            onClick={() => handleExport('md')}
            disabled={downloadingFormat === 'md'}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-slate-100 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Markdown Document (.md)</p>
                <p className="text-xs text-slate-400">Clean text format for Obsidian / Notion</p>
              </div>
            </div>
            {downloadingFormat === 'md' ? <Check className="w-4 h-4 text-indigo-400 animate-bounce" /> : <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />}
          </button>

          <button
            onClick={() => handleExport('anki')}
            disabled={downloadingFormat === 'anki'}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 hover:border-purple-500/50 text-slate-100 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Anki Flashcards Package (.txt)</p>
                <p className="text-xs text-slate-400">Importable flashcard deck for spatial repetition</p>
              </div>
            </div>
            {downloadingFormat === 'anki' ? <Check className="w-4 h-4 text-purple-400 animate-bounce" /> : <Download className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
