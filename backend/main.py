import os
import uuid
import asyncio
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks, Depends, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session

from config import settings
from database import init_db, get_db, JobModel, TranscriptModel, StructuredContentModel
from services.extractor import IVideoExtractor, is_valid_youtube_url
from services.transcriber import ITranscriptionService
from services.structurer import IStructuringService
from services.exporter import IExporterService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("clipnote.api")

# Initialize database tables
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FastAPI Backend for Clipnote AI Lecture Note Taker"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload static files for direct media streaming
app.mount("/media_files", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="media_files")

# --- Schemas ---

class YouTubeSubmissionRequest(BaseModel):
    youtube_url: str
    rights_confirmed: bool
    api_key: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    cloudinary_cloud_name: Optional[str] = None

# --- Pipeline Async Background Processing ---

def process_lecture_job(job_id: str, api_key: Optional[str] = None):
    """Background worker task processing lecture through pipeline stages."""
    db = next(get_db())
    try:
        job = db.query(JobModel).filter(JobModel.id == job_id).first()
        if not job:
            logger.error(f"Job {job_id} not found in DB.")
            return

        # Stage 1: Extraction
        job.status = "extracting"
        job.status_message = "Downloading audio stream & parsing captions..."
        db.commit()

        if job.source_type == "youtube":
            extraction = IVideoExtractor.process_youtube(job.source_reference, settings.UPLOAD_DIR)
        else:
            upload_path = Path(job.source_reference)
            extraction = IVideoExtractor.process_upload_file(upload_path, settings.UPLOAD_DIR)

        job.title = extraction.get("title", job.title)
        audio_path = extraction.get("audio_path")
        
        # Set relative media URL for playback
        if audio_path:
            rel_media = Path(audio_path).relative_to(settings.UPLOAD_DIR)
            job.media_url = f"/api/lectures/{job.id}/media_file/{rel_media.name}"
        else:
            job.media_url = job.source_reference if job.source_type == "youtube" else ""

        db.commit()

        # Stage 2: Transcription
        job.status = "transcribing"
        job.status_message = "Transcribing audio to timestamped text segments..."
        db.commit()

        transcript_data = ITranscriptionService.transcribe(
            audio_path or job.source_reference,
            api_key=api_key,
            captions_segments=extraction.get("captions_segments"),
            captions_text=extraction.get("captions_text")
        )

        transcript_obj = TranscriptModel(
            job_id=job.id,
            raw_text=transcript_data.get("raw_text", ""),
            segments=transcript_data.get("segments", [])
        )
        db.add(transcript_obj)
        db.commit()

        # Stage 3: Structuring
        job.status = "structuring"
        job.status_message = "Generative LLM structuring notes, concepts, quiz & study guide..."
        db.commit()

        structured = IStructuringService.structure_transcript(
            raw_text=transcript_data.get("raw_text", ""),
            segments=transcript_data.get("segments", []),
            title=job.title,
            api_key=api_key
        )

        structured_obj = StructuredContentModel(
            job_id=job.id,
            notes_json=json.dumps(structured.get("notes", [])),
            key_concepts_json=json.dumps(structured.get("key_concepts", [])),
            quiz_json=json.dumps(structured.get("quiz", [])),
            study_guide=structured.get("study_guide", "")
        )
        db.add(structured_obj)

        job.status = "complete"
        job.status_message = "Lecture processed successfully!"
        db.commit()

    except Exception as e:
        logger.exception(f"Error processing job {job_id}: {e}")
        job = db.query(JobModel).filter(JobModel.id == job_id).first()
        if job:
            job.status = "failed_processing"
            job.status_message = f"Processing failed: {str(e)}"
            db.commit()

import json

# --- API Endpoints ---

