'use client';

import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

export interface MediaSyncPlayerRef {
  seekTo: (seconds: number) => void;
}

interface MediaSyncPlayerProps {
  mediaUrl: string;
  sourceType: 'upload' | 'youtube';
  title?: string;
}

export const MediaSyncPlayer = forwardRef<MediaSyncPlayerRef, MediaSyncPlayerProps>(
  ({ mediaUrl, sourceType, title }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [currentTime, setCurrentTime] = useState(0);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (sourceType === 'youtube') {
          // If YouTube embed, update iframe src with start time
          if (iframeRef.current) {
            let ytId = extractYoutubeId(mediaUrl);
            if (ytId) {
              iframeRef.current.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&start=${Math.floor(seconds)}`;
            }
          }
        } else if (videoRef.current) {
          videoRef.current.currentTime = seconds;
          videoRef.current.play().catch(() => {});
        }
      }
    }));

    const extractYoutubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url ? url.match(regExp) : null;
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const isYoutube = sourceType === 'youtube' || mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be');
    const youtubeId = isYoutube ? extractYoutubeId(mediaUrl) : null;
    const fullMediaUrl = mediaUrl.startsWith('http') ? mediaUrl : `${apiBaseUrl}${mediaUrl}`;

    return (
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-200 truncate max-w-md">
              {title || 'Lecture Source Player'}
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-cyan-400 font-mono border border-cyan-500/20">
            {isYoutube ? 'YouTube Source' : 'Uploaded Media'}
          </span>
        </div>

        <div className="relative aspect-video bg-black flex items-center justify-center">
          {isYoutube && youtubeId ? (
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1`}
              title="YouTube Video Player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={fullMediaUrl}
              controls
              className="w-full h-full object-contain"
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            />
          )}
        </div>
      </div>
    );
  }
);

MediaSyncPlayer.displayName = 'MediaSyncPlayer';
