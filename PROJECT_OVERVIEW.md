# Clipnote — AI Lecture Note Taker
## Complete Project Overview, Tech Stack & AWS Deployment Guide

---

## 1. What is Clipnote?

Clipnote is a full-stack AI-powered web application that converts lecture recordings — either uploaded audio/video files or YouTube links — into structured, revision-ready study material. A student submits a lecture source and receives, within minutes:

- **Timestamped Notes** organized by topic/section
- **Key Concepts Glossary** with short definitions
- **Auto-generated Quiz** (MCQ + short-answer with answer key)
- **One-page Executive Study Guide** in Markdown
- **Exports** in PDF, Markdown, and Anki flashcard formats

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────┐
│               FRONTEND (Next.js 16)              │
│  Browser  →  React UI  →  REST API calls         │
└──────────────────────┬───────────────────────────┘
                       │ HTTP (REST)
┌──────────────────────▼───────────────────────────┐
│            BACKEND (FastAPI / Python)            │
│                                                  │
│  ┌──────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │Extractor │→ │ Transcriber │→ │ Structurer  │ │
│  │(yt-dlp) │  │(Gemini/Whisp│  │(Gemini/GPT) │ │
│  └──────────┘  └─────────────┘  └─────────────┘ │
│                       │                          │
│              ┌────────▼────────┐                 │
│              │  SQLite via     │                 │
│              │  SQLAlchemy ORM │                 │
│              └─────────────────┘                 │
└──────────────────────────────────────────────────┘
```

The pipeline runs as a **background job** (FastAPI `BackgroundTasks`) so the API stays non-blocking. The frontend polls a status endpoint until the job reaches `complete`.

---

## 3. Frontend

### Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | **Next.js** (App Router) | 16.2.11 |
| Language | **TypeScript** | ^5 |
| UI Library | **React** | 19.2.4 |
| Icons | **Lucide React** | ^1.26.0 |
| Styling | **Tailwind CSS** | ^4 |
| Linting | ESLint + eslint-config-next | 16.2.11 |

### Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main single-page application
│   │   ├── layout.tsx        # Root layout & metadata
│   │   └── globals.css       # Global Tailwind + custom styles
│   └── components/
│       ├── ExportModal.tsx       # PDF / MD / Anki export dialog
│       ├── HistoryDrawer.tsx     # Sidebar with past lecture history
│       ├── KeyConceptsTab.tsx    # Glossary tab view
│       ├── MediaSyncPlayer.tsx   # Audio/video player with timestamp sync
│       ├── NotesTab.tsx          # Sectioned notes tab view
│       ├── QuizTab.tsx           # Interactive quiz with answer reveal
│       ├── SettingsModal.tsx     # API key configuration modal
│       ├── StudyGuideTab.tsx     # Markdown study guide tab
│       └── TranscriptTab.tsx     # Raw timestamped transcript view
├── public/
├── next.config.ts
├── package.json
└── tsconfig.json
```

### Key Frontend Features

- **Dual input**: drag-and-drop file upload OR YouTube URL paste
- **Real-time job polling**: status bar shows `queued → extracting → transcribing → structuring → complete`
- **5-tab results view**: Notes, Key Concepts, Quiz, Study Guide, Transcript
- **Media sync player**: clicking any timestamped note/quiz item seeks the audio player to that exact moment
- **Interactive quiz**: MCQ with option selection + reveal answer button
- **History drawer**: lists all past processed lectures from the API
- **Export modal**: one-click PDF, Markdown, or Anki download
- **Settings modal**: user-configurable Gemini / OpenAI API keys

---

## 4. Backend

### Technology Stack

| Layer | Technology |
|---|---|
| Framework | **FastAPI** ≥ 0.110 |
| Language | **Python** 3.11+ |
| ASGI Server | **Uvicorn** (with standard extras) |
| ORM | **SQLAlchemy** ≥ 2.0 |
| Database | **SQLite** (local file `clipnote.db`) |
| Video Extraction | **yt-dlp** ≥ 2024.3 |
| AI Transcription | **Google Gemini** (`gemini-2.5-flash`) / **OpenAI Whisper** (`whisper-1`) |
| AI Structuring | **Google Gemini** (`gemini-2.5-flash`) / **OpenAI GPT-4o-mini** |
| PDF Generation | **ReportLab** ≥ 4.1 |
| Audio Processing | **pydub** + **imageio-ffmpeg** (bundled ffmpeg) |
| Config | **python-dotenv** |
| Validation | **Pydantic** v2 |

### Directory Structure

```
backend/
├── main.py              # FastAPI app, all API routes, background pipeline
├── config.py            # Settings class, env vars, directory paths
├── database.py          # SQLAlchemy models (Job, Transcript, StructuredContent)
├── utils.py             # JSON cleaning helpers
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variable template
├── uploads/             # Uploaded / downloaded audio files (auto-created)
├── exports/             # Generated PDF exports (auto-created)
└── services/
    ├── extractor.py     # YouTube audio + caption extraction (yt-dlp)
    ├── transcriber.py   # Speech-to-text (Gemini → Whisper → fallback)
    ├── structurer.py    # LLM note structuring (Gemini → OpenAI → fallback)
    └── exporter.py      # PDF, Markdown, Anki export generation
```

### Database Schema (SQLite)

**`jobs`** table — one row per lecture submission
```
id (PK UUID), user_id, title, source_type (upload|youtube),
source_reference (filepath|URL), media_url, status, status_message,
rights_confirmed, duration_seconds, created_at, updated_at
```

**`transcripts`** table — linked 1:1 to a job
```
id, job_id (FK), raw_text, segments_json (JSON array of {start,end,text})
```

**`structured_content`** table — linked 1:1 to a job
```
id, job_id (FK), notes_json, key_concepts_json, quiz_json, study_guide (Markdown text)
```

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/lectures/upload` | Upload audio/video file, returns `job_id` |
| `POST` | `/api/lectures/youtube` | Submit YouTube URL, returns `job_id` |
| `GET` | `/api/lectures/{job_id}/status` | Poll job processing status |
| `GET` | `/api/lectures/{job_id}/results` | Fetch full structured results |
| `GET` | `/api/lectures/{job_id}/export?format=pdf\|md\|anki` | Download export file |
| `GET` | `/api/lectures/{job_id}/media_file/{filename}` | Stream uploaded audio |
| `GET` | `/api/lectures` | List all past lectures (dashboard) |
| `DELETE` | `/api/lectures/{job_id}` | Delete a lecture and its data |
| `POST` | `/api/settings` | Update API keys at runtime |

### Processing Pipeline (Background Job)

```
1. EXTRACTION   → yt-dlp downloads YouTube audio + VTT captions
                   OR validates uploaded file
2. TRANSCRIPTION → Gemini API (uploads audio file, returns timestamped JSON)
                   OR OpenAI Whisper (verbose_json with segment timestamps)
                   OR rule-based fallback (demo data)
3. STRUCTURING   → Gemini API (returns notes/concepts/quiz/study_guide JSON)
                   OR OpenAI GPT-4o-mini
                   OR analytical rule-based fallback
4. COMPLETE      → Results saved to SQLite, available via /results endpoint
```

### AI Provider Cascade (Fallback Strategy)

```
Gemini API (primary)  →  OpenAI API (secondary)  →  Rule-based fallback
```
Both transcription and structuring follow this pattern, making the system resilient to API key absence or failures.

---

## 5. Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here          # optional fallback

# Optional cloud storage (not required for local/basic AWS deploy)
SUPABASE_URL=
SUPABASE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 6. Running Locally

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # Add your API keys
uvicorn main:app --reload --port 8000
```
API available at: `http://localhost:8000`

### Frontend
```bash
cd frontend
npm install
# Create frontend/.env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```
UI available at: `http://localhost:3000`

---

## 7. AWS Deployment Guide

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                           │
│                                                             │
│  ┌──────────┐    ┌────────────┐    ┌────────────────────┐  │
│  │CloudFront│ →  │  S3 Bucket │    │   EC2 / ECS / EBS  │  │
│  │  (CDN)   │    │(Next.js    │    │   (FastAPI Backend) │  │
│  └──────────┘    │ static     │    └────────────┬───────┘  │
│                  │ export)    │                 │           │
│                  └────────────┘                 │           │
│                                    ┌────────────▼───────┐  │
│                                    │   RDS / EFS / EBS  │  │
│                                    │  (SQLite on EBS or │  │
│                                    │   migrate to RDS   │  │
│                                    │   PostgreSQL)      │  │
│                                    └────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ALB (Application Load Balancer)         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### Option A — EC2 (Simplest, Recommended for MVP)

#### Step 1 — Launch EC2 Instance
- AMI: **Ubuntu 22.04 LTS**
- Instance type: **t3.medium** (2 vCPU, 4 GB RAM — minimum for Whisper/Gemini workloads)
- Storage: **30 GB EBS gp3**
- Security Group inbound rules:
  - Port 22 (SSH)
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
  - Port 8000 (FastAPI — restrict to ALB or VPC only in production)

#### Step 2 — Backend Setup on EC2
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>

# Install system dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.11 python3.11-venv python3-pip nginx ffmpeg git

# Clone repository
git clone https://github.com/youruser/Clipnote.git
cd Clipnote/backend

# Setup Python environment
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env   # Add GEMINI_API_KEY, OPENAI_API_KEY
```

#### Step 3 — Create Systemd Service (Backend Auto-start)
```bash
sudo nano /etc/systemd/system/clipnote-backend.service
```
Paste:
```ini
[Unit]
Description=Clipnote FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/Clipnote/backend
Environment="PATH=/home/ubuntu/Clipnote/backend/venv/bin"
ExecStart=/home/ubuntu/Clipnote/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable clipnote-backend
sudo systemctl start clipnote-backend
sudo systemctl status clipnote-backend   # should show: active (running)
```

#### Step 4 — Frontend Build & Deploy on EC2
```bash
cd /home/ubuntu/Clipnote/frontend

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Set backend API URL
echo "NEXT_PUBLIC_API_URL=http://<EC2_PUBLIC_IP>:8000" > .env.local
# (Or use your domain name after setting up HTTPS)

npm install
npm run build

# Install PM2 to run Next.js
sudo npm install -g pm2
pm2 start npm --name "clipnote-frontend" -- start
pm2 startup     # follow instructions to persist across reboots
pm2 save
```

#### Step 5 — Configure Nginx as Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/clipnote
```
Paste:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 2G;        # Allow large file uploads
        proxy_read_timeout 600s;        # Long timeout for processing
        proxy_send_timeout 600s;
    }

    # Media file streaming
    location /media_files/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/clipnote /etc/nginx/sites-enabled/
