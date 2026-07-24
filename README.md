# Clipnote - AI Lecture Note Taker 🎓⚡

**Clipnote** is a modern full-stack web application that ingests lecture content — via direct audio/video uploads or YouTube links — and automatically generates structured revision materials: sectioned notes with interactive timestamp playback, key concepts glossary, self-assessment quizzes, and executive single-page study guides.

---

## ✨ Features

- **Multi-Source Lecture Ingestion**: Direct file upload (`.mp3`, `.wav`, `.m4a`, `.mp4`, `.mov`) or YouTube link extraction server-side via `yt-dlp`.
- **Automated Caption & Speech Recognition**: Automatic WebVTT subtitle parsing + Google Gemini API (`gemini-2.5-flash`) multimodal audio transcription.
- **Interactive Synchronized Media Sync**: Click any timestamp chip `[02:15]` across Notes, Key Concepts, or Quiz questions to jump video/audio playback directly to that segment.
- **Interactive Self-Assessment Quiz**: Multi-choice & short answer quiz engine with score tracking, instant answer verification, and toggleable answer keys.
- **Multi-Format Study Material Exports**: Export formatted notes and study guides as **PDF**, **Markdown** (`.md`), or **Anki Flashcards** (`.txt` TSV).
- **Lecture History & Dashboard**: Persistent job history with re-opening, filtering, and deletion options.

---

## 🏗️ System Architecture

```
[ Next.js 16 Web Dashboard ]  <--->  [ FastAPI Python Backend (Port 8000) ]
        (Port 3001)                                 |
                                    +---------------+---------------+
                                    |               |               |
                              [ yt-dlp /      [ Google Gemini    [ SQLite /
                               ffmpeg ]          API ]          Postgres ]
                                    |               |               |
                                    +---------------+---------------+
                                                    |
                                          [ ReportLab PDF Exporter ]
```

---

## 📁 Repository Structure

```
Clipnote/
├── backend/
│   ├── config.py              # Configuration & env management
│   ├── database.py            # SQLite / SQLAlchemy models
│   ├── main.py                # FastAPI REST API routes & background worker
│   ├── requirements.txt       # Python dependencies
│   ├── utils.py               # JSON cleaning & formatting helpers
│   ├── services/
│   │   ├── extractor.py       # yt-dlp & VTT caption parser
│   │   ├── transcriber.py     # Gemini & Whisper ASR service
│   │   ├── structurer.py      # LLM structuring engine
│   │   └── exporter.py        # PDF, Markdown & Anki exporter
│   ├── uploads/               # Temporary media storage (.gitkeep preserved)
│   └── exports/               # Generated downloadable PDFs (.gitkeep preserved)
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router pages & layout
│   │   └── components/        # React components (Player, Tabs, Modals)
│   └── package.json           # Frontend dependencies
├── .gitignore                 # Root gitignore rules
├── README.md                  # Project documentation
├── PRD_AI_Lecture_Note_Taker-1.md # Product Requirements Document
└── SRS_AI_Lecture_Note_Taker.md   # Software Requirements Specification
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python**: `3.11+`
- **Node.js**: `v18+` / `v20+` / `v22+` & `npm`

### 2. Backend Setup & Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create your `.env` file from the provided template:
   ```bash
   cp .env.example .env
   ```
4. Add your Google Gemini API Key in `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

5. Launch the FastAPI server:
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

### 3. Frontend Setup & Launch
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Configure `NEXT_PUBLIC_API_URL` in `frontend/.env.local` if your backend API runs on a custom host/domain (defaults to `http://localhost:8000`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Build and launch the production server:
   ```bash
   npm run build
   npx next start -p 3001
   ```
5. Open `http://localhost:3001` in your browser.

---

## 📄 License & Attribution

Built for IBM AI Lecture Note Taker initiative adhering to IEEE 830 SRS specifications.
