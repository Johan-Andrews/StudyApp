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
    <div className="fixed inset-0 z-50 flex justify-end modal-backdrop">
      <div className="w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl border-l"
        style={{ background: 'var(--bg-warm)', borderColor: 'var(--border-warm)' }}>
        <div className="space-y-5 flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-warm)' }}>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" style={{ color: 'var(--accent-olive)' }} />
              <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>Lecture History</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-card-alt)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search past lectures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="warm-input w-full pl-9 pr-4 py-2.5 text-xs"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
                No past lectures found.
              </div>
            ) : (
              filtered.map((lecture) => (
                <div
                  key={lecture.id}
                  className="warm-card p-4 flex items-center justify-between group"
                >
                  <div className="space-y-1 flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      {lecture.source_type === 'youtube' ? (
                        <Video className="w-3.5 h-3.5 shrink-0" style={{ color: '#DC2626' }} />
                      ) : (
                        <Upload className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-olive)' }} />
                      )}
                      <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {lecture.title}
                      </h4>
                    </div>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      {new Date(lecture.created_at).toLocaleDateString()} &bull; {lecture.status}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onSelectLecture(lecture.id);
                        onClose();
                      }}
                      className="p-2 rounded-lg transition-all"
                      style={{ background: 'rgba(123, 140, 62, 0.1)', color: 'var(--accent-olive)', border: '1px solid rgba(123, 140, 62, 0.2)' }}
                      title="Open Lecture"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteLecture(lecture.id)}
                      className="p-2 rounded-lg transition-all"
                      style={{ background: 'rgba(193, 127, 89, 0.1)', color: 'var(--accent-terracotta)', border: '1px solid rgba(193, 127, 89, 0.2)' }}
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