@app.post("/api/lectures/upload", status_code=202)
async def upload_lecture(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    rights_confirmed: bool = Form(True),
    api_key: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """FR-1.1: Direct file upload endpoint (mp3, wav, m4a, mp4, mov)."""
    job_id = str(uuid.uuid4())
    file_ext = Path(file.filename).suffix
    save_filename = f"{job_id}{file_ext}"
    save_path = settings.UPLOAD_DIR / save_filename

    with open(save_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    job = JobModel(
        id=job_id,
        title=Path(file.filename).stem.replace("_", " ").title(),
        source_type="upload",
        source_reference=str(save_path),
        media_url=f"/api/lectures/{job_id}/media_file/{save_filename}",
        status="queued",
        status_message="Job queued for processing...",
        rights_confirmed=rights_confirmed
    )
    db.add(job)
    db.commit()

    background_tasks.add_task(process_lecture_job, job_id, api_key)

    return {"job_id": job_id, "status": "queued", "message": "File uploaded successfully. Job queued."}

@app.post("/api/lectures/youtube", status_code=202)
async def submit_youtube_lecture(
    req: YouTubeSubmissionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """FR-1.2 & FR-1.4: YouTube URL submission with rights confirmation attestation."""
    if not req.rights_confirmed:
        raise HTTPException(
            status_code=400,
            detail="You must confirm you have the rights/permission to process this YouTube lecture."
        )

    if not is_valid_youtube_url(req.youtube_url):
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL format."
        )

    job_id = str(uuid.uuid4())
    job = JobModel(
        id=job_id,
        title="YouTube Lecture Ingestion",
        source_type="youtube",
        source_reference=req.youtube_url,
        media_url=req.youtube_url,
        status="queued",
        status_message="YouTube link queued for extraction...",
        rights_confirmed=True
    )
    db.add(job)
    db.commit()

    background_tasks.add_task(process_lecture_job, job_id, req.api_key)

    return {"job_id": job_id, "status": "queued", "message": "YouTube URL submitted. Job queued."}

@app.get("/api/lectures/{job_id}/status")
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    """FR-5.4: Job status polling endpoint."""
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "job_id": job.id,
        "title": job.title,
        "status": job.status,
        "message": job.status_message,
        "source_type": job.source_type,
        "created_at": job.created_at
    }

@app.get("/api/lectures/{job_id}/results")
def get_job_results(job_id: str, db: Session = Depends(get_db)):
    """FR-5.1: Structured results retrieval endpoint (Notes, Concepts, Quiz, Study Guide)."""
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != "complete":
        return {
            "job_id": job.id,
            "status": job.status,
            "message": "Processing is still in progress.",
            "results": None
        }

    transcript = job.transcript
    structured = job.structured_content

    return {
        "job_id": job.id,
        "title": job.title,
        "source_type": job.source_type,
        "source_reference": job.source_reference,
        "media_url": job.media_url,
        "status": job.status,
        "results": {
            "transcript": {
                "raw_text": transcript.raw_text if transcript else "",
                "segments": transcript.segments if transcript else []
            },
            "notes": structured.notes if structured else [],
            "key_concepts": structured.key_concepts if structured else [],
            "quiz": structured.quiz if structured else [],
            "study_guide": structured.study_guide if structured else ""
        }
    }

@app.get("/api/lectures/{job_id}/media_file/{filename}")
def serve_media_file(job_id: str, filename: str):
    file_path = settings.UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Media file not found")
    return FileResponse(file_path)

@app.get("/api/lectures/{job_id}/export")
def export_lecture(
    job_id: str,
    format: str = Query("pdf", pattern="^(pdf|md|anki)$"),
    with_answers: bool = Query(True),
    db: Session = Depends(get_db)
):
    """FR-6.1 - FR-6.3: Export endpoint for PDF, Markdown, and Anki formats."""
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not job or job.status != "complete":
        raise HTTPException(status_code=400, detail="Lecture not found or processing not complete")

    structured = {
        "notes": job.structured_content.notes,
        "key_concepts": job.structured_content.key_concepts,
        "quiz": job.structured_content.quiz,
        "study_guide": job.structured_content.study_guide
    }

    clean_title = "".join([c if c.isalnum() else "_" for c in job.title])

    if format == "md":
        md_content = IExporterService.export_markdown(job.title, structured, include_quiz=with_answers)
        return Response(
            content=md_content,
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="{clean_title}_clipnote.md"'}
        )

    elif format == "anki":
        anki_content = IExporterService.export_anki(structured)
        return Response(
            content=anki_content,
            media_type="text/tab-separated-values",
            headers={"Content-Disposition": f'attachment; filename="{clean_title}_anki.txt"'}
        )

    elif format == "pdf":
        pdf_path = settings.EXPORTS_DIR / f"{job.id}_export.pdf"
        IExporterService.export_pdf(job.title, structured, pdf_path)
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"{clean_title}_clipnote.pdf"
        )

@app.get("/api/lectures")
def list_lectures(db: Session = Depends(get_db)):
    """FR-7.3: Dashboard listing past processed lectures."""
    jobs = db.query(JobModel).order_by(JobModel.created_at.desc()).all()
    return [
        {
            "id": j.id,
            "title": j.title,
            "source_type": j.source_type,
            "source_reference": j.source_reference,
            "status": j.status,
            "created_at": j.created_at
        }
        for j in jobs
    ]

@app.delete("/api/lectures/{job_id}")
def delete_lecture(job_id: str, db: Session = Depends(get_db)):
    """FR-7.4: Delete lecture job and associated files."""
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Lecture not found")

    db.delete(job)
    db.commit()
    return {"message": "Lecture deleted successfully."}

@app.post("/api/settings")
def update_settings(req: SettingsUpdateRequest):
    if req.gemini_api_key:
        settings.GEMINI_API_KEY = req.gemini_api_key
    if req.openai_api_key:
        settings.OPENAI_API_KEY = req.openai_api_key
    return {"message": "Settings updated successfully."}
