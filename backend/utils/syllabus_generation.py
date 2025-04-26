import json
from google import genai
import os
from dotenv import load_dotenv

'''
1. Setup
'''
load_dotenv()

google_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=google_key)

'''
2. Pydantic schema for the syllabus generation
'''
from pydantic import BaseModel
from typing import List, Optional

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

def get_syllabus(topic: str, difficulty: str, depth: str) -> str:
    print(f"Generating syllabus for topic: {topic}, difficulty: {difficulty}, depth: {depth}")
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[f"Generate a detailed syllabus in JSON format for a course on '{topic}'.",
                  f"The course should be at a '{difficulty}' difficulty level with a '{depth}' depth.",
                  "The response must include:",
                  "- Course title and description",
                  "- Estimated number of weeks and hours per week to complete the course",
                  "- A list of units, each with a title, description, and an ordered list of lessons",
                  "- Each lesson must include:",
                  "  - Lesson title",
                  "  - Lesson summary",
                  "  - Learning objectives (a list of 3–5 goals students should achieve after the lesson)"],
        config={'response_mime_type': 'application/json',
                'response_schema': Syllabus,
               }
    )
    return response.text

def regenerate_learning_objectives(course_json: dict) -> dict:
    print("Regenerating learning objectives for course...")
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[f"You're given a partial course syllabus in JSON format. "
                  f"Some lessons may be missing their 'learning_objectives' field or have it as an empty list. "
                  f"Your task is to fill in those fields while preserving all existing data.\n\n"
                  f"Here is the current course syllabus:\n{json.dumps(course_json)}"],
        config={'response_mime_type': 'application/json',
                'response_schema': Syllabus,
                }
    )
    return response.text