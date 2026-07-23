from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from typing import Any

import pandas as pd
from google import genai


# =====================================================================
# 1. PROJECT, API & MODEL CONFIGURATION
# =====================================================================
CLASS_NAME = "10"
SUBJECT = "cs"
BOARD_NAME = "Pakistani BISE (General Board Style)"
MODEL_NAME = "gemini-3.5-flash"

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent if SCRIPT_DIR.name == ".claude" else SCRIPT_DIR

PDF_FILE_NAME = "10th Computer Science New Book.pdf"
PDF_PATH = PROJECT_ROOT / PDF_FILE_NAME

OUTPUT_DIR = PROJECT_ROOT / "generated_csv"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MAX_RETRIES = 3
RETRY_BASE_SECONDS = 20


def load_api_key() -> str:
    """
    API key ko pehle Windows environment variable se read karta hai.
    Agar wahan na ho to project root ki .env file se read karta hai.
    """
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if key:
        return key

    env_path = PROJECT_ROOT / ".env"
    if env_path.exists():
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            name, value = line.split("=", 1)
            if name.strip() == "GEMINI_API_KEY":
                return value.strip().strip('"').strip("'")

    raise RuntimeError(
        "GEMINI_API_KEY set nahi hai.\n"
        "Project root mein .env file banayein aur is line ko add karein:\n"
        "GEMINI_API_KEY=APNI_NEW_API_KEY_YAHAN"
    )


API_KEY = load_api_key()
client = genai.Client(api_key=API_KEY)


# =====================================================================
# 2. CLASS 10 COMPUTER SCIENCE TAXONOMY
# =====================================================================
CHAPTERS = [
    {
        "num": "ch1",
        "name": "Operating Systems: Structure and Services",
        "topics": [
            "1.1 Introduction to OS",
            "1.2 Architecture of OS",
            "1.3 Process Management",
            "1.4 Memory",
            "1.5 Processes vs Threads",
            "1.6 System Calls",
            "1.7 File System Structure",
            "1.8 Types of OS",
        ],
    },
    {
        "num": "ch2",
        "name": "System Recovery and Advanced Maintenance",
        "topics": [
            "2.1 Post-Troubleshooting",
            "2.2 Built-in Diagnostic Tools",
            "2.3 System Recovery Options",
            "2.4 BIOS/UEFI and Boot Process",
            "2.5 Data Recovery Techniques",
            "2.6 Preventive Maintenance",
            "2.7 System Documentation and Logs",
        ],
    },
    {
        "num": "ch3",
        "name": "Introduction to Python Programming",
        "topics": [
            "3.1 Introduction to Python Programming",
            "3.2 Basic Python Syntax and Structure",
            "3.3 Operators and Expressions",
        ],
    },
    {
        "num": "ch4",
        "name": "Control Structures in Python",
        "topics": [
            "4.1 Decision Making",
            "4.2 Looping Constructs",
            "4.3 Libraries in Python",
            "4.4 Lists in Python",
            "4.5 Testing and Debugging in Python",
        ],
    },
    {
        "num": "ch5",
        "name": "Introduction to Data Science",
        "topics": [
            "5.1 Introduction to Data Science",
            "5.2 Overview of the Data Science Life Cycle",
            "5.3 Tools for Visualization",
            "5.4 Databases and Storing Data",
        ],
    },
    {
        "num": "ch6",
        "name": "Introduction Artificial Intelligence (AI), and Machine Learning (ML)",
        "topics": [
            "6.1 AI, ML and Overview",
            "6.2 Machine Learning Types",
            "6.3 Practical Applications of AI/ML",
            "6.4 Supervised and Unsupervised Algorithms",
            "6.5 Evaluating Model Performance",
        ],
    },
    {
        "num": "ch7",
        "name": "Applications of AI",
        "topics": [
            "7.1 Introduction to Artificial Intelligence (AI)",
            "7.2 Data and AI",
        ],
    },
]


# =====================================================================
# 3. OUTPUT COLUMNS
# =====================================================================
MCQ_COLS = [
    "question_hash",
    "active",
    "topic",
    "bloom_level",
    "question",
    "urdu_translation",
    "A",
    "B",
    "C",
    "D",
    "correct_answer",
    "difficulty",
    "marks",
    "weightage",
    "smart_syllabus",
]

SHORT_COLS = [
    "question_hash",
    "active",
    "topic",
    "question_style",
    "question",
    "urdu_translation",
    "difficulty",
    "marks",
    "weightage",
    "smart_syllabus",
]

