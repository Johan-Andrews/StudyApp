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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
