import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clipnote - AI Lecture Note Taker & Quiz Generator',
  description: 'Transform lecture audio, video files, or YouTube links into structured notes, key concepts, interactive quizzes, and executive study guides.',
  keywords: ['AI lecture notes', 'YouTube transcript summary', 'lecture quiz generator', 'anki flashcards', 'study guide'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#0B0F17] text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
