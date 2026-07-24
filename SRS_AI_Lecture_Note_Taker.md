# Software Requirements Specification (SRS)
## Clipnote - AI Lecture Note Taker 

**Version:** 1.0
**Author:** Roopesh
**Date:** July 24, 2026
**Standard Reference:** IEEE 830 (adapted)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional software requirements for the **AI Lecture Note Taker**, a system that ingests lecture content — via direct file upload or a YouTube video link — and produces structured notes, key concepts, quiz questions, and a study guide.

### 1.2 Scope
The system, referred to as **LectureNotesAI**, will:
- Accept audio/video file uploads and YouTube URLs as lecture input.
- Transcribe spoken content using the Whisper API.
- Use an LLM to structure the transcript into notes, key concepts, quiz questions, and a study guide.
- Present results in a web dashboard with timestamp-linked playback.
- Allow export of generated content (PDF/Markdown, optionally Anki).

The system does **not** cover live/real-time lecture transcription, non-YouTube video-link ingestion, or collaborative multi-user editing in v1.

### 1.3 Definitions, Acronyms, Abbreviations

| Term | Definition |
|---|---|
| ASR | Automatic Speech Recognition |
| LLM | Large Language Model |
| SRS | Software Requirements Specification |
| PRD | Product Requirements Document |
| Job | A unit of processing work (one lecture submission) tracked through its lifecycle |
| Diarization | Distinguishing between different speakers in an audio track |

### 1.4 References
- OpenAI Whisper API documentation
- `yt-dlp` project documentation (YouTube extraction)
- FastAPI official documentation
- YouTube Terms of Service (usage rights considerations)

### 1.5 Overview
Section 2 describes the overall system context. Section 3 details specific functional requirements. Section 4 covers external interfaces. Section 5 covers non-functional requirements. Section 6 covers data requirements. Section 7 covers system architecture at a specification level.

---

## 2. Overall Description

### 2.1 Product Perspective
LectureNotesAI is a standalone web application composed of:
- A **FastAPI backend** exposing REST endpoints for submission, job status, and results retrieval.
- A **background worker layer** (Celery + Redis, or FastAPI `BackgroundTasks` for MVP) handling long-running transcription/structuring jobs.
- An **external ASR provider** (Whisper API / self-hosted Whisper).
- An **external LLM provider** (Claude/GPT API) for content structuring.
- A **YouTube extraction module** (`yt-dlp` or equivalent) for link-based ingestion.
- A **frontend web dashboard** (Next.js) for submission and review.
- **Object storage** (S3-compatible) for media files and generated documents.
- A **relational database** (PostgreSQL) for user, job, and content metadata.

### 2.2 Product Functions (Summary)
1. Accept lecture input (file upload or YouTube URL).
2. Extract/normalize audio.
3. Transcribe audio to timestamped text.
4. Structure transcript into notes, concepts, quiz, study guide via LLM.
5. Display results with playback-linked navigation.
6. Export results in multiple formats.
7. Maintain job and lecture history per user.

### 2.3 User Classes and Characteristics

| User Class | Characteristics |
|---|---|
| Registered Student User | Primary user; submits lectures, reviews/exports content, manages history |
| Anonymous/Guest User (optional) | Limited trial usage without persistent history (configurable) |
| System Administrator | Monitors job queue health, API cost, and content moderation flags |

### 2.4 Operating Environment
- Backend: Python 3.11+, FastAPI, deployed on Linux-based cloud infrastructure.
- Frontend: Next.js, modern evergreen browsers (Chrome, Firefox, Edge, Safari).
- Storage: S3-compatible object store; PostgreSQL 14+.
- External dependency availability: OpenAI Whisper API, LLM API, YouTube (via `yt-dlp`).

### 2.5 Design and Implementation Constraints
- Must operate within Whisper API's per-request audio size/duration limits (chunking required).
- YouTube ingestion is dependent on third-party extraction tooling and may break if YouTube changes its platform; system must isolate this dependency behind a service layer for easy replacement/patching.
- Must include a legal/usage-rights attestation step for YouTube-sourced content.
- Processing is asynchronous; the system must not block HTTP request threads on long-running transcription/structuring tasks.

### 2.6 Assumptions and Dependencies
- Users have legal rights or permission to process the audio/video they submit.
- Whisper API and chosen LLM API remain available and within acceptable latency/cost bounds.
- YouTube videos submitted are public or unlisted (not private/restricted) for extraction to succeed.

---

## 3. Specific Functional Requirements

### 3.1 Input Submission Module

**FR-1.1** The system shall provide an endpoint `POST /api/lectures/upload` accepting a multipart file upload (`mp3`, `wav`, `m4a`, `mp4`, `mov`).

**FR-1.2** The system shall provide an endpoint `POST /api/lectures/youtube` accepting a JSON payload with a `youtube_url` field.

**FR-1.3** The system shall validate the YouTube URL format using a regex/pattern match before attempting extraction.

