import os
import json
import logging
from typing import Dict, Any, List, Optional
from config import settings

logger = logging.getLogger("clipnote.structurer")

class IStructuringService:
    """Service interface for LLM content structuring into Notes, Concepts, Quiz, and Study Guide."""

    @classmethod
    def structure_transcript(
        cls,
        raw_text: str,
        segments: List[Dict[str, Any]],
        title: str = "Lecture Notes",
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes transcript with LLM to produce structured output adhering to SRS specification.
        Returns:
            {
                "notes": [...],
                "key_concepts": [...],
                "quiz": [...],
                "study_guide": "..."
            }
        """
        effective_gemini_key = api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        effective_openai_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")

        if effective_gemini_key:
            try:
                return cls._structure_with_gemini(raw_text, segments, title, effective_gemini_key)
            except Exception as e:
                logger.warning(f"Gemini API structuring failed: {e}. Falling back to rule-based fallback generator.")

        if effective_openai_key:
            try:
                return cls._structure_with_openai(raw_text, segments, title, effective_openai_key)
            except Exception as e:
                logger.warning(f"OpenAI API structuring failed: {e}. Falling back to rule-based fallback generator.")

        return cls._generate_intelligent_fallback_structure(raw_text, segments, title)

    @classmethod
    def _structure_with_gemini(
        cls,
        raw_text: str,
        segments: List[Dict[str, Any]],
        title: str,
        api_key: str
    ) -> Dict[str, Any]:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        prompt = f"""
        You are an elite academic notes curator and educational assessment creator.
        Process the following lecture transcript titled "{title}" and return a structured JSON response.

        TRANSCRIPT WITH TIMESTAMPS:
        {json.dumps(segments, indent=2)}

        INSTRUCTIONS FOR JSON OUTPUT:
        You MUST return ONLY a JSON object matching this schema:
        {{
          "notes": [
            {{
              "section_title": "string",
              "content": "Detailed concise bullet points summarizing key points for this section.",
              "timestamp_reference": float (start time in seconds)
            }}
          ],
          "key_concepts": [
            {{
              "term": "string",
              "definition": "Clear 1-2 sentence definition",
              "timestamp_reference": float (start time in seconds)
            }}
          ],
          "quiz": [
            {{
              "id": 1,
              "question": "string",
              "type": "mcq" or "short_answer",
              "options": ["Option A", "Option B", "Option C", "Option D"] (only if mcq, else empty list),
              "correct_answer": "string",
              "explanation": "Brief explanation of why this answer is correct",
              "timestamp_reference": float (start time in seconds)
            }}
          ],
          "study_guide": "Single-page Markdown string with executive summary, core takeaways, formulas/theorems, and revision checklist."
        }}
        """

        response = client.models.generate_content(
            model=settings.DEFAULT_LLM_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3,
            )
        )

        from utils import clean_and_parse_json
        return clean_and_parse_json(response.text)

    @classmethod
    def _structure_with_openai(
        cls,
        raw_text: str,
        segments: List[Dict[str, Any]],
        title: str,
        api_key: str
    ) -> Dict[str, Any]:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        prompt = f"""
        Process this transcript for lecture "{title}" into structured study material JSON.
        Segments: {json.dumps(segments)}
        Return JSON with keys: "notes", "key_concepts", "quiz", "study_guide".
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        return json.loads(response.choices[0].message.content)

    @classmethod
    def _generate_intelligent_fallback_structure(
        cls,
        raw_text: str,
        segments: List[Dict[str, Any]],
        title: str
    ) -> Dict[str, Any]:
        """Generates dynamic analytical structured content from transcript segments and raw text."""
        if not segments or len(segments) == 0:
            segments = [
                {"start_time": 0.0, "end_time": 60.0, "text": raw_text or "Lecture content introduction and domain principles."}
            ]

        # Group segments into 4 analytical sections
        num_segs = len(segments)
        chunk_size = max(1, num_segs // 4)
        
        notes = []
        key_concepts = []
        quiz = []
        
        section_titles = [
            f"1. Executive Overview & Foundational Concepts",
            f"2. Core Methodologies & Analytical Framework",
            f"3. Advanced Deep Dive & Operational Dynamics",
            f"4. Practical Synthesis & Key Takeaways"
        ]

        for i in range(4):
            start_idx = i * chunk_size
            end_idx = (i + 1) * chunk_size if i < 3 else num_segs
            chunk_segs = segments[start_idx:end_idx]
            
            if not chunk_segs:
                continue

            section_ts = chunk_segs[0].get("start_time", 0.0)
            chunk_text = " ".join([s.get("text", "") for s in chunk_segs])
            
            # Format concise summary bullets
            sentences = [s.strip() for s in chunk_text.split('.') if len(s.strip()) > 5]
            if not sentences:
                sentences = [chunk_text]

            bullet_content = "\n".join([f"• {st.strip()}." for st in sentences[:3]])
            
            notes.append({
                "section_title": section_titles[i],
                "content": bullet_content if bullet_content else f"Key discussion focusing on {title} mechanisms.",
                "timestamp_reference": section_ts
            })

            # Extract key concept from sentence
            if sentences:
                words = [w.strip(".,!?\"'") for w in sentences[0].split() if len(w) > 4]
                term = words[0].capitalize() if words else f"Concept {i+1}"
                if len(words) > 1:
                    term += f" {words[1].capitalize()}"
                
                key_concepts.append({
                    "term": term,
                    "definition": f"Key principle discussed in section {i+1}: {sentences[0]}.",
                    "timestamp_reference": section_ts
                })

        # Generate Quiz questions from transcript segments
        for idx, concept in enumerate(key_concepts[:3], 1):
            term = concept["term"]
            quiz.append({
                "id": idx,
                "question": f"Which core topic best describes the segment discussed at {int(concept['timestamp_reference']//60):02d}:{int(concept['timestamp_reference']%60):02d}?",
                "type": "mcq",
                "options": [
                    f"Implementation of {term}",
                    f"Secondary evaluation of legacy models",
                    f"Unrelated background noise",
                    f"Experimental baseline comparison"
                ],
                "correct_answer": f"Implementation of {term}",
                "explanation": f"The lecture explicitly covers {concept['definition']} starting at timestamp reference.",
                "timestamp_reference": concept["timestamp_reference"]
            })

        # Add Short Answer question
        if key_concepts:
            quiz.append({
                "id": len(quiz) + 1,
                "question": f"Summarize the main takeaways regarding {key_concepts[0]['term']}.",
                "type": "short_answer",
                "options": [],
                "correct_answer": key_concepts[0]['definition'],
                "explanation": "Derived directly from lecture transcript observations.",
                "timestamp_reference": key_concepts[0]["timestamp_reference"]
            })

        # Executive Study Guide
        study_guide = f"""# Executive Revision Study Guide: {title}

## 📌 Executive Summary
This structured study guide synthesizes key topics, timestamps, and analytical insights from the lecture **"{title}"**.

---

## 🎯 Key Takeaways & Core Sections
"""
        for n in notes:
            mins = int(n['timestamp_reference'] // 60)
            secs = int(n['timestamp_reference'] % 60)
            study_guide += f"\n### {n['section_title']} `[{mins:02d}:{secs:02d}]`\n{n['content']}\n"

        study_guide += f"""
---

## 💡 Key Glossary & Terminology
"""
        for c in key_concepts:
            study_guide += f"- **{c['term']}**: {c['definition']}\n"

        study_guide += """
---

## 💡 Self-Revision Checklist
- [ ] Review timestamped section notes alongside media playback.
- [ ] Attempt all self-assessment quiz questions in interactive mode.
- [ ] Export flashcard decks to Anki for spatial repetition revision.
"""

        return {
            "notes": notes,
            "key_concepts": key_concepts,
            "quiz": quiz,
            "study_guide": study_guide
        }
