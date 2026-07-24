'use client';

import React from 'react';
import { History, Trash2, ExternalLink, Video, Upload, X, Search } from 'lucide-react';

interface LectureSummary {
  id: string;
  title: string;
  source_type: 'upload' | 'youtube';
  source_reference: string;
  status: string;
  created_at: string;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lectures: LectureSummary[];
  onSelectLecture: (id: string) => void;
  onDeleteLecture: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  lectures,
  onSelectLecture,
  onDeleteLecture,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  if (!isOpen) return null;

  const filtered = lectures.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full glass-panel border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
        <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-slate-100">Lecture History</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search past lectures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No past lectures found.
              </div>
            ) : (
              filtered.map((lecture) => (
                <div
                  key={lecture.id}
                  className="glass-card rounded-xl p-4 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1 flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      {lecture.source_type === 'youtube' ? (
                        <Video className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                      <h4 className="text-sm font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                        {lecture.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(lecture.created_at).toLocaleDateString()} • {lecture.status}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onSelectLecture(lecture.id);
                        onClose();
                      }}
                      className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all"
                      title="Open Lecture"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteLecture(lecture.id)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                      title="Delete Lecture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