LONG_COLS = [
    "question_hash",
    "active",
    "topic",
    "question_type",
    "question_style",
    "question",
    "urdu_translation",
    "difficulty",
    "marks",
    "weightage",
    "smart_syllabus",
]

PART_CONFIG = {
    "MCQs": {
        "json_key": "mcqs",
        "columns": MCQ_COLS,
    },
    "Short": {
        "json_key": "short_questions",
        "columns": SHORT_COLS,
    },
    "Long": {
        "json_key": "long_questions",
        "columns": LONG_COLS,
    },
}


# =====================================================================
# 4. FILE HELPERS
# =====================================================================
def csv_path_for(ch_num: str, part_name: str) -> Path:
    filename = (
        f"Class_{CLASS_NAME}_{SUBJECT.upper()}_"
        f"{ch_num.upper()}_{part_name}.csv"
    )
    return OUTPUT_DIR / filename


def missing_parts(ch_num: str) -> list[str]:
    missing: list[str] = []

    for part_name in ("MCQs", "Short", "Long"):
        path = csv_path_for(ch_num, part_name)

        if path.exists() and path.stat().st_size > 10:
            print(f"        ⏭️ Existing file skipped: {path.name}")
        else:
            missing.append(part_name)

    return missing


# =====================================================================
# 5. PDF UPLOAD
# =====================================================================
def wait_until_file_is_ready(uploaded_file: Any) -> Any:
    for _ in range(60):
        current_file = client.files.get(name=uploaded_file.name)
        state = getattr(current_file.state, "name", str(current_file.state)).upper()

        if "ACTIVE" in state:
            return current_file

        if "FAILED" in state:
            raise RuntimeError(
                f"Gemini PDF processing failed: {getattr(current_file, 'error', '')}"
            )

        time.sleep(2)

    raise TimeoutError("PDF processing 120 seconds mein complete nahi hui.")


def upload_pdf() -> Any:
    if not PDF_PATH.exists():
        raise FileNotFoundError(
            f'PDF file nahi mili:\n{PDF_PATH}\n\n'
            f'PDF ko project root mein "{PDF_FILE_NAME}" naam se rakhein.'
        )

    print(">> 10th Class Computer Science PDF upload ki ja rahi hai...")
    uploaded_file = client.files.upload(file=PDF_PATH)
    uploaded_file = wait_until_file_is_ready(uploaded_file)
    print(">> PDF upload aur process ho gayi hai.")
    return uploaded_file


