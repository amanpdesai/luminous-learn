import os
import json
import uuid
from typing import List, Optional
from dotenv import load_dotenv
from pydantic import BaseModel
from google import genai

# Load environment variables
load_dotenv()
google_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=google_key)

# --- Pydantic Models ---
class Resource(BaseModel):
    unit_title: str
    text: str  # Example: "Official Python Documentation"
    url: str   # Example: "https://docs.python.org/3/"
    
class QLesson(BaseModel):
    title: str
    duration_minutes: int
    topics: List[str]

class QLessonContent(BaseModel):
    readings: str
    examples: str
    additional_resources: List[Resource]

class QGradedQuestion(BaseModel):
    question: str
    answer_choices: List[str]
    answer: str  # this will be the correct answer text

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

# --- Main generation function ---

def generate_quick_learn(topic: str, difficulty: str) -> dict:
    """
    Generate a quick learn course structure on a given topic and difficulty.
    Returns a cleaned dictionary ready to save.
    """
    try:
        print(f"Generating quick learn for topic: {topic}, difficulty: {difficulty}")

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
                'response_mime_type': 'application/json',
                'response_schema': QuickLesson.model_json_schema(),
            },
        )

        content = response.text
        parsed_content = json.loads(content)
        validated_content = QuickLesson.model_validate(parsed_content)

        # --- Transform into frontend-ready schema ---

        # Create sections from lessons + lesson_content
        sections = []
        for idx, (lesson, lesson_detail) in enumerate(zip(validated_content.lessons, validated_content.lesson_content)):
            section_id = str(uuid.uuid4())  # or slugify(lesson.title)
            sections.append({
                "id": section_id,
                "title": lesson.title,
                "readings": lesson_detail.readings,
                "examples": lesson_detail.examples,
                "additional_resources": lesson_detail.additional_resources
            })

        # Transform assessment questions
        questions = []
        for q in validated_content.assessment.questions:
            try:
                correct_index = q.answer_choices.index(q.answer)
            except ValueError:
                correct_index = 0  # fallback if the correct answer is missing in choices
            questions.append({
                "question": q.question,
                "options": q.answer_choices,
                "correctAnswer": correct_index
            })

        # Assemble final cleaned quick learn object
        cleaned_quick_learn = {
            "title": validated_content.title,
            "topic": topic,
            "difficulty": difficulty,
            "description": validated_content.description,
            "estimated_duration_minutes": validated_content.estimated_duration_minutes,
            "sections": sections,
            "assessment": {
                "title": validated_content.assessment.title,
                "instructions": validated_content.assessment.instructions,
                "questions": questions
            },
            "resources": [],  # No generated resources yet (you can later add optional ones)
            "completed": 0  # Initialize completed lessons count to 0
        }

        return cleaned_quick_learn

    except Exception as e:
        print(f"[ERROR] Failed to generate quick learn: {str(e)}")
        raise e