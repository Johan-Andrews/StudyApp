import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from config import DB_PATH

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class JobModel(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, default="default_user")
    title = Column(String, default="Untitled Lecture")
    source_type = Column(String, nullable=False)  # 'upload' or 'youtube'
    source_reference = Column(String, nullable=False)  # file path or YouTube URL
    media_url = Column(String, nullable=True)  # local web access path or cloud URL
    status = Column(String, default="queued")  # queued, extracting, transcribing, structuring, complete, failed_*
    status_message = Column(String, nullable=True)
    rights_confirmed = Column(Boolean, default=True)
    duration_seconds = Column(Float, default=0.0)
    cost_estimate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transcript = relationship("TranscriptModel", back_populates="job", uselist=False, cascade="all, delete-orphan")
    structured_content = relationship("StructuredContentModel", back_populates="job", uselist=False, cascade="all, delete-orphan")

class TranscriptModel(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, unique=True)
    raw_text = Column(Text, nullable=False)
    segments_json = Column(Text, nullable=False)  # JSON string of list of {start_time, end_time, text}

    job = relationship("JobModel", back_populates="transcript")

    @property
    def segments(self) -> List[Dict[str, Any]]:
        return json.loads(self.segments_json) if self.segments_json else []

    @segments.setter
    def segments(self, val: List[Dict[str, Any]]):
        self.segments_json = json.dumps(val)

class StructuredContentModel(Base):
    __tablename__ = "structured_content"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, unique=True)
    notes_json = Column(Text, nullable=False)  # JSON string of notes list
    key_concepts_json = Column(Text, nullable=False)  # JSON string of key concepts list
    quiz_json = Column(Text, nullable=False)  # JSON string of quiz questions list
    study_guide = Column(Text, nullable=False)  # Markdown text

    job = relationship("JobModel", back_populates="structured_content")

    @property
    def notes(self) -> List[Dict[str, Any]]:
        return json.loads(self.notes_json) if self.notes_json else []

    @property
    def key_concepts(self) -> List[Dict[str, Any]]:
        return json.loads(self.key_concepts_json) if self.key_concepts_json else []

    @property
    def quiz(self) -> List[Dict[str, Any]]:
        return json.loads(self.quiz_json) if self.quiz_json else []

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
