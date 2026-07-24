'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Video, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Download, 
  History, 
  BookOpen, 
  Lightbulb, 
  HelpCircle, 
  FileText, 
  AlignLeft,
  PlayCircle, 
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';

import { MediaSyncPlayer, MediaSyncPlayerRef } from '@/components/MediaSyncPlayer';
import { NotesTab } from '@/components/NotesTab';
import { KeyConceptsTab } from '@/components/KeyConceptsTab';
import { QuizTab } from '@/components/QuizTab';
import { StudyGuideTab } from '@/components/StudyGuideTab';
import { TranscriptTab } from '@/components/TranscriptTab';
import { ExportModal } from '@/components/ExportModal';
import { HistoryDrawer } from '@/components/HistoryDrawer';

interface LectureResults {
  job_id: string;
  title: string;
  source_type: 'upload' | 'youtube';
  source_reference: string;
  media_url: string;
  status: string;
  results?: {
    transcript: { raw_text: string; segments: any[] };
    notes: any[];
    key_concepts: any[];
    quiz: any[];
    study_guide: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  // Submission Form State
  const [submissionType, setSubmissionType] = useState<'upload' | 'youtube'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [rightsConfirmed, setRightsConfirmed] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  
  // App Execution State
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [lectureData, setLectureData] = useState<LectureResults | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'concepts' | 'quiz' | 'guide' | 'transcript'>('notes');

  // Modals & Drawers
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyLectures, setHistoryLectures] = useState<any[]>([]);

  const playerRef = useRef<MediaSyncPlayerRef | null>(null);

