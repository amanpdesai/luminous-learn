'''
Python file version of the course generation Jupyter notebook so I can import methods in the api
'''
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
    duration_minutes: int
    topics: List[str]


class Unit(BaseModel):
    Unit_number: int
    title: str
    unit_description: str
    learning_objectives: List[str]
    lesson_outline: List[Lesson]
    assessment: str


class FinalAssessment(BaseModel):
    final_exam_description: str


class Course(BaseModel):
    title: str
    description: str
    estimated_duration_hours: int
    prerequisites: List[str]
    units: List[Unit]
    final_assessment: FinalAssessment


class Syllabus(BaseModel):
    course: Course

class LessonTopic(BaseModel):
    title: str


'''
3. Functions
'''

def get_syllabus(topic: str, difficulty: str, depth: str) -> str:
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            f"Generate a complete syllabus for a {difficulty} class of depth {depth}.",
            f"The subject is: {topic}",
            "Include lesson titles, and for each, provide Lesson Description,Learning Objectives, Lesson Outline, and Assessment.",
            "End with a Final Exam section detailing topics that will be tested.",
            "Return the output as structured JSON only.",
        ],
        config={
            'response_mime_type': 'application/json',
            'response_schema': Syllabus,
        },
    )
    return response.text