**FR-1.4** The system shall require a boolean `rights_confirmed` flag to be `true` in the YouTube submission payload before processing begins; requests without it shall be rejected with HTTP 400.

**FR-1.5** Upon successful submission (file or link), the system shall create a `Job` record with status `queued` and return a `job_id` to the client.

**FR-1.6** The system shall reject files exceeding the configured maximum size (default 2GB) with HTTP 413.

**FR-1.7** The system shall reject YouTube URLs pointing to private, age-restricted, or region-locked videos with a descriptive error message, where such status is detectable prior to extraction.

### 3.2 Audio Extraction & Normalization Module

**FR-2.1** For video file uploads, the system shall extract the audio track using `ffmpeg` and convert it to a normalized format (e.g., 16kHz mono WAV) suitable for ASR.

**FR-2.2** For YouTube submissions, the system shall use `yt-dlp` (or equivalent) to download the best-available audio stream server-side.

**FR-2.3** The system shall attempt to retrieve existing YouTube captions/subtitles (auto-generated or manual) via `yt-dlp` as a first-pass transcript source when available.

**FR-2.4** If captions are unavailable or of low confidence/quality, the system shall fall back to full Whisper-based transcription of the extracted audio.

**FR-2.5** The system shall update the `Job` status to `extracting` during this phase and to `transcribing` once extraction completes.

### 3.3 Transcription Module

**FR-3.1** The system shall split audio exceeding Whisper API limits (25MB / duration threshold) into sequential chunks with slight overlap to preserve context continuity.

**FR-3.2** The system shall send each chunk to the Whisper API and receive a timestamped transcript segment.

**FR-3.3** The system shall reassemble chunk-level transcripts into a single continuous transcript, correcting timestamp offsets according to chunk position.

**FR-3.4** The system shall store the raw transcript (with timestamps) in the database/object storage, associated with the `Job`.

**FR-3.5** The system shall update `Job` status to `structuring` upon successful transcription.

### 3.4 Content Structuring Module (LLM Layer)

**FR-4.1** The system shall send the full transcript (or chunked, with a merge strategy for very long lectures) to an LLM with a structured prompt requesting JSON output containing: `notes`, `key_concepts`, `quiz`, `study_guide`.

**FR-4.2** Each `notes` entry shall include a `section_title`, `content`, and `timestamp_reference`.

**FR-4.3** Each `key_concepts` entry shall include a `term`, `definition`, and `timestamp_reference`.

**FR-4.4** Each `quiz` entry shall include a `question`, `type` (`mcq` | `short_answer`), `options` (if MCQ), `correct_answer`, and `timestamp_reference`.

**FR-4.5** The `study_guide` shall be a condensed single-document summary (target: fits one page when exported to PDF).

**FR-4.6** The system shall validate the LLM's JSON response against a schema; on malformed output, the system shall retry the LLM call up to a configured limit (default 2 retries) before marking the `Job` as `failed_structuring`.

**FR-4.7** The system shall update `Job` status to `complete` upon successful structuring and storage of results.

### 3.5 Results & Playback Module

**FR-5.1** The system shall provide `GET /api/lectures/{job_id}/results` returning the structured content (notes, key concepts, quiz, study guide) plus a signed media URL for playback.

**FR-5.2** The frontend shall render results in four tabs: Notes, Key Concepts, Quiz, Study Guide.

**FR-5.3** Each timestamped item, when clicked, shall seek the embedded audio/video player element to the corresponding time offset.

**FR-5.4** The system shall provide `GET /api/lectures/{job_id}/status` for polling job progress, returning one of: `queued`, `extracting`, `transcribing`, `structuring`, `complete`, `failed_extraction`, `failed_transcription`, `failed_structuring`.

### 3.6 Export Module

**FR-6.1** The system shall provide `GET /api/lectures/{job_id}/export?format=pdf|md` for Notes and Study Guide.

**FR-6.2** The system shall provide `GET /api/lectures/{job_id}/export/quiz?with_answers=true|false`.

**FR-6.3 (Stretch)** The system shall provide `GET /api/lectures/{job_id}/export/anki` producing an Anki-compatible flashcard package from Key Concepts.

### 3.7 Account & History Module

**FR-7.1** The system shall support user registration/login (email+password or OAuth).

**FR-7.2** The system shall associate every `Job` with an authenticated user account.

**FR-7.3** The system shall provide `GET /api/lectures` listing a user's past lectures with status and creation date.

**FR-7.4** The system shall provide `DELETE /api/lectures/{job_id}` removing the job's media, transcript, and generated content.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- Upload/submission page with two input modes: file drop-zone and YouTube URL text field (mutually exclusive per submission).
- Job progress view with stage indicator (queued → extracting → transcribing → structuring → complete).
- Tabbed results viewer with embedded media player synced to timestamps.
- Dashboard/history page listing prior lectures with quick actions (view, export, delete).

### 4.2 Software Interfaces

