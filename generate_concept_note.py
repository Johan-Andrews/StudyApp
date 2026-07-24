import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether, PageBreak
)

def create_concept_note_pdf(output_filename="Clipnote_Project_Concept_Note.pdf"):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Palette
    PRIMARY = colors.HexColor("#1E1B4B")      # Deep Indigo / Navy
    SECONDARY = colors.HexColor("#4F46E5")    # Indigo Accent
    TEXT_DARK = colors.HexColor("#1F2937")    # Charcoal body text
    BG_LIGHT = colors.HexColor("#F8FAFC")     # Soft slate background
    BORDER_COLOR = colors.HexColor("#CBD5E1")
    HIGHLIGHT_BG = colors.HexColor("#EEF2FF") # Soft indigo highlight

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceAfter=12
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=PRIMARY,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=PRIMARY
    )

    meta_value = ParagraphStyle(
        'MetaValue',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK
    )

    url_banner_style = ParagraphStyle(
        'UrlBanner',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=PRIMARY,
        alignment=1 # Centered
    )

    story = []

    # Document Header
    story.append(Paragraph("PROJECT CONCEPT NOTE", subtitle_style))
    story.append(Paragraph("Clipnote: AI-Powered Lecture Note-Taking App", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=SECONDARY, spaceBefore=4, spaceAfter=12))

    # Prominent Live AWS Application URL Banner
    banner_data = [[Paragraph("🌐 <b>LIVE SECURE APPLICATION URL (HTTPS):</b><br/><font color='#4F46E5' size='12'><u>https://palace-subjective-except-stats.trycloudflare.com/</u></font><br/><font size='8' color='#64748B'>(Direct AWS EC2 IP: http://3.27.186.233)</font>", url_banner_style)]]
    banner_table = Table(banner_data, colWidths=[7.0*inch])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HIGHLIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1.5, SECONDARY),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 10))

    # Executive Overview Metadata Box
    meta_data = [
        [Paragraph("Application Name:", meta_label), Paragraph("Clipnote", meta_value),
         Paragraph("Live HTTPS URL:", meta_label), Paragraph("https://palace-subjective-except-stats.trycloudflare.com/", meta_value)],
        [Paragraph("Primary LLM API:", meta_label), Paragraph("Google Gemini 2.5 Flash API", meta_value),
         Paragraph("Cloud Infrastructure:", meta_label), Paragraph("AWS EC2 (Ubuntu 24.04 / t3.micro)", meta_value)],
        [Paragraph("Target Audience:", meta_label), Paragraph("Students, Researchers, Educators", meta_value),
         Paragraph("Tech Stack:", meta_label), Paragraph("Next.js 16, FastAPI, SQLite, Nginx", meta_value)]
    ]

    meta_table = Table(meta_data, colWidths=[1.2*inch, 2.3*inch, 1.3*inch, 2.2*inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Section 1: Problem Statement & Objectives
    story.append(Paragraph("1. Problem Statement & Objective", section_heading))
    p1 = ("Modern students and self-learners consume hours of dense audio/video lectures, webinars, and recorded "
          "academic sessions daily. Manual note-taking during long lectures is inefficient, prone to missing key details, "
          "and creates a heavy cognitive load. Existing tools either offer simple verbatim transcripts without structural hierarchy "
          "or lack multi-format exports.")
    p2 = ("<b>Core Objective:</b> Clipnote solves this by providing an automated end-to-end pipeline that transforms raw audio/video "
          "uploads or YouTube links into structured, high-retention study packages—complete with sectioned notes, key term definitions, "
          "self-assessment quizzes, and executive study guides in seconds.")
    story.append(Paragraph(p1, body_style))
    story.append(Paragraph(p2, body_style))

    # Section 2: Target User & Primary Use Cases
    story.append(Paragraph("2. Target User & Use Cases", section_heading))
    story.append(Paragraph("• <b>University & High School Students:</b> Converting recorded university lectures into organized revision notes and flashcards before exams.", bullet_style))
    story.append(Paragraph("• <b>Online Learners & Self-Taught Developers:</b> Summarizing long YouTube tutorials, coding bootcamps, and technical webinars.", bullet_style))
    story.append(Paragraph("• <b>Researchers & Educators:</b> Extracting core concepts and generating quick assessment quizzes from academic audio recordings.", bullet_style))

    # Section 3: LLM Model & API Integration
    story.append(Paragraph("3. LLM Models & API Architecture", section_heading))
    p_llm = ("Clipnote leverages <b>Google Gemini 2.5 Flash</b> (`gemini-2.5-flash`) via the <code>google-genai</code> SDK as its primary LLM engine. "
             "Gemini 2.5 Flash was chosen for its ultra-fast inference speed, 1M token context window, and exceptional structured JSON generation capabilities. "
             "The system features a multi-tiered API architecture:")
    story.append(Paragraph(p_llm, body_style))
    story.append(Paragraph("• <b>Primary Processing Engine:</b> Google Gemini 2.5 Flash API for multi-segment transcription synthesis and structured JSON parsing.", bullet_style))
    story.append(Paragraph("• <b>Secondary Fallback Engine:</b> OpenAI API (`gpt-4o-mini`) automatically engages if Gemini API limits are reached.", bullet_style))
    story.append(Paragraph("• <b>Transcription Pipeline:</b> Multi-tiered pipeline utilizing native YouTube captions (`youtube-transcript-api`), Gemini Audio API, and OpenAI Whisper.", bullet_style))

    # Section 4: Key Features
    story.append(Paragraph("4. Key Application Features", section_heading))

    features_data = [
        [Paragraph("Feature Module", meta_label), Paragraph("Technical & Functional Description", meta_label)],
        [Paragraph("Multi-Source Ingestion", meta_label), Paragraph("Supports direct local media uploads (.mp3, .mp4, .wav, .m4a) and YouTube lecture URLs.", body_style)],
        [Paragraph("Interactive Media Player", meta_label), Paragraph("Synchronized audio/video player with click-to-seek timestamp navigation across transcript segments.", body_style)],
        [Paragraph("Structured Note Generation", meta_label), Paragraph("Generates hierarchical lecture notes categorized into overview, core concepts, and key takeaways.", body_style)],
        [Paragraph("Interactive Quiz Engine", meta_label), Paragraph("Generates 5-question multiple choice quizzes with instant feedback, scoring, and explanation hints.", body_style)],
        [Paragraph("Executive Study Guide", meta_label), Paragraph("Produces a high-yield revision checklist and key terms glossary for rapid pre-exam review.", body_style)],
        [Paragraph("Multi-Format Exporting", meta_label), Paragraph("One-click exports to publication-ready PDF reports, raw Markdown (.md), and Anki Flashcard decks (.txt).", body_style)]
    ]

    features_table = Table(features_data, colWidths=[2.2*inch, 4.8*inch])
    features_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), SECONDARY),
        ('TEXTCOLOR', (0,0), (1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(features_table)
    story.append(Spacer(1, 8))

    # Section 5: Expected User Experience & Outcomes
    story.append(Paragraph("5. Expected User Experience & Outcomes", section_heading))
    story.append(Paragraph("• <b>Time Reduction:</b> Reduces post-lecture review time by up to 80% by automating initial note drafting and concept organization.", bullet_style))
    story.append(Paragraph("• <b>Active Recall Learning:</b> Enhances long-term knowledge retention through immediate interactive quiz testing and flashcard export.", bullet_style))
    story.append(Paragraph("• <b>Seamless UI/UX:</b> Provides a modern dark-mode responsive web app with zero-latency tab switching and real-time task status polling.", bullet_style))
    story.append(Paragraph("• <b>Production-Ready Cloud Hosting:</b> Publicly hosted live on AWS EC2 (`http://3.27.186.233`) behind an Nginx reverse proxy managed by systemd and PM2.", bullet_style))

    # Footer Note
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceBefore=5, spaceAfter=8))
    footer_text = Paragraph("<font color='#6B7280' size='8'>Clipnote AI Study Application — Project Concept Note — Live HTTPS URL: https://palace-subjective-except-stats.trycloudflare.com/</font>", body_style)
    story.append(footer_text)

    doc.build(story)
    print(f"Concept Note PDF successfully created: {output_filename}")

if __name__ == "__main__":
    create_concept_note_pdf()
