# PROJECT CONCEPT NOTE

## Clipnote: AI-Powered Lecture Note-Taking & Study Material Generator

> 🌐 **LIVE SECURE APPLICATION URL (HTTPS):** [https://palace-subjective-except-stats.trycloudflare.com/](https://palace-subjective-except-stats.trycloudflare.com/) *(Direct AWS EC2 IP: http://3.27.186.233)*

---

### Executive Summary

| Attribute | Details |
|---|---|
| **Application Name** | Clipnote |
| **Live AWS Application URL** | `http://3.27.186.233` |
| **Primary LLM Engine** | Google Gemini 2.5 Flash API (`gemini-2.5-flash`) |
| **Secondary Fallback LLM** | OpenAI API (`gpt-4o-mini`) |
| **Cloud Infrastructure** | AWS EC2 (Ubuntu 24.04 LTS / t3.micro) |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **Backend Framework** | FastAPI (Python 3.12), Uvicorn, SQLite, SQLAlchemy |
| **Web Server & Reverse Proxy** | Nginx (Port 80 -> 3000 / 8000), Systemd, PM2 |
| **Target Audience** | University & High School Students, Self-Taught Learners, Educators |

---

### 1. Problem Statement & Objective

Modern students and self-learners consume hours of dense audio/video lectures, webinars, and recorded academic sessions daily. Manual note-taking during long lectures is inefficient, prone to missing key details, and creates a heavy cognitive load. Existing tools either offer simple verbatim transcripts without structural hierarchy or lack multi-format exports.

**Core Objective:** Clipnote solves this by providing an automated end-to-end pipeline that transforms raw audio/video uploads or YouTube links into structured, high-retention study packages—complete with sectioned notes, key term definitions, self-assessment quizzes, and executive study guides in seconds.

---

### 2. Target User & Primary Use Cases

* **University & High School Students:** Converting recorded university lectures into organized revision notes and flashcards before exams.
* **Online Learners & Self-Taught Developers:** Summarizing long YouTube tutorials, coding bootcamps, and technical webinars.
* **Researchers & Educators:** Extracting core concepts and generating quick assessment quizzes from academic audio recordings.

---

### 3. LLM Models & API Architecture

Clipnote leverages **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) via the `google-genai` SDK as its primary LLM engine. Gemini 2.5 Flash was chosen for its ultra-fast inference speed, 1M token context window, and exceptional structured JSON generation capabilities. The system features a multi-tiered API architecture:

* **Primary Processing Engine:** Google Gemini 2.5 Flash API for multi-segment transcription synthesis and structured JSON parsing.
* **Secondary Fallback Engine:** OpenAI API (`gpt-4o-mini`) automatically engages if Gemini API limits are reached.
* **Transcription Pipeline:** Multi-tiered pipeline utilizing native YouTube captions (`youtube-transcript-api`), Gemini Audio API, and OpenAI Whisper.

---

### 4. Key Application Features

| Feature Module | Technical & Functional Description |
|---|---|
| **Multi-Source Ingestion** | Supports direct local media uploads (`.mp3`, `.mp4`, `.wav`, `.m4a`) and YouTube lecture URLs. |
| **Interactive Media Player** | Synchronized audio/video player with click-to-seek timestamp navigation across transcript segments. |
| **Structured Note Generation** | Generates hierarchical lecture notes categorized into overview, core concepts, and key takeaways. |
| **Interactive Quiz Engine** | Generates 5-question multiple choice quizzes with instant feedback, scoring, and explanation hints. |
| **Executive Study Guide** | Produces a high-yield revision checklist and key terms glossary for rapid pre-exam review. |
| **Multi-Format Exporting** | One-click exports to publication-ready PDF reports, raw Markdown (`.md`), and Anki Flashcard decks (`.txt`). |

---

### 5. Expected User Experience & Outcomes

* **Time Reduction:** Reduces post-lecture review time by up to 80% by automating initial note drafting and concept organization.
* **Active Recall Learning:** Enhances long-term knowledge retention through immediate interactive quiz testing and flashcard export.
* **Seamless UI/UX:** Provides a modern dark-mode responsive web app with zero-latency tab switching and real-time task status polling.
* **Production-Ready Cloud Hosting:** Publicly hosted live on AWS EC2 (`http://3.27.186.233`) behind an Nginx reverse proxy managed by systemd and PM2.

---
*Clipnote AI Study Application — Project Concept Note — Live at http://3.27.186.233*