| Interface | Purpose |
|---|---|
| Whisper API | Speech-to-text transcription |
| LLM API (Gemini API) | Transcript structuring into notes/quiz/study guide |
| `yt-dlp` (or equivalent library) | YouTube audio/caption extraction |
| `ffmpeg` | Audio extraction/normalization from video files |
| S3-compatible Storage API | Storing raw media and generated exports |
| PostgreSQL | Persisting users, jobs, transcripts, structured content metadata |
| Redis + Celery (or FastAPI BackgroundTasks) | Asynchronous job queue/execution |

### 4.3 Communication Interfaces
- REST/JSON over HTTPS between frontend and backend.
- Signed/expiring URLs for direct client access to stored media and export files.

---

## 5. Non-Functional Requirements

### 5.1 Performance
- End-to-end processing of a 60-minute lecture shall complete within 5–8 minutes under normal load conditions.
- Status polling endpoint shall respond within 200ms under normal load.

### 5.2 Scalability
- The background job system shall support horizontal scaling of worker processes to handle concurrent lecture submissions.

### 5.3 Reliability & Availability
- Failed jobs (extraction, transcription, or structuring) shall be retryable without requiring the user to resubmit source media.
- Target system availability: 99% monthly uptime (excluding scheduled maintenance).

### 5.4 Security
- Uploaded media and generated content shall be stored encrypted at rest.
- Access to a `Job`'s media/results shall be scoped strictly to the owning user account.
- Signed URLs for media/export access shall expire within a configurable window (default 15 minutes).

### 5.5 Legal/Compliance
- YouTube-sourced submissions require explicit user attestation of usage rights (FR-1.4).
- The system shall support content takedown: an admin-triggered removal of a `Job` and its derived content upon valid request.

### 5.6 Maintainability
- The YouTube extraction module shall be isolated behind an internal service interface (`IVideoExtractor`) so that the underlying extraction library can be swapped or patched without affecting upstream modules, given its exposure to third-party platform changes.

### 5.7 Usability
- A user shall be able to go from lecture submission to viewing initial results in no more than 3 UI interactions (submit → wait → view).

### 5.8 Cost Observability
- Each `Job` shall record estimated Whisper API and LLM API cost incurred, for internal usage analytics.

---

## 6. Data Requirements

### 6.1 Core Entities

**User**
- `id`, `email`, `password_hash` (or OAuth identity), `created_at`

**Job**
- `id`, `user_id`, `source_type` (`upload` | `youtube`), `source_reference` (file path or YouTube URL), `status`, `rights_confirmed` (bool, for YouTube), `created_at`, `updated_at`, `cost_estimate`

**Transcript**
- `job_id`, `raw_text`, `segments` (list of `{start_time, end_time, text}`)

**StructuredContent**
- `job_id`, `notes` (JSON), `key_concepts` (JSON), `quiz` (JSON), `study_guide` (text)

**ExportArtifact**
- `job_id`, `format` (`pdf` | `md` | `anki`), `storage_path`, `created_at`

### 6.2 Data Retention
- Raw media files shall be retained per a configurable policy (default: 30 days post-processing) after which they may be auto-deleted while structured content/transcripts are retained longer, unless the user deletes the job earlier.

---

## 7. System Architecture (Specification-Level View)

```
[Frontend: Next.js]
        |
        v
[FastAPI Backend] --(enqueue)--> [Job Queue: Redis/Celery]
        |                                |
        |                                v
   [PostgreSQL]                 [Worker Pool]
        ^                                |
        |                    +-----------+-----------+
        |                    |           |           |
        |              [yt-dlp /      [Whisper     [LLM API:
        |               ffmpeg]        API]         GEMINI]
        |                    |           |           |
        +--------------------+-----------+-----------+
                             |
                             v
                     [S3-Compatible Storage]
                  (media files, transcripts, exports)
```

**Flow:**
1. User submits via frontend → FastAPI creates `Job`, enqueues task.
2. Worker extracts audio (via `ffmpeg` for uploads, `yt-dlp` for YouTube) and/or fetches captions.
3. Worker sends audio to Whisper API if needed; stores transcript.
4. Worker sends transcript to LLM API for structuring; stores structured content.
5. Frontend polls job status; on `complete`, fetches and renders results.
6. User optionally triggers export, generating and storing an `ExportArtifact`.

---

## 8. Traceability Notes
Each functional requirement (FR-x.x) in this SRS maps to a corresponding feature described in the companion PRD (`PRD_AI_Lecture_Note_Taker.md`), Sections 4.1–4.6. Non-functional requirements in Section 5 of this SRS correspond to PRD Section 5 (Non-Functional Requirements) and Section 7 (Success Metrics).

---

## 9. Appendix: Open Items for Future Revisions
- Speaker diarization support for Q&A-heavy lectures.
- Multi-lecture merged study guide generation.
- Live/real-time recording capture and transcription.
- Support for additional video sources beyond YouTube (e.g., institutional LMS video links).
