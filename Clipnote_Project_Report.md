# PROJECT DEVELOPMENT & TECHNICAL REPORT

## Clipnote: AI-Powered Lecture Note-Taking & Study Material Generator

> 🌐 **LIVE SECURE APPLICATION URL (HTTPS):** [https://palace-subjective-except-stats.trycloudflare.com/](https://palace-subjective-except-stats.trycloudflare.com/) *(Direct AWS EC2 IP: http://3.27.186.233)*

---

### Executive Overview & Metadata

| Field | Details |
|---|---|
| **Application Name** | Clipnote |
| **Live AWS Application URL** | `http://3.27.186.233` |
| **Primary LLM Model** | Google Gemini 2.5 Flash API (`gemini-2.5-flash`) |
| **Secondary LLM Model** | OpenAI GPT-4o-mini (`gpt-4o-mini`) |
| **Cloud Hosting Platform** | AWS EC2 (Ubuntu 24.04 LTS / t3.micro) |
| **Frontend Stack** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **Backend Stack** | FastAPI (Python 3.12), Uvicorn, SQLite, SQLAlchemy ORM |
| **Web Server & Proxy** | Nginx Reverse Proxy (Port 80 -> 3000 / 8000), Systemd, PM2 |
| **Media Processing** | `youtube-transcript-api`, `pytubefix`, `yt-dlp`, `ffmpeg`, `reportlab` |

---

## 1. Application Overview & Tech Stack

**Clipnote** is a full-stack, AI-powered lecture processing application designed to transform dense, unstructured educational content (audio/video files or YouTube links) into structured, high-retention study packages.

### System Stack Breakdown

1. **Frontend Layer (Next.js 16)**:
   - Built with React 19, TypeScript, and Tailwind CSS v4.
   - Features a dark-mode tabbed dashboard (Notes, Key Concepts, Interactive Quiz, Executive Study Guide, Transcripts, and Export Options).
   - Includes an interactive media player with click-to-seek timestamp navigation across extracted lecture segments.
   - Real-time job status polling ensures responsive updates without blocking the browser.

2. **Backend API Layer (FastAPI)**:
   - Asynchronous Python 3.12 backend powered by Uvicorn.
   - Non-blocking background task worker orchestrating the multi-stage pipeline: **Extraction → Transcription → Structuring → Storage**.
   - SQLite 3 relational database managed via SQLAlchemy ORM for job tracking and result persistence.

3. **AI & LLM Orchestration Layer**:
   - Primary LLM: **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) via `google-genai` SDK, offering 1M token context length and fast JSON synthesis.
   - Secondary Fallback: **OpenAI GPT-4o-mini** for fallback resilience against API quota limits.

4. **Cloud & Web Server Infrastructure**:
   - AWS EC2 instance running Ubuntu 24.04 LTS (`t3.micro`).
   - Nginx reverse proxy routing port 80 traffic to Next.js (port 3000) and FastAPI (port 8000).
   - Process management: Systemd daemon for FastAPI backend, PM2 process manager for Next.js frontend.

---

## 2. Prompting Strategy & Frameworks Used

Clipnote employs a **Chain-of-Thought (CoT) & JSON Schema Enforcement** prompting strategy. By enforcing strict Pydantic JSON schemas on LLM outputs, the application guarantees deterministic, machine-readable JSON structure for rendering components and generating PDF/Anki exports.

### Prompt Engineering Principles

1. **Role & Persona Assignment**: System prompts establish the LLM as an expert academic tutor and curriculum strategist.
2. **Schema Constraints**: Uses Pydantic models to enforce strict nested JSON formatting (Overview, Key Concepts, Sections with timestamps, Multiple-Choice Quiz with answers & explanations, Study Checklist).
3. **Decomposed Multi-Stage Pipeline**: Processing is split into distinct stages to maximize output accuracy and prevent token truncation.

### Sample System Prompt (`backend/services/structurer.py`)