  // Poll job status when processing
  useEffect(() => {
    if (!activeJobId || jobStatus === 'complete' || jobStatus?.startsWith('failed')) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/lectures/${activeJobId}/status`);
        if (res.ok) {
          const data = await res.json();
          setJobStatus(data.status);
          setStatusMessage(data.message || '');

          if (data.status === 'complete') {
            fetchResults(activeJobId);
          }
        }
      } catch (err) {
        console.error("Status polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJobId, jobStatus]);

  // Fetch results when complete
  const fetchResults = async (jobId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/lectures/${jobId}/results`);
      if (res.ok) {
        const data = await res.json();
        setLectureData(data);
        setJobStatus('complete');
      }
    } catch (err) {
      console.error("Fetch results error:", err);
    }
  };

  // Fetch past lectures for history drawer
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/lectures`);
      if (res.ok) {
        const data = await res.json();
        setHistoryLectures(data);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    }
  };

  const handleOpenHistory = () => {
    fetchHistory();
    setIsHistoryOpen(true);
  };

  const handleDeleteLecture = async (jobId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/lectures/${jobId}`, { method: 'DELETE' });
      fetchHistory();
      if (activeJobId === jobId) {
        setActiveJobId(null);
        setLectureData(null);
        setJobStatus(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submissionType === 'youtube') {
      if (!youtubeUrl.trim()) return;
      if (!rightsConfirmed) {
        alert("Please confirm that you have rights to process this YouTube lecture.");
        return;
      }

      try {
        setJobStatus('queued');
        setStatusMessage('Submitting YouTube link...');
        const res = await fetch(`${API_BASE_URL}/api/lectures/youtube`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            youtube_url: youtubeUrl,
            rights_confirmed: true
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setActiveJobId(data.job_id);
          setJobStatus('queued');
        } else {
          const err = await res.json();
          alert(err.detail || 'Submission failed');
          setJobStatus(null);
        }
      } catch (err) {
        console.error(err);
        setJobStatus(null);
      }
    } else {
      if (!file) return;

      try {
        setJobStatus('queued');
        setStatusMessage('Uploading audio/video file...');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('rights_confirmed', 'true');

        const res = await fetch(`${API_BASE_URL}/api/lectures/upload`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setActiveJobId(data.job_id);
          setJobStatus('queued');
        } else {
          alert('Upload failed');
          setJobStatus(null);
        }
      } catch (err) {
        console.error(err);
        setJobStatus(null);
      }
    }
  };

  const handleTimestampClick = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds);
    }
  };

  // Stage indicator calculation
  const getStageNumber = (status: string | null) => {
    if (status === 'queued') return 1;
    if (status === 'extracting') return 2;
    if (status === 'transcribing') return 3;
    if (status === 'structuring') return 4;
    if (status === 'complete') return 5;
    return 0;
  };

  const currentStage = getStageNumber(jobStatus);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100">
      {/* Navbar Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight gradient-text">
              Clipnote
            </h1>
            <p className="text-[10px] font-medium text-slate-400 font-mono">
              AI LECTURE NOTE TAKER
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lectureData && (
            <button
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-all"
            >
              <Download className="w-4 h-4" />
              Export Material
            </button>
          )}

          <button
            onClick={handleOpenHistory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
          >
            <History className="w-4 h-4 text-cyan-400" />
            Lecture History
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Ingestion & Submission Form */}
        {!lectureData && (
          <section className="max-w-2xl mx-auto glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-100">
                Transform Lectures into Revision-Ready Study Decks
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
                Paste a YouTube URL or upload an audio/video recording to get instant structured notes, key concepts, quizzes, and single-page study guides.
              </p>
            </div>

            {/* Selector Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setSubmissionType('youtube')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  submissionType === 'youtube'
                    ? 'bg-slate-800 text-cyan-400 shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-4 h-4 text-red-500" />
                YouTube Link
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  submissionType === 'upload'
                    ? 'bg-slate-800 text-cyan-400 shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                File Upload
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {submissionType === 'youtube' ? (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-300">
                    YouTube Video URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  />

                  {/* FR-1.4: Rights Attestation Checkbox */}
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rightsConfirmed}
                      onChange={(e) => setRightsConfirmed(e.target.checked)}
                      className="mt-0.5 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-400 leading-normal">
                      <span className="text-slate-300 font-medium">Attestation:</span> I confirm I have the right or authorization to ingest and process this YouTube lecture content for educational synthesis.
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-300">
                    Lecture File (.mp3, .wav, .m4a, .mp4, .mov)
                  </label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-900/50">
                    <input
                      type="file"
                      accept="audio/*,video/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                      <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-200">
                        {file ? file.name : 'Click to select or drag and drop lecture media'}
                      </p>
                      <p className="text-[10px] text-slate-500">Up to 2GB supported</p>
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={Boolean(jobStatus && jobStatus !== 'complete' && !jobStatus.startsWith('failed'))}
                className="w-full py-3.5 rounded-xl gradient-btn text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Sparkles className="w-4 h-4" />
                Process Lecture & Generate Decks
              </button>
            </form>
          </section>
        )}

        {/* Pipeline Progress Indicator */}
        {jobStatus && jobStatus !== 'complete' && (
          <section className="max-w-2xl mx-auto glass-panel rounded-2xl p-6 border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-sm font-bold text-slate-200">
                  Processing Pipeline: <span className="text-cyan-400 capitalize">{jobStatus}</span>
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Stage {currentStage} of 4</span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-500"
                style={{ width: `${(currentStage / 4) * 100}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 text-center font-mono">
              {statusMessage || "Ingesting media and running AI transcription pipeline..."}
            </p>
          </section>
        )}

        {/* Structured Results Display */}
        {lectureData && (
          <div className="space-y-6">
            {/* Header Title Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 font-mono">
                  Processed Lecture
                </span>
                <h2 className="text-xl font-extrabold text-slate-100">
                  {lectureData.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setLectureData(null);
                    setJobStatus(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
                >
                  <Plus className="w-4 h-4 text-cyan-400" />
                  New Submission
                </button>
              </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Media Sync Player Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="sticky top-24">
                  <MediaSyncPlayer
                    ref={playerRef}
                    mediaUrl={lectureData.media_url || lectureData.source_reference}
                    sourceType={lectureData.source_type}
                    title={lectureData.title}
                  />

                  <div className="mt-4 glass-card rounded-2xl p-4 space-y-2 text-xs">
                    <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      Interactive Media Sync
                    </p>
                    <p className="text-slate-400 leading-normal">
                      Click any timestamp chip <span className="text-cyan-400 font-mono">[02:15]</span> across Notes, Concepts, or Quiz to jump playback directly to that segment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabbed Results Viewer Column */}
              <div className="lg:col-span-7 space-y-4">
                {/* Navigation Tabs */}
                <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'notes'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Notes ({lectureData.results?.notes?.length || 0})
                  </button>

                  <button
                    onClick={() => setActiveTab('concepts')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'concepts'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    Key Concepts ({lectureData.results?.key_concepts?.length || 0})
                  </button>

                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'quiz'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Quiz ({lectureData.results?.quiz?.length || 0})
                  </button>

                  <button
                    onClick={() => setActiveTab('guide')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'guide'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Study Guide
                  </button>

                  <button
                    onClick={() => setActiveTab('transcript')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'transcript'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <AlignLeft className="w-4 h-4" />
                    Transcript
                  </button>
                </div>

                {/* Tab Contents */}
                <div>
                  {activeTab === 'notes' && (
                    <NotesTab
                      notes={lectureData.results?.notes || []}
                      onTimestampClick={handleTimestampClick}
                    />
                  )}

                  {activeTab === 'concepts' && (
                    <KeyConceptsTab
                      concepts={lectureData.results?.key_concepts || []}
                      onTimestampClick={handleTimestampClick}
                    />
                  )}

                  {activeTab === 'quiz' && (
                    <QuizTab
                      quiz={lectureData.results?.quiz || []}
                      onTimestampClick={handleTimestampClick}
                    />
                  )}

                  {activeTab === 'guide' && (
                    <StudyGuideTab
                      studyGuide={lectureData.results?.study_guide || ''}
                    />
                  )}

                  {activeTab === 'transcript' && (
                    <TranscriptTab
                      transcript={lectureData.results?.transcript || { raw_text: '', segments: [] }}
                      onTimestampClick={handleTimestampClick}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      {activeJobId && (
        <ExportModal
          jobId={activeJobId}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        lectures={historyLectures}
        onSelectLecture={(id) => {
          setActiveJobId(id);
          fetchResults(id);
        }}
        onDeleteLecture={handleDeleteLecture}
      />
    </div>
  );
}
