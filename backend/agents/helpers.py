import json
import os
import uuid
from typing import List, Optional, Dict, Any

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel
from utils.course_generation import generate_course_from_syllabus

# ---------------------------------------------------------------------------
# 0. Gemini client is initialised ONCE here and reused by all helper methods
# ---------------------------------------------------------------------------
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY environment variable not set")

client = genai.Client(api_key=GOOGLE_API_KEY)

# ---------------------------------------------------------------------------
# 1. Schemas  – kept local to avoid cross-package import cycles
# ---------------------------------------------------------------------------

# ----- Syllabus schemas -----
class Lesson(BaseModel):
    lesson: str
    lesson_summary: str
    learning_objectives: List[str]


class Unit(BaseModel):
    unit_number: int
    title: str
    unit_description: str
    lesson_outline: List[Lesson]


class Course(BaseModel):
    title: str
    description: str
    estimated_duration_hours_per_week: int
    estimated_number_of_weeks: int
    level: str
    depth: str
    units: List[Unit]
    is_draft: Optional[bool] = False
    last_accessed: Optional[str] = None
    completed: Optional[int] = 0
    user_id: Optional[str] = None


class Syllabus(BaseModel):
    course: Course


# ----- Quick-learn schemas -----
class QLesson(BaseModel):
    title: str
    duration_minutes: int
    topics: List[str]


class QLessonContent(BaseModel):
    readings: List[str]
    examples: List[str]
    QAssessments: List[str]
    additional_resources: List[str]


class QGradedQuestion(BaseModel):
    question: str
    answer_choices: List[str]
    answer: str  # correct answer text


class QAssessment(BaseModel):
    title: str
    instructions: Optional[str] = None
    questions: List[QGradedQuestion]


class QuickLesson(BaseModel):
    title: str
    description: str
    estimated_duration_minutes: int
    lessons: List[QLesson]
    lesson_content: List[QLessonContent]
    assessment: QAssessment


# ---------------------------------------------------------------------------
# 2. Pure Gemini helper functions – synchronous, thread-safe
# ---------------------------------------------------------------------------

def generate_syllabus(topic: str, difficulty: str, depth: str = "comprehensive") -> str:
    """Generate a syllabus JSON string for a given *topic* using Gemini."""
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            f"Generate a detailed syllabus in JSON format for a course on '{topic}'.",
            f"The course should be at a '{difficulty}' difficulty level with a '{depth}' depth.",
            "The response must include:",
            "- Course title and description",
            "- Estimated number of weeks and hours per week to complete the course",
            "- A list of units, each with a title, description, and an ordered list of lessons",
            "- Each lesson must include:",
            "  - Lesson title",
            "  - Lesson summary",
            "  - Learning objectives (a list of 3–5 goals students should achieve after the lesson)",
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": Syllabus,
        },
    )
    return response.text


def generate_regen_lo(course_json: Dict[str, Any]) -> str:
    """Fill in missing learning objectives inside *course_json* using Gemini."""
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            "You're given a partial course syllabus in JSON format. "
            "Some lessons may be missing their 'learning_objectives' field or have it as an empty list. "
            "Your task is to fill in those fields while preserving all existing data.\n\n"
            f"Here is the current course syllabus:\n{json.dumps(course_json)}"
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": Syllabus,
        },
    )
    return response.text


def generate_quick_learn(topic: str, difficulty: str) -> Dict[str, Any]:
    """Proxy to Gemini to build a *QuickLearn* course, then post-process to frontend-ready shape."""
    # 1️⃣  Ask Gemini for the raw quick-learn structure (validated with Pydantic schema)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            f"Generate a quick learning course for {topic} at {difficulty} level.",
            "If difficulty is beginner generate 3 lessons, if intermediate generate 5 lessons, and if advanced generate 7 lessons.",
            "The beginner course should be about 1 hour long, intermediate about 2 hours, and advanced about 4 hours.",
            "Each lesson should have a title, estimated duration, and topics covered.",
            "Provide detailed original 'readings' for each lesson — do NOT quote from other sources.",
            "Include practical examples, exercises, and additional resources with links (no other courses).",
            "Also provide a course-wide assessment: multiple choice, true/false, and fill-in-the-blank questions.",
            "Return the output as JSON according to the given schema.",
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": QuickLesson.model_json_schema(),
        },
    )

    parsed = QuickLesson.model_validate(json.loads(response.text))

    # 2️⃣  Transform Gemini structure ➜ frontend-ready structure
    sections = []
    for lesson, detail in zip(parsed.lessons, parsed.lesson_content):
        section_id = str(uuid.uuid4())
        blocks: List[str] = []
        if detail.readings:
            blocks.append("## Readings\n" + "\n\n".join(detail.readings))
        if detail.examples:
            blocks.append("## Examples\n" + "\n\n".join(detail.examples))
        if detail.QAssessments:
            blocks.append("## Practice Questions\n" + "\n\n".join(detail.QAssessments))
        if detail.additional_resources:
            blocks.append("## Additional Resources\n" + "\n\n".join(detail.additional_resources))
        combined_content = "\n\n".join(blocks)
        sections.append({"id": section_id, "title": lesson.title, "content": combined_content})

    questions = []
    for q in parsed.assessment.questions:
        try:
            correct_idx = q.answer_choices.index(q.answer)
        except ValueError:
            correct_idx = 0
        questions.append({
            "question": q.question,
            "options": q.answer_choices,
            "correctAnswer": correct_idx,
        })

    return {
        "title": parsed.title,
        "topic": topic,
        "difficulty": difficulty,
        "description": parsed.description,
        "estimated_duration_minutes": parsed.estimated_duration_minutes,
        "sections": sections,
        "assessment": {
            "title": parsed.assessment.title,
            "instructions": parsed.assessment.instructions,
            "questions": questions,
        },
        "resources": [],
        "completed": 0,
    }


# ---------------------------------------------------------------------------
# 3. Minimal *full course* generator (placeholder)
# ---------------------------------------------------------------------------

def generate_full_course(syllabus_json: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a *CourseFull*-shaped dict with full lesson content.

    This is a thin wrapper around
    `utils.course_generation.generate_course_from_syllabus`, providing
    additional validation and graceful error handling so that the agent
    always returns a serialisable dictionary ready for persistence.
    """
    # Accept both str and dict inputs for backward-compatibility
    if isinstance(syllabus_json, str):
        try:
            syllabus_json = json.loads(syllabus_json)
        except json.JSONDecodeError as exc:
            raise ValueError("Invalid JSON string passed into generate_full_course") from exc

    try:
        full_course_dict = generate_course_from_syllabus(syllabus_json)
    except Exception as exc:
        # Surface the error to the caller in a predictable structure so that
        # downstream code (and the frontend) can react accordingly.
        return {"error": f"Full course generation failed: {exc}"}

    return full_course_dict