# =====================================================================
# 6. ONE-REQUEST-PER-CHAPTER PROMPT
# =====================================================================
def build_chapter_prompt(
    chapter: dict[str, Any],
    requested_parts: list[str],
) -> str:
    chapter_name = chapter["name"]
    topics = chapter["topics"]
    topic_lines = "\n".join(f"- {topic}" for topic in topics)

    mcq_target = min(50, max(20, len(topics) * 6))
    short_target = min(40, max(15, len(topics) * 4))
    long_target = min(16, max(6, len(topics) * 2))

    need_mcqs = "MCQs" in requested_parts
    need_short = "Short" in requested_parts
    need_long = "Long" in requested_parts

    return f"""
ROLE:
You are a senior Class 10 Computer Science paper setter, textbook reviewer,
and curriculum analyst for {BOARD_NAME}.

CHAPTER TO USE:
"{chapter_name}"

ALLOWED TOPIC LABELS:
{topic_lines}

REQUESTED OUTPUTS:
- MCQs required: {need_mcqs}
- Short Questions required: {need_short}
- Long Questions required: {need_long}

ABSOLUTE SOURCE LOCK:
1. Use ONLY the uploaded textbook PDF.
2. Read only the specified chapter and its exercise.
3. Do not use the web, general knowledge, another textbook, university-level
   material, or remembered technical facts.
4. Every question, option, example, command, value, comparison, numerical,
   process, diagram reference and technical term must be directly traceable
   to the specified chapter.
5. The ALLOWED TOPIC LABELS are navigation labels only. They do not permit
   invention. If a listed item is not present in the chapter, do not use it.
6. Silently verify every generated item against the PDF before returning it.
7. Never create filler questions merely to reach a requested count.
8. Never repeat the same question or concept using cosmetic wording changes.

STRICT PRIORITY ORDER:
1. Include all distinct and useful end-of-chapter exercise questions first.
2. Then use solved examples, numerical examples, activities, code examples,
   tables, diagrams, figures, highlighted facts and learning outcomes.
3. Then use definitions, differences, functions, purposes, uses, steps,
   advantages/disadvantages, applications and important chapter explanations.
4. Exercise-based and core textbook questions should normally receive
   weightage "high".

PAKISTANI BOARD STANDARD:
- Keep every question suitable for a Class 10 Pakistani BISE examination.
- Include common board questions and elite conceptual questions.
- Elite means conceptually strong, not outside the textbook.
- Prefer clear textbook wording over university-level or unnecessarily long wording.
- Never write "according to the chapter", "from the exercise", "as mentioned above"
  or any wording that depends on external context.
- The "topic" field must exactly match one ALLOWED TOPIC LABEL.

URDU STANDARD:
- Use natural Pakistani textbook Urdu, not Roman Urdu.
- Preserve necessary English technical terms where commonly used in the textbook.
- Urdu must accurately translate the English question.
- For formulas, values, code, operators and commands, write the full Urdu
  instruction first, add a colon, and then write technical content in LTR form.

MCQ REQUIREMENTS:
- If MCQs required is True, generate approximately {mcq_target} unique MCQs,
  but return fewer rather than inventing material.
- Prioritize all exercise MCQs and important exercise concepts.
- Mix: about 50% direct/exercise/textbook, 35% conceptual/application,
  and 15% difficult but strictly book-based.
- Exactly four options A, B, C and D, with exactly one correct option.
- Never use True/False, Yes/No, fill-in-the-blank, All of the above,
  or None of the above.
- Every option must be written as "English / Urdu".
- correct_answer must exactly follow:
  "A | <complete A text>", "B | <complete B text>",
  "C | <complete C text>", or "D | <complete D text>".
- bloom_level must be Remember, Understand, Apply, or Analyze.
- difficulty must be Easy, Medium, or Hard.
- marks must be 1.
- weightage must be high or medium.
- If MCQs required is False, return an empty mcqs array.

SHORT-QUESTION REQUIREMENTS:
- If Short Questions required is True, generate approximately {short_target}
  unique 2-mark short questions, but return fewer rather than inventing material.
- Include every distinct exercise short question first.
- Balance common direct questions with important conceptual questions.
- Prefer styles such as:
  Exercise, Definition + Example, Definition + Function, Difference,
  Reason/Why, Function/Purpose, Steps/Process, Advantages/Disadvantages,
  Syntax/Code, Output Tracing, Application, Conceptual.
- Definitions should normally ask for an example, function, use or purpose
  unless the exercise specifically requires a plain definition.
- Difference questions must clearly name both concepts.
- Include "define with example", "differentiate", functions, purposes, uses,
  reasons and brief steps wherever these are supported by the chapter.
- Never provide answers, hints or solutions.
- difficulty must be Easy, Medium, or Hard.
- marks must be 2.
- weightage must be high or medium.
- If Short Questions required is False, return an empty short_questions array.

LONG-QUESTION REQUIREMENTS:
- If Long Questions required is True, generate approximately {long_target}
  unique long/programming/numerical questions, but return fewer rather than
  inventing material.
- Include every distinct exercise long question first.
- Prioritize major explanations, differences, working, steps, diagrams,
  code examples, activities and genuine numericals from the chapter.
- question_type must be "Long" for descriptive/comparison/code/diagram questions.
- question_type may be "Numerical" only when the chapter explicitly supports
  that numerical or calculation type.
- question_style should be concise, such as Explain, Describe, Compare,
  Discuss, Differentiate, Steps/Process, Diagram, Program/Code,
  Output Tracing, Calculate, Find, or Determine.
- Never provide an answer, solution, code solution, hint or marking scheme.
- marks must be 5 for Long and 4 for Numerical.
- weightage must be high or medium.
- If Long Questions required is False, return an empty long_questions array.

RETURN FORMAT:
Return ONLY one valid JSON object. No markdown, no code fence and no explanation.

The JSON object must have exactly these three top-level keys:
{{
  "mcqs": [
    {{
      "topic": "",
      "bloom_level": "",
      "question": "",
      "urdu_translation": "",
      "A": "",
      "B": "",
      "C": "",
      "D": "",
      "correct_answer": "",
      "difficulty": "",
      "marks": 1,
      "weightage": ""
    }}
  ],
  "short_questions": [
    {{
      "topic": "",
      "question_style": "",
      "question": "",
      "urdu_translation": "",
      "difficulty": "",
      "marks": 2,
      "weightage": ""
    }}
  ],
  "long_questions": [
    {{
      "topic": "",
      "question_type": "",
      "question_style": "",
      "question": "",
      "urdu_translation": "",
      "difficulty": "",
      "marks": 5,
      "weightage": ""
    }}
  ]
}}
"""


# =====================================================================
# 7. JSON, VALIDATION & NORMALIZATION
# =====================================================================
def strip_json_fence(raw_text: str) -> str:
    text = raw_text.strip()

    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)

    return text.strip()


