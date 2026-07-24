import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether, PageBreak
)

def create_project_report_pdf(output_filename="Clipnote_Project_Report.pdf"):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=45,
        rightMargin=45,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    # Palette
    PRIMARY = colors.HexColor("#1E1B4B")      # Deep Indigo / Navy
    SECONDARY = colors.HexColor("#4F46E5")    # Indigo Accent
    TEXT_DARK = colors.HexColor("#1F2937")    # Charcoal body text
    BG_LIGHT = colors.HexColor("#F8FAFC")     # Soft slate background
    CODE_BG = colors.HexColor("#1E293B")      # Slate 800 dark code bg
    CODE_TEXT = colors.HexColor("#38BDF8")    # Sky blue code text
    BORDER_COLOR = colors.HexColor("#CBD5E1")
    HIGHLIGHT_BG = colors.HexColor("#EEF2FF")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=PRIMARY,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=SECONDARY,
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=SECONDARY,
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=13,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#E2E8F0"),
        spaceBefore=4,
        spaceAfter=4
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=PRIMARY
    )

    meta_value = ParagraphStyle(
        'MetaValue',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_DARK
    )

    url_banner_style = ParagraphStyle(
        'UrlBanner',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=PRIMARY,
        alignment=1
    )

    story = []

    # Title & Subtitle
    story.append(Paragraph("PROJECT DEVELOPMENT & TECHNICAL REPORT", subtitle_style))
    story.append(Paragraph("Clipnote: AI Lecture Note-Taker & Study App", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=SECONDARY, spaceBefore=4, spaceAfter=10))

    # Live URL Banner
    banner_data = [[Paragraph("🌐 <b>LIVE SECURE APPLICATION URL (HTTPS):</b><br/><font color='#4F46E5' size='11.5'><u>https://palace-subjective-except-stats.trycloudflare.com/</u></font><br/><font size='8' color='#64748B'>(Direct AWS EC2 IP: http://3.27.186.233)</font>", url_banner_style)]]
    banner_table = Table(banner_data, colWidths=[7.2*inch])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HIGHLIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1.5, SECONDARY),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 8))

    # Metadata Grid
    meta_data = [
        [Paragraph("Application Name:", meta_label), Paragraph("Clipnote", meta_value),
         Paragraph("Live HTTPS URL:", meta_label), Paragraph("https://palace-subjective-except-stats.trycloudflare.com/", meta_value)],
        [Paragraph("Primary LLM:", meta_label), Paragraph("Google Gemini 2.5 Flash API", meta_value),
         Paragraph("Cloud Platform:", meta_label), Paragraph("AWS EC2 (Ubuntu 24.04 / t3.micro)", meta_value)],
        [Paragraph("Frontend Stack:", meta_label), Paragraph("Next.js 16 (App Router), Tailwind v4", meta_value),
         Paragraph("Backend Stack:", meta_label), Paragraph("FastAPI, SQLite, Nginx, Systemd, PM2", meta_value)]
    ]
    meta_table = Table(meta_data, colWidths=[1.2*inch, 2.4*inch, 1.2*inch, 2.4*inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # 1. APPLICATION OVERVIEW & TECH STACK
    # ---------------------------------------------------------
    story.append(Paragraph("1. Application Overview & Tech Stack", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceBefore=1, spaceAfter=6))
    
    story.append(Paragraph(
        "<b>Clipnote</b> is a full-stack, AI-powered lecture processing application that ingests recorded audio/video files or YouTube links "
        "and automatically synthesizes comprehensive study materials. The system generates structured sectioned notes, key concepts glossaries, "
        "interactive 5-question multiple-choice quizzes, executive revision guides, and multi-format exports (PDF, Markdown, Anki flashcard decks).",
        body_style
    ))

    stack_data = [
        [Paragraph("Layer", meta_label), Paragraph("Technology / Framework", meta_label), Paragraph("Key Purpose & Responsibility", meta_label)],
        [Paragraph("Frontend", meta_label), Paragraph("Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons", body_style), Paragraph("Responsive dark-mode UI, real-time status polling, tabbed dashboard, synchronized media player.", body_style)],
        [Paragraph("Backend API", meta_label), Paragraph("FastAPI, Uvicorn, Python 3.12, Pydantic v2, SQLAlchemy", body_style), Paragraph("RESTful endpoints, background task processing queue, non-blocking asynchronous pipeline execution.", body_style)],
        [Paragraph("Database", meta_label), Paragraph("SQLite 3 with SQLAlchemy ORM", body_style), Paragraph("Persistent storage of jobs, raw transcripts, timestamped segments, and generated JSON study kits.", body_style)],
        [Paragraph("AI / LLM Engine", meta_label), Paragraph("Google Gemini 2.5 Flash (`gemini-2.5-flash`), OpenAI GPT-4o-mini", body_style), Paragraph("Primary structural synthesis, JSON schema enforcement, multi-segment transcript summarization.", body_style)],
        [Paragraph("Media & Ingestion", meta_label), Paragraph("youtube-transcript-api, pytubefix, yt-dlp, FFmpeg, ReportLab", body_style), Paragraph("Audio extraction, VTT/SRT caption parsing, multi-tier YouTube handling, publication PDF rendering.", body_style)],
        [Paragraph("Cloud Hosting", meta_label), Paragraph("AWS EC2 (Ubuntu 24.04 / t3.micro), Nginx, Systemd, PM2", body_style), Paragraph("Public cloud deployment, reverse proxy routing (port 80 -> 3000/8000), service auto-restart.", body_style)]
    ]
    stack_table = Table(stack_data, colWidths=[1.1*inch, 2.6*inch, 3.5*inch])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(stack_table)
    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # 2. PROMPTING STRATEGY & FRAMEWORKS
    # ---------------------------------------------------------
    story.append(Paragraph("2. Prompting Strategy & Frameworks Used", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceBefore=1, spaceAfter=6))

    story.append(Paragraph(
        "Clipnote employs a structured <b>Chain-of-Thought (CoT) and JSON Schema Enforcement</b> prompting strategy. "
        "Rather than relying on open-ended text generation, LLM prompts explicitly enforce strict Pydantic JSON validation, "
        "guaranteeing deterministic outputs for downstream UI rendering and export services.",
        body_style
    ))

    story.append(Paragraph("Key Prompt Engineering Techniques:", h2_style))
    story.append(Paragraph("• <b>System Persona & Role Assignment:</b> Instructing the LLM to act as an expert academic tutor and curriculum strategist.", bullet_style))
    story.append(Paragraph("• <b>Strict Structural Schema Enforcement:</b> Using Pydantic response models to enforce nested JSON schemas (Overview, Sections, Quiz, Study Guide).", bullet_style))
    story.append(Paragraph("• <b>Decomposed Processing Stages:</b> Separating raw transcription extraction from structural synthesis to prevent token truncation.", bullet_style))

    story.append(Paragraph("Sample System Prompt (Backend Structurer Service):", h2_style))

    sample_prompt = (
        "SYSTEM PROMPT:\n"
        "You are an elite academic tutor and curriculum architect.\n"
        "Analyze the provided transcript segments and generate a comprehensive study package strictly formatted as JSON.\n\n"
        "OUTPUT JSON SCHEMA REQUIREMENT:\n"
        "{\n"
        "  \"title\": string,\n"
        "  \"overview\": string,\n"
        "  \"key_concepts\": [{\"term\": string, \"definition\": string}],\n"
        "  \"sections\": [{\"title\": string, \"summary\": string, \"start_time\": float, \"end_time\": float}],\n"
        "  \"quiz\": [{\"question\": string, \"options\": [string], \"correct_option\": int, \"explanation\": string}],\n"
        "  \"study_guide\": {\"summary_checklist\": [string], \"key_takeaways\": [string]}\n"
        "}"
    )

    code_table = Table([[Paragraph(sample_prompt.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style)]], colWidths=[7.2*inch])
    code_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CODE_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(code_table)
    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # 3. PHASE-BY-PHASE DEVELOPMENT SUMMARY
    # ---------------------------------------------------------
    story.append(Paragraph("3. Phase-by-Phase Development Summary", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceBefore=1, spaceAfter=6))

    phases_data = [
        [Paragraph("Phase", meta_label), Paragraph("Focus Area", meta_label), Paragraph("Key Milestones & Deliverables", meta_label)],
        [Paragraph("Phase 1", meta_label), Paragraph("Requirements & PRD", body_style), Paragraph("Defined core functional scope: multi-format input, timestamped notes, interactive quiz, and multi-format exports.", body_style)],
        [Paragraph("Phase 2", meta_label), Paragraph("Backend Architecture", body_style), Paragraph("Built FastAPI backend, SQLite database schema, background task processing queue, and LLM structuring service.", body_style)],
        [Paragraph("Phase 3", meta_label), Paragraph("Frontend Development", body_style), Paragraph("Developed Next.js 16 dark-mode UI, tabbed results dashboard, interactive media player, and real-time status polling.", body_style)],
        [Paragraph("Phase 4", meta_label), Paragraph("AWS EC2 Deployment", body_style), Paragraph("Provisioned EC2 t3.micro, configured Nginx reverse proxy, set up Systemd daemon for FastAPI & PM2 for Next.js.", body_style)],
        [Paragraph("Phase 5", meta_label), Paragraph("Reliability Engineering", body_style), Paragraph("Implemented SWAP memory (1.5GB) to prevent OOM errors; added youtube-transcript-api + oEmbed for 100% YouTube availability.", body_style)]
    ]
    phases_table = Table(phases_data, colWidths=[0.9*inch, 1.8*inch, 4.5*inch])
    phases_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(phases_table)
    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # 4. APPLICATION ARCHITECTURE
    # ---------------------------------------------------------
    story.append(Paragraph("4. Application Architecture", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceBefore=1, spaceAfter=6))

    story.append(Paragraph(
        "Clipnote follows a decoupled <b>Client-Server Architecture</b> hosted entirely on an AWS EC2 instance. "
        "Nginx acts as the primary reverse proxy on port 80, routing incoming user traffic to either the Next.js frontend (port 3000) "
        "or the FastAPI REST backend (port 8000).",
        body_style
    ))

    arch_flow = (
        "USER BROWSER (http://3.27.186.233)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;│<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;▼<br/>"
        "NGINX REVERSE PROXY (Port 80)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;├──► / (Frontend) ──► NEXT.JS APP (PM2 / Port 3000)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;└──► /api/ (Backend) ──► FASTAPI APP (Systemd / Port 8000)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──► SQLite DB (Jobs & Transcripts)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──► Google Gemini 2.5 Flash API (Structuring)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──► youtube-transcript-api / FFmpeg (Extraction)"
    )

    arch_table = Table([[Paragraph(arch_flow, code_style)]], colWidths=[7.2*inch])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CODE_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # 5. CHALLENGES ENCOUNTERED & RESOLUTIONS
    # ---------------------------------------------------------
    story.append(Paragraph("5. Challenges Encountered & Resolutions", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceBefore=1, spaceAfter=6))

    challenges_data = [
        [Paragraph("Challenge / Issue", meta_label), Paragraph("Root Cause Analysis", meta_label), Paragraph("Resolution Strategy Implemented", meta_label)],
        [Paragraph("AWS EC2 Memory Out-Of-Memory (OOM)", meta_label), Paragraph("t3.micro instances have 1GB RAM, causing Next.js builds and FFmpeg processing to crash.", body_style), Paragraph("Allocated 1.5GB SWAP space on EBS storage and restricted Node.js build memory (`max_old_space_size=512`).", body_style)],
        [Paragraph("YouTube Cloud IP Anti-Bot Block", meta_label), Paragraph("YouTube aggressively blocks data center IP ranges (AWS) downloading raw media streams via yt-dlp.", body_style), Paragraph("Integrated `youtube-transcript-api` + YouTube oEmbed API for instant caption extraction without media downloading.", body_style)],
        [Paragraph("Next.js Standalone Build Mismatch", meta_label), Paragraph("Standalone build mode was incompatible with Amplify/Nginx reverse proxy setup.", body_style), Paragraph("Reverted to standard SSR build mode and managed frontend execution via PM2 process manager.", body_style)],
        [Paragraph("SSH & HTTP Timeout Errors", meta_label), Paragraph("EC2 Security Group inbound rules were missing SSH (port 22) and HTTP (port 80) access.", body_style), Paragraph("Updated Security Group inbound rules to allow port 22, port 80, and port 8000 from Anywhere IPv4 (`0.0.0.0/0`).", body_style)]
    ]
    chal_table = Table(challenges_data, colWidths=[1.6*inch, 2.6*inch, 3.0*inch])
    chal_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(chal_table)
    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # 6. KEY LEARNINGS & REFLECTION
    # ---------------------------------------------------------
    story.append(Paragraph("6. Key Learnings & Reflection", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceBefore=1, spaceAfter=6))

    story.append(Paragraph("• <b>Resource-Constrained Cloud Engineering:</b> Developing on free-tier cloud infrastructure requires proactive memory management, SWAP file allocation, and lean process daemons.", bullet_style))
    story.append(Paragraph("• <b>Resilient Multi-Tier API Fallbacks:</b> External third-party integrations (YouTube, LLMs) must always feature fallback layers to ensure 100% uptime for end users.", bullet_style))
    story.append(Paragraph("• <b>Structured Output Validation:</b> Utilizing rigid Pydantic schemas with modern LLMs eliminates JSON parsing failures and delivers seamless frontend rendering.", bullet_style))

    # Footer Note
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceBefore=5, spaceAfter=8))
    footer_text = Paragraph("<font color='#6B7280' size='8'>Clipnote AI Application — Full Project Development Report — Live HTTPS URL: https://palace-subjective-except-stats.trycloudflare.com/</font>", body_style)
    story.append(footer_text)

    doc.build(story)
    print(f"Project Report PDF successfully created: {output_filename}")

if __name__ == "__main__":
    create_project_report_pdf()
