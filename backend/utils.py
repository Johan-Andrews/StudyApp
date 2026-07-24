import re
import json
import logging

logger = logging.getLogger("clipnote.utils")

def clean_and_parse_json(text: str) -> dict:
    """
    Cleans raw markdown text from LLMs (stripping ```json and ``` fences)
    and safely parses it into a Python dictionary.
    """
    if not text:
        raise ValueError("Empty response text received from LLM.")

    cleaned = text.strip()
    
    # Strip markdown code blocks
    if "```" in cleaned:
        pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
        match = re.search(pattern, cleaned)
        if match:
            cleaned = match.group(1).strip()
        else:
            cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    # Find first { and last }
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        cleaned = cleaned[first_brace:last_brace + 1]

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as err:
        logger.error(f"JSON decode failed on text: {cleaned[:200]}... Error: {err}")
        # Try fixing common trailing comma issues
        fixed = re.sub(r',\s*([\]}])', r'\1', cleaned)
        return json.loads(fixed)