```text
SYSTEM PROMPT:
You are an elite academic tutor and curriculum architect.
Analyze the provided lecture transcript segments and generate a comprehensive study package strictly formatted as JSON.

OUTPUT JSON SCHEMA REQUIREMENT:
{
  "title": "string",
  "overview": "string",
  "key_concepts": [
    { "term": "string", "definition": "string" }
  ],
  "sections": [
    { "title": "string", "summary": "string", "start_time": 0.0, "end_time": 0.0 }
  ],
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_option": 0,
      "explanation": "string"
    }
  ],
  "study_guide": {
    "summary_checklist": ["string"],
    "key_takeaways": ["string"]
  }
}
```

---

## 3. Phase-by-Phase Development Summary

| Phase | Milestone / Focus | Key Activities & Accomplishments |
|---|---|---|
| **Phase 1** | Requirement Analysis & PRD | Defined functional requirements, core user flows, system boundaries, and multi-format export capabilities. |
| **Phase 2** | Backend Architecture | Created FastAPI server, SQLite database schema, background worker task pipeline, and LLM structuring service. |
| **Phase 3** | Frontend Development | Built Next.js 16 dark-mode UI, tabbed results dashboard, interactive timestamp media player, and real-time status polling. |
| **Phase 4** | AWS EC2 Deployment | Configured Ubuntu 24.04 EC2 instance, Nginx reverse proxy, Systemd daemon for FastAPI, and PM2 for Next.js. |
| **Phase 5** | Reliability Engineering | Configured 1.5GB SWAP space to resolve t3.micro RAM constraints; integrated `youtube-transcript-api` + oEmbed fallback for 100% YouTube uptime. |

---

## 4. Application Architecture

```
USER BROWSER (http://3.27.186.233)
       │
       ▼
NGINX REVERSE PROXY (Port 80)
       ├──► / (Frontend) ──────► NEXT.JS APP (PM2 / Port 3000)
       └──► /api/ (Backend) ───► FASTAPI APP (Systemd / Port 8000)
                                        │
                                        ├──► SQLite Database (Jobs, Transcripts, Study Kits)
                                        ├──► Google Gemini 2.5 Flash API (LLM Structuring)
                                        └──► youtube-transcript-api / FFmpeg (Extraction)
```

---

## 5. Challenges Encountered & Resolutions

| Challenge / Issue | Root Cause Analysis | Resolution Strategy Implemented |
|---|---|---|
| **EC2 Out-Of-Memory (OOM) Crashes** | AWS free tier `t3.micro` instances have 1GB RAM, causing Node.js builds and FFmpeg processes to crash. | Created a 1.5GB SWAP file on EBS storage and restricted Node.js build memory using `NODE_OPTIONS=--max_old_space_size=512`. |
| **YouTube Anti-Bot IP Blocking** | YouTube aggressively blocks cloud data center IP ranges (AWS) downloading raw media streams via yt-dlp. | Integrated `youtube-transcript-api` + YouTube oEmbed API for instant caption extraction without downloading raw media streams. |
| **Next.js Standalone Build Mismatch** | Next.js standalone output mode conflicted with Amplify and Nginx reverse proxy setups. | Reverted to standard SSR build mode and managed frontend execution using PM2 process manager. |
| **Security Group / SSH Timeout** | Inbound AWS Security Group rules blocked SSH (port 22) and HTTP (port 80). | Updated Security Group inbound rules to allow SSH (port 22), HTTP (port 80), and API (port 8000) from `0.0.0.0/0`. |

---

## 6. Key Learnings & Reflection

1. **Resource-Constrained Cloud Engineering**: Building on free-tier cloud infrastructure (`t3.micro`) requires proactive memory management, SWAP file configuration, and lightweight process daemons.
2. **Resilient Multi-Tier API Fallbacks**: External third-party integrations (YouTube, LLM APIs) must always feature fallback layers (`youtube-transcript-api` → `pytubefix` → `yt-dlp` → oEmbed fallback) to ensure 100% uptime for end users.
3. **Structured Output Validation**: Enforcing rigid Pydantic schemas with modern LLMs eliminates JSON parsing failures and delivers seamless frontend rendering and export generation.

---
*Clipnote AI Study Application — Full Project Development Report — Live AWS URL: http://3.27.186.233*
