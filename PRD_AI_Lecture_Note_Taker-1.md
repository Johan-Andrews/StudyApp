# Product Requirements Document (PRD)
## Clipnote - AI Lecture Note Taker

**Version:** 1.0
**Author:** Roopesh
**Date:** July 24, 2026
**Status:** Draft

---

## 1. Overview

### 1.1 Problem Statement
Students spend significant time and cognitive effort manually transcribing and organizing lecture content — whether from live classes, recorded sessions, or online video lectures (e.g., YouTube). Important concepts get missed, notes are inconsistent, and there is no easy way to self-test on the material afterward.

### 1.2 Product Vision
A web application where a student can submit a lecture in **any common form** — an uploaded audio/video file **or a YouTube link** — and receive, within minutes, clean structured notes, a key-concepts glossary, auto-generated quiz questions, and a condensed study guide, all timestamped and exportable.

### 1.3 Goals
- Eliminate manual note-taking overhead during and after lectures.
- Convert unstructured spoken content into structured, revision-ready material.
- Support both self-recorded lectures and third-party YouTube lecture content.
- Enable self-assessment through auto-generated quizzes.

### 1.4 Non-Goals (v1)
- Real-time/live transcription during an ongoing lecture.
- Support for video platforms other than direct upload and YouTube (e.g., Vimeo, Google Drive links) — reserved for later phases.
- Collaborative/shared note editing between multiple users.
- Mobile native apps (web-responsive only for v1).

---

## 2. Target Users

| Persona | Description | Primary Need |
|---|---|---|
| University Student | Attends recorded/live lectures, wants faster revision | Clean notes + quiz for exam prep |
| Self-learner (MOOC/YouTube) | Watches long-form YouTube lecture/tutorial content | Structured takeaways without rewatching |
| Study Group Organizer | Prepares consolidated material for peers | Shareable study guide/export |

---

## 3. Key Use Cases

1. **UC1 — Upload Recording:** Student uploads an `.mp3`/`.wav`/`.mp4` file of a class recording and receives structured output.
2. **UC2 — Paste YouTube Link:** Student pastes a YouTube URL of a lecture; system fetches/transcribes it without requiring a manual download.
3. **UC3 — Review Notes with Timestamps:** Student clicks a note/quiz item and jumps to the corresponding point in the source audio/video.
4. **UC4 — Take Quiz:** Student attempts auto-generated quiz questions and reviews the answer key.
5. **UC5 — Export:** Student downloads notes/study guide as PDF or Markdown, or exports quiz as Anki flashcards (stretch).
6. **UC6 — Multi-Lecture Study Guide:** Student merges notes from multiple lectures in a course into one consolidated revision document (stretch).

---

## 4. Functional Requirements

### 4.1 Input Handling
- **FR1:** System shall accept direct file uploads in `mp3`, `wav`, `m4a`, `mp4`, `mov` formats, up to a configurable max size (e.g., 2GB).
- **FR2:** System shall accept a YouTube URL as input.
  - **FR2.1:** System shall validate the URL format and confirm the video is publicly accessible (not private/age-restricted/region-locked, where feasible).
  - **FR2.2:** System shall extract audio from the YouTube video server-side (e.g., via `yt-dlp`) without requiring the user to manually download anything.
  - **FR2.3:** System shall respect YouTube's Terms of Service and only process videos the user affirms they have rights/permission to use (checkbox confirmation at submission).
  - **FR2.4:** If available, system shall attempt to use YouTube's existing captions/subtitles as a fallback or cross-check source before falling back to full audio transcription (cost/latency optimization).
- **FR3:** System shall reject unsupported formats/links with a clear error message.

### 4.2 Transcription
- **FR4:** System shall transcribe audio using the Whisper API (or self-hosted Whisper model), producing a timestamped transcript.
- **FR5:** System shall chunk audio exceeding API size/duration limits and reassemble transcripts with continuous, corrected timestamps.
- **FR6:** System shall support language detection and, at minimum, English transcription in v1.

### 4.3 Content Structuring (LLM Processing)
- **FR7:** System shall generate **clean notes** organized by topic/section, removing filler words and false starts.
- **FR8:** System shall generate a **key concepts list** with short definitions.
- **FR9:** System shall generate **5–10 quiz questions** (mix of MCQ and short-answer) with an answer key.
- **FR10:** System shall generate a **one-page study guide** summarizing the lecture's core takeaways.
- **FR11:** Each note/quiz item shall retain a reference timestamp linking back to the source media.

### 4.4 Review & Interaction
- **FR12:** System shall display results in a tabbed interface: Notes / Key Concepts / Quiz / Study Guide.
- **FR13:** Clicking any timestamped item shall seek the embedded audio/video player to that point.
- **FR14:** System shall show job processing status (queued → transcribing → structuring → complete) with progress indication.

### 4.5 Export
- **FR15:** System shall allow export of Notes and Study Guide as PDF and Markdown.
- **FR16:** System shall allow export of Quiz as a standalone document with/without answer key visible.
- **FR17 (Stretch):** System shall support Anki-compatible flashcard export from Key Concepts.

### 4.6 Account & History
- **FR18:** System shall allow users to sign up/log in and view a history/dashboard of past processed lectures.
- **FR19:** System shall allow deletion of a lecture and its associated generated content.

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | A 60-minute lecture should complete end-to-end processing within ~5–8 minutes under normal load. |
| Scalability | Background job architecture must support concurrent processing of multiple lectures without blocking API responsiveness. |
| Reliability | Failed transcription/structuring jobs must be retryable without re-uploading source media. |
| Security | Uploaded files and YouTube-derived audio must be stored securely (encrypted at rest) and access-scoped per user. |
| Cost Control | System should minimize Whisper API cost via chunking efficiency and optional self-hosted Whisper fallback for long content. |
| Compliance | YouTube ingestion must include a user attestation step regarding usage rights; system should honor takedown/removal requests. |
| Usability | Non-technical users should be able to go from link/upload to results with no more than 2–3 clicks. |

---

## 6. System Boundaries & Assumptions

- The system assumes the user has the right to process the audio/video they submit (whether uploaded or via YouTube link).
- YouTube ingestion depends on third-party tooling (e.g., `yt-dlp`) whose reliability is subject to YouTube platform changes; the system should degrade gracefully (clear error) if extraction fails.
- Whisper API costs are a variable, usage-based expense; system should track per-job cost for future billing/plan design.

---

## 7. Success Metrics

- Time from submission to first result (target: < 8 min for 60-min lecture).
- % of YouTube links successfully processed without manual intervention.
- Quiz question quality rating (user feedback thumbs up/down per question).
- Weekly active users returning to review past lecture notes.
- Export usage rate (PDF/Markdown/Anki downloads per processed lecture).

---

## 8. Milestones (Proposed)

| Phase | Scope |
|---|---|
| MVP | File upload + Whisper transcription + single LLM structuring call + web view + PDF export |
| v1.1 | YouTube link ingestion (audio extraction + caption fallback) |
| v1.2 | Timestamp-linked playback, job status dashboard, history |
| v1.3 | Difficulty-tiered quiz, Anki export |
| v2.0 | Multi-lecture study guide merge, speaker diarization, live recording capture |

---

## 9. Open Questions

1. Should there be a per-user monthly processing quota to manage Whisper API costs?
2. How should the system handle YouTube videos with disabled captions and heavy background music/noise?
3. Should quiz answer keys be hidden by default to support self-testing mode?
4. What is the retention policy for uploaded source media (auto-delete after N days)?
