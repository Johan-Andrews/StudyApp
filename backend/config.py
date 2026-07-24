import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
load_dotenv(ENV_FILE, override=True)

UPLOAD_DIR = BASE_DIR / "uploads"
EXPORTS_DIR = BASE_DIR / "exports"
DB_PATH = BASE_DIR / "clipnote.db"

# Ensure directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
EXPORTS_DIR.mkdir(parents=True, exist_ok=True)

class Settings:
    PROJECT_NAME: str = "Clipnote - AI Lecture Note Taker"
    VERSION: str = "1.0.0"
    
    # Storage
    UPLOAD_DIR: Path = UPLOAD_DIR
    EXPORTS_DIR: Path = EXPORTS_DIR
    MAX_UPLOAD_SIZE_MB: int = 2048  # 2 GB max
    
    @property
    def GEMINI_API_KEY(self) -> str:
        load_dotenv(ENV_FILE, override=True)
        return os.getenv("GEMINI_API_KEY", "").strip()

    @property
    def OPENAI_API_KEY(self) -> str:
        load_dotenv(ENV_FILE, override=True)
        return os.getenv("OPENAI_API_KEY", "").strip()
    
    # Cloud optional providers
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")
    
    # LLM & Audio Settings
    DEFAULT_LLM_MODEL: str = "gemini-2.5-flash"
    MAX_AUDIO_CHUNK_MINUTES: int = 15

settings = Settings()
