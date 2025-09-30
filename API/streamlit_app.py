# app.py
import streamlit as st
import pandas as pd
import requests
import json
import re
import logging
from typing import Any, Dict, List
from functions import vanilla_model_to_interpret_report
from langchain_groq import ChatGroq
import dotenv
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Load environment variables
dotenv.load_dotenv(".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

model_name = "openai/gpt-oss-120b"

# Backend endpoints (adjust if backend is on another host/port)
OCR_API_URL = "http://localhost:8001/extract-lab-report"
CHAT_API_URL = "http://localhost:8001/chat"
chat1 = ChatGroq(
    api_key=GROQ_API_KEY,
    model_name=model_name
)

st.set_page_config(page_title="Medical Lab Report Interpreter", layout="wide")
st.title("🧪 Medical Lab Report Interpreter")
st.markdown("Upload a lab report image — the backend will return structured JSON and an interpretation (via your FastAPI/Groq backend).")

# Helpers

def clean_json_string(raw: str) -> str:
    """
    Remove code fences and leading text and extract the first JSON object/array.
    """
    if not isinstance(raw, str):
        return raw
    # Remove common leading phrases like "Here is the extracted..."
    # Extract JSON inside triple backticks if present
    m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw, re.IGNORECASE)
    if m:
        candidate = m.group(1).strip()
    else:
        # Try to extract first {...} or [...]
        m = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", raw)
        candidate = m.group(1).strip() if m else raw.strip()
    return candidate

def try_parse_json(raw: str) -> Any:
    """
    Try to parse a JSON string robustly; returns Python object or raises.
    """
    cleaned = clean_json_string(raw)
    return json.loads(cleaned)

def normalize_to_rows(parsed: Any) -> List[Dict]:
    """
    Convert parsed JSON into list-of-dicts (rows) for DataFrame display.
    Handles shapes like:
      - {"test_name": "...", "entries": [{"field_name": "...", "field_value": "..."}, ...]}
      - {"test_name":"...", "table_data": [{"Hemoglobin":"13.5", "Unit":"g/dL"}, ...]}
      - [{"Hemoglobin":"13.5", "WBC":"11.2"}, ...]  (list of dicts)
      - {"fields": [{"name": "...", "value":"..."}]}
    Returns list of dicts suitable for pd.DataFrame.
    """
    if parsed is None:
        return []
    # If it's already a list of dicts
    if isinstance(parsed, list):
        if all(isinstance(item, dict) for item in parsed):
            return parsed
        # else, convert list items to single-col rows
        return [{"value": str(item)} for item in parsed]

    # If it's a dict, check well-known keys
    if isinstance(parsed, dict):
        # common dynamic-schema: entries list with field_name/field_value
        if "entries" in parsed and isinstance(parsed["entries"], list):
            rows = []
            # if entries are dictionaries of arbitrary columns (table rows)
            if len(parsed["entries"]) > 0 and isinstance(parsed["entries"][0], dict):
                return parsed["entries"]
            # else if entries are field_name/field_value pairs -> convert to single-row or vertical rows
            for e in parsed["entries"]:
                if isinstance(e, dict) and "field_name" in e and "field_value" in e:
                    rows.append({e["field_name"]: e.get("field_value")})
                elif isinstance(e, dict):
                    rows.append(e)
                else:
                    rows.append({"entry": str(e)})
            return rows
        # alternative key: table_data
        if "table_data" in parsed and isinstance(parsed["table_data"], list):
            return parsed["table_data"]
        # alternative: fields
        if "fields" in parsed and isinstance(parsed["fields"], list):
            # fields might be list of dicts with name/value
            rows = []
            for f in parsed["fields"]:
                if isinstance(f, dict):
                    rows.append(f)
                else:
                    rows.append({"field": str(f)})
            return rows
        # if object contains many keys each representing a parameter (flat dict)
        # exclude metadata keys like test_name and report_type
        flat = {k: v for k, v in parsed.items() if k not in ("test_name", "report_type")}
        if all(isinstance(v, (str, int, float, type(None))) for v in flat.values()) and flat:
            # convert flat dict to single-row table
            return [flat]
        # fallback: show whole object as single-row JSON string
        return [{"parsed_json": json.dumps(parsed)}]

    # fallback for anything else
    return [{"value": str(parsed)}]


# UI widgets
col1, col2 = st.columns([2, 1])
with col1:
    uploaded_file = st.file_uploader("Upload Lab Report Image", type=["png", "jpg", "jpeg"], accept_multiple_files=False)
with col2:
    test_name = st.text_input("Test name (optional)", "")
    disease = st.text_input("Suspected disease (optional)", "")

if uploaded_file:
    st.image(uploaded_file, caption="Uploaded report", use_container_width=True)

    if st.button("Send to Backend & Extract"):
        with st.spinner("Sending to backend..."):
            try:
                # send file to OCR endpoint
                files = {"file": (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)}
                resp = requests.post(OCR_API_URL, files=files, timeout=120)
                resp.raise_for_status()
                raw_text = resp.text
                st.subheader("Raw backend response (first 1000 chars)")
                st.code(raw_text[:1000], language="text")

                # parse JSON
                try:
                    parsed = try_parse_json(raw_text)
                except Exception as e:
                    st.warning("Backend returned non-parseable JSON. Attempting to clean and parse.")
                    logging.warning(f"Initial parse failed: {e}; trying to clean the response.")
                    cleaned = clean_json_string(raw_text)
                    parsed = json.loads(cleaned)  # may raise; allow exception to be caught below

                # Display raw parsed JSON nicely
                st.subheader("Parsed JSON")
                st.json(parsed)

                # Normalize into rows and show as table
                rows = normalize_to_rows(parsed)
                if rows:
                    df = pd.DataFrame(rows)
                    st.subheader("Extracted Report (table view)")
                    st.dataframe(df, use_container_width=True)
                else:
                    st.info("No tabular entries were found in the parsed JSON.")

                # Now call /chat endpoint for interpretation (backend does final_output)
                st.subheader("Interpretation")
                payload = {
                    "test_name": test_name or parsed.get("test_name", ""),
                    "report": raw_text,
                    "disease": disease or ""
                }
                chat_resp = requests.post(CHAT_API_URL, json=payload, timeout=60)
                chat_resp.raise_for_status()
                try:
                    chat_json = chat_resp.json()
                    vanilla_llm_response= vanilla_model_to_interpret_report(report=raw_text,type=test_name or parsed.get("test_name", ""), disease=disease or "",chat=chat1)
                except ValueError:
                    # fallback if backend returned plain text
                    chat_text = chat_resp.text
                    chat_json = {"result": chat_text}
                interpretation = chat_json.get("result") or chat_json.get("interpretation") or str(chat_json)
                # display result
                if isinstance(interpretation, (dict, list)):
                    st.json(interpretation)
                else:
                    st.markdown(f"**Interpretation (from backend):**\n\n{interpretation}")
                    st.markdown(f"**Interpretation (from backend-vanilla):**\n\n{vanilla_llm_response}")

            except requests.exceptions.RequestException as e:
                logging.error(f"API request error: {e}")
                st.error(f"API request error: {e}")
            except Exception as e:
                logging.exception("Unexpected error while processing report")
                st.error(f"Unexpected error: {e}")