def parse_chapter_bundle(raw_text: str) -> dict[str, list[dict[str, Any]]]:
    if not raw_text or not raw_text.strip():
        raise ValueError("Gemini ne empty response diya.")

    parsed = json.loads(strip_json_fence(raw_text))

    if not isinstance(parsed, dict):
        raise ValueError("Gemini response JSON object nahi hai.")

    result: dict[str, list[dict[str, Any]]] = {}

    for key in ("mcqs", "short_questions", "long_questions"):
        value = parsed.get(key, [])
        if not isinstance(value, list):
            value = []
        result[key] = [item for item in value if isinstance(item, dict)]

    return result


def question_key(question: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", question.lower()).strip()


def remove_duplicates(
    items: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    unique: list[dict[str, Any]] = []
    seen: set[str] = set()

    for item in items:
        question = str(item.get("question", "")).strip()
        if not question:
            continue

        key = question_key(question)
        if key in seen:
            continue

        seen.add(key)
        unique.append(item)

    return unique


def normalize_topic(topic: Any, allowed_topics: list[str]) -> str:
    raw = str(topic or "").strip()

    if raw in allowed_topics:
        return raw

    raw_lower = raw.lower()
    for allowed in allowed_topics:
        if raw_lower and (
            raw_lower in allowed.lower() or allowed.lower() in raw_lower
        ):
            return allowed

    raw_number_match = re.match(r"^(\d+(?:\.\d+)?)", raw)
    if raw_number_match:
        raw_number = raw_number_match.group(1)
        for allowed in allowed_topics:
            if allowed.startswith(raw_number):
                return allowed

    return allowed_topics[0]


def normalize_records(
    items: list[dict[str, Any]],
    part_name: str,
    allowed_topics: list[str],
) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []

    for item in remove_duplicates(items):
        record = dict(item)

        record["topic"] = normalize_topic(
            record.get("topic"),
            allowed_topics,
        )

        difficulty = str(record.get("difficulty", "Medium")).strip().title()
        record["difficulty"] = (
            difficulty if difficulty in {"Easy", "Medium", "Hard"} else "Medium"
        )

        weightage = str(record.get("weightage", "high")).strip().lower()
        record["weightage"] = (
            weightage if weightage in {"high", "medium"} else "high"
        )

        record["question"] = str(record.get("question", "")).strip()
        record["urdu_translation"] = str(
            record.get("urdu_translation", "")
        ).strip()

        if not record["question"]:
            continue

        if part_name == "MCQs":
            record["marks"] = 1
            bloom = str(record.get("bloom_level", "Understand")).strip().title()
            record["bloom_level"] = (
                bloom
                if bloom in {"Remember", "Understand", "Apply", "Analyze"}
                else "Understand"
            )

            for option in ("A", "B", "C", "D"):
                record[option] = str(record.get(option, "")).strip()

            record["correct_answer"] = str(
                record.get("correct_answer", "")
            ).strip()

        elif part_name == "Short":
            record["marks"] = 2
            record["question_style"] = str(
                record.get("question_style", "Conceptual")
            ).strip()

        else:
            question_type = str(
                record.get("question_type", "Long")
            ).strip().title()

            record["question_type"] = (
                "Numerical" if question_type == "Numerical" else "Long"
            )
            record["marks"] = (
                4 if record["question_type"] == "Numerical" else 5
            )
            record["question_style"] = str(
                record.get("question_style", "Explain")
            ).strip()

        normalized.append(record)

    return normalized


# =====================================================================
# 8. API ERROR HANDLING
# =====================================================================
def is_quota_error(exc: Exception) -> bool:
    code = getattr(exc, "code", None)
    status = str(getattr(exc, "status", "")).upper()
    text = str(exc).upper()

    return (
        code == 429
        or "429" in text
        or "RESOURCE_EXHAUSTED" in status
        or "RESOURCE_EXHAUSTED" in text
        or "QUOTA EXCEEDED" in text
        or "QUOTA" in text and "LIMIT" in text
    )


def generate_chapter_bundle(
    pdf_file: Any,
    chapter: dict[str, Any],
    requested_parts: list[str],
) -> dict[str, list[dict[str, Any]]]:
    prompt = build_chapter_prompt(chapter, requested_parts)
    ch_num = chapter["num"]

    print(
        f"   ---> Generating {', '.join(requested_parts)} "
        f"for {ch_num.upper()} in ONE API request..."
    )

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=[pdf_file, prompt],
                config={
                    "response_mime_type": "application/json",
                    "temperature": 0.1,
                    "max_output_tokens": 65536,
                },
            )

            bundle = parse_chapter_bundle(response.text)

            bundle["mcqs"] = normalize_records(
                bundle["mcqs"],
                "MCQs",
                chapter["topics"],
            )
            bundle["short_questions"] = normalize_records(
                bundle["short_questions"],
                "Short",
                chapter["topics"],
            )
            bundle["long_questions"] = normalize_records(
                bundle["long_questions"],
                "Long",
                chapter["topics"],
            )

            print(
                "        ✅ Generated: "
                f"{len(bundle['mcqs'])} MCQs, "
                f"{len(bundle['short_questions'])} Short, "
                f"{len(bundle['long_questions'])} Long"
            )
            return bundle

        except Exception as exc:
            if is_quota_error(exc):
                print("\n⛔ GEMINI DAILY QUOTA KHATAM HO GAYI HAI.")
                print("📁 Jo CSV files pehle ban chuki hain woh safe hain.")
                print("⏭️ Quota reset hone ke baad isi script ko dobara run karein.")
                print("🔁 Existing CSV files automatically skip ho jayengi.")
                raise SystemExit(2) from exc

            print(
                f"        ❌ Attempt {attempt}/{MAX_RETRIES} failed: "
                f"{type(exc).__name__}: {exc}"
            )

            if attempt < MAX_RETRIES:
                wait_seconds = RETRY_BASE_SECONDS * attempt
                print(f"        ⏳ Retrying in {wait_seconds} seconds...")
                time.sleep(wait_seconds)

    raise RuntimeError(
        f"{ch_num.upper()} generation {MAX_RETRIES} attempts ke baad fail hui."
    )


# =====================================================================
# 9. CSV SAVING
# =====================================================================
def save_to_csv(
    data: list[dict[str, Any]],
    part_name: str,
    ch_num: str,
) -> None:
    if not data:
        print(f"        ⚠️ {part_name} data empty hai; file save nahi hui.")
        return

    expected_cols = PART_CONFIG[part_name]["columns"]
    df = pd.DataFrame(data)

    if part_name == "Short":
        prefix = "sq_"
    elif part_name == "Long":
        prefix = "lq_"
    else:
        prefix = ""

    df["question_hash"] = [
        (
            f"q_{CLASS_NAME}_{SUBJECT}_{ch_num}_"
            f"{prefix}{str(index + 1).zfill(3)}"
        )
        for index in range(len(df))
    ]
    df["active"] = 1
    df["smart_syllabus"] = ""

    if "weightage" not in df.columns:
        df["weightage"] = "high"

    for column in expected_cols:
        if column not in df.columns:
            df[column] = ""

    df = df.reindex(columns=expected_cols, fill_value="")

    path = csv_path_for(ch_num, part_name)
    df.to_csv(path, index=False, encoding="utf-8-sig")
    print(f"        💾 Saved: {path}")


# =====================================================================
# 10. MAIN EXECUTION
# =====================================================================
def main() -> None:
    pdf_file: Any | None = None

    try:
        chapters_to_process: list[tuple[dict[str, Any], list[str]]] = []

        for chapter in CHAPTERS:
            parts = missing_parts(chapter["num"])
            if parts:
                chapters_to_process.append((chapter, parts))

        if not chapters_to_process:
            print("🎉 Sab CSV files pehle se complete hain.")
            print(f"📁 Folder: {OUTPUT_DIR}")
            return

        print(
            f"\n>> {len(chapters_to_process)} chapter(s) mein missing files hain."
        )
        print(
            ">> Har chapter ke tamam missing outputs ONE API request mein "
            "generate honge."
        )

        pdf_file = upload_pdf()

        for chapter, requested_parts in chapters_to_process:
            ch_num = chapter["num"]
            ch_name = chapter["name"]

            print("\n=========================================================")
            print(f"STARTING CHAPTER: {ch_num.upper()} - {ch_name}")
            print("=========================================================")

            bundle = generate_chapter_bundle(
                pdf_file,
                chapter,
                requested_parts,
            )

            for part_name in requested_parts:
                json_key = PART_CONFIG[part_name]["json_key"]
                save_to_csv(
                    bundle.get(json_key, []),
                    part_name,
                    ch_num,
                )

        print("\n🎉 ALL MISSING FILES PROCESSED SUCCESSFULLY!")
        print(f"📁 CSV files yahan hain: {OUTPUT_DIR}")

    finally:
        if pdf_file is not None:
            try:
                client.files.delete(name=pdf_file.name)
                print("🧹 Temporary uploaded PDF Gemini se delete kar di gayi.")
            except Exception:
                pass

        client.close()


if __name__ == "__main__":
    main()