sudo nginx -t   # test config
sudo systemctl reload nginx
```

#### Step 6 — HTTPS with Let's Encrypt (Required for Production)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
# Certbot auto-renews; verify with:
sudo certbot renew --dry-run
```

---

### Option B — AWS ECS with Fargate (Containerized / Scalable)

#### Step 1 — Dockerize the Backend

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads exports

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `frontend/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

#### Step 2 — Push Images to ECR
```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Create repos
aws ecr create-repository --repository-name clipnote-backend
aws ecr create-repository --repository-name clipnote-frontend

# Build & push backend
docker build -t clipnote-backend ./backend
docker tag clipnote-backend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/clipnote-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/clipnote-backend:latest

# Build & push frontend
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.your-domain.com -t clipnote-frontend ./frontend
docker tag clipnote-frontend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/clipnote-frontend:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/clipnote-frontend:latest
```

#### Step 3 — ECS Fargate Service Setup
1. **Create ECS Cluster** → `clipnote-cluster`
2. **Create Task Definitions** for backend and frontend with:
   - Backend: 1 vCPU, 2 GB RAM, port 8000, EFS volume for `uploads/` and `exports/`
   - Frontend: 0.5 vCPU, 1 GB RAM, port 3000
   - Add environment variables (`GEMINI_API_KEY`, etc.) via **AWS Secrets Manager**
3. **Create Services** for each task definition
4. **Attach ALB** (Application Load Balancer) with path routing:
   - `/api/*` → Backend target group (port 8000)
   - `/*` → Frontend target group (port 3000)

#### Step 4 — EFS for Persistent Storage (Fargate)
```bash
# Create EFS file system
aws efs create-file-system --region us-east-1 --tags Key=Name,Value=clipnote-efs

# Mount targets in each subnet your ECS tasks run in
# Attach EFS volume in Task Definition:
#   Container path: /app/uploads  and  /app/exports
```

> **Note:** For production at scale, migrate from SQLite to **Amazon RDS PostgreSQL**. Update `database.py` to use `postgresql://` connection string and install `psycopg2-binary`.

---

### Option C — Elastic Beanstalk (Easiest Managed Deployment)

```bash
# Install EB CLI
pip install awsebcli

cd Clipnote/backend
eb init clipnote-backend --platform python-3.11 --region us-east-1
eb create clipnote-production \
  --instance-type t3.medium \
  --elb-type application

# Set environment variables
eb setenv GEMINI_API_KEY=your_key OPENAI_API_KEY=your_key

eb deploy
eb open
```

Create `backend/Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port 8080
```

---

## 8. AWS Services Cost Estimate (MVP)

| Service | Usage | Estimated Monthly Cost |
|---|---|---|
| EC2 t3.medium | 24/7 | ~$30/month |
| EBS 30 GB gp3 | Storage | ~$2.50/month |
| ALB | Per hour + LCUs | ~$20/month |
| Route 53 | 1 hosted zone | ~$0.50/month |
| S3 (exports backup) | Optional | ~$1/month |
| **Gemini API** | Pay-per-use | Variable |
| **OpenAI Whisper** | $0.006/min audio | Variable |
| **Total (infra)** | | **~$55/month** |

---

## 9. Production Checklist

- [ ] Set `allow_origins` in CORS to your domain (not `"*"`)
- [ ] Move API keys to **AWS Secrets Manager** or **Parameter Store**
- [ ] Switch database from SQLite → **RDS PostgreSQL** for concurrent access
- [ ] Set up **S3** for `uploads/` and `exports/` (EFS for Fargate)
- [ ] Configure **CloudWatch** log groups for the FastAPI service
- [ ] Enable **auto-scaling** on ECS service based on CPU metrics
- [ ] Set up **S3 lifecycle policy** to auto-delete old uploads after N days
- [ ] Configure **WAF** (Web Application Firewall) on ALB for abuse protection
- [ ] Add **health check endpoint** (`GET /health`) to FastAPI for ALB target group
- [ ] Enable **HTTPS** (ACM certificate on ALB or Let's Encrypt on EC2)
- [ ] Set `MAX_UPLOAD_SIZE_MB` via env var and configure Nginx `client_max_body_size`

---

## 10. Adding a Health Check Endpoint

Add to `backend/main.py` before deployment:
```python
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "clipnote-backend"}
```

---

*Document generated: July 2026 | Clipnote v1.0*
