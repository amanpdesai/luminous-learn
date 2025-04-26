import json 
from google import genai
import os
import requests 
from dotenv import load_dotenv
import threading 
from pydantic import BaseModel
from typing import List, Optional
import re
import time
load_dotenv()



google_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=google_key)

from pydantic import BaseModel
from typing import List, Optional

# Lesson model
class Lesson(BaseModel):
    lesson: str
    duration_minutes: int
    topics: List[str]

# Optional content details per unit (used in Syllabus only)
class LessonContent(BaseModel):
    readings: List[str]
    examples: List[str]
    exercises: List[str]
    assessments: List[str]
    additional_resources: List[str]

# Base Unit used in Course
class CourseUnit(BaseModel):
    unit_number: int
    title: str
    unit_description: str
    learning_objectives: List[str]
    lesson_outline: List[Lesson]
    assessment: str

# Extended Unit used in Syllabus (inherits from CourseUnit)
class SyllabusUnit(CourseUnit):
    content: Optional[LessonContent] = None

# Final assessment model
class FinalAssessment(BaseModel):
    final_exam_description: str
    final_project_description: Optional[str] = None

# Course model using simpler CourseUnit
class Course(BaseModel):
    title: str
    description: str
    estimated_duration_hours: int
    prerequisites: List[str]
    units: List[CourseUnit]
    final_assessment: FinalAssessment

# Syllabus model using extended SyllabusUnit
class Syllabus(BaseModel):
    course: Course
    detailed_units: List[SyllabusUnit]


def get_syllabus(topic: str, difficulty: str):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            f"Generate a complete syllabus for a {difficulty} {topic} class.",
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


# Function to validate a URL using requests
def validate_url(url: str) -> bool:
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        if response.status_code >= 400 or response.status_code == 405:
            response = requests.get(url, allow_redirects=True, timeout=8)
        return response.status_code < 400
    except requests.RequestException:
        return False

# Function to extract and validate URLs from the 'Additional Resources' section of lesson content
def extract_and_validate_additional_resources(text: str, unit_title: str) -> str:
    updated_text = ""
    inside_resources = False

    for line in text.splitlines():
        if line.strip().lower().startswith("additional resources"):
            inside_resources = True
            updated_text += f"Unit: {unit_title}\n"  # Add the unit title before the resources section
            updated_text += line + "\n"  # Keep the "Additional Resources" header
            continue

        if inside_resources:
            if not line.strip():  # End of the section
                updated_text += line + "\n"
                break

            match = re.search(r'https?://\S+', line)
            if match:
                url = match.group(0)
                if validate_url(url):
                    updated_text += line + "\n"  # Keep valid URLs
            # If the URL is invalid, we don't add it to the `updated_text`
        else:
            updated_text += line + "\n"  # Keep everything outside of "Additional Resources"

    return updated_text

def generate_lesson_content(lesson_title: str, learning_objectives: List[str], lesson_outline: List[Lesson],unit_title: str):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            f"Generate detailed content for the lesson titled '{lesson_title}' with the following learning objectives: {', '.join(learning_objectives)}.",
            "Provide readings to help learn the material, practical examples with explanations, exercises for practice, and assessments for evaluation.",
            "The readings should be clear and comprehensive.",
            "The examples should demonstrate the concepts effectively.",
            "The exercises should be practice-oriented and the assessments should be auto-gradable.",
            "Include a section at the end titled 'Additional Resources:' with 6 helpful and relevant resource links (one per line, starting with a dash).",
            "Make sure the additional resources are not other courses have them be articles, papers, books, or other educational materials.",
            "Return the content as plain text, separated into sections for 'Readings', 'Examples', 'Exercises', and 'Assessments'."
        ],
        config={
            'response_mime_type': 'text/plain', 
        }
    )
    updated_text = extract_and_validate_additional_resources(response.text,unit_title)
    return updated_text


# Threaded lesson content generation
def generate_lesson_threaded(lesson, unit_learning_objectives, index, all_content, unit_title):
    try:
        time.sleep(0.5)
        lesson_content_text = generate_lesson_content(
            lesson_title=lesson.lesson,
            learning_objectives=unit_learning_objectives,
            lesson_outline=[lesson],
            unit_title=unit_title  
        )
        if lesson_content_text:
            all_content[index] = f"\n\n=== {unit_title} ===\n\n{lesson_content_text}"
    except Exception as e:
        all_content[index] = f"Error generating content for lesson {lesson.lesson}: {e}"

# Main course generator
def generate_full_course(syllabus_json_str: str) -> str:
    try:
        syllabus_data = json.loads(syllabus_json_str)
        syllabus_obj = Syllabus(**syllabus_data)
    except Exception as e:
        raise ValueError(f"Invalid JSON input. Error: {e}")

    course = syllabus_obj.course
    total_lessons = sum(len(unit.lesson_outline) for unit in course.units)
    has_final_exam = course.final_assessment and course.final_assessment.final_exam_description

    all_content = [None] * (total_lessons + int(bool(has_final_exam)))
    threads = []
    index = 0

    for unit in course.units:
        unit_title = f"UNIT {unit.unit_number}: {unit.title}"
        for lesson in unit.lesson_outline:
            thread = threading.Thread(
                target=generate_lesson_threaded,
                args=(lesson, unit.learning_objectives, index, all_content, unit_title)
            )
            threads.append(thread)
            thread.start()
            index += 1

    # Final Exam
    if has_final_exam:
        final_exam_description = course.final_assessment.final_exam_description

        def generate_final_exam(index, all_content):
            try:
                time.sleep(0.5)
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[
                        "Generate a final exam for the course based on the following description.",
                        final_exam_description,
                        "Include a variety of question types such as multiple choice, short answer, and coding tasks.",
                        "Make the exam comprehensive and clearly structured.",
                        "Return this as plain text."
                    ],
                    config={"response_mime_type": "text/plain"}
                )
                all_content[index] = "\n\n=== FINAL EXAM ===\n\n" + response.text
            except Exception as e:
                all_content[index] = f"Error generating final exam: {e}"

        thread = threading.Thread(
            target=generate_final_exam,
            args=(index, all_content)
        )
        threads.append(thread)
        thread.start()

    # Wait for all threads to complete
    for thread in threads:
        thread.join()

    return "\n".join(content for content in all_content if content)

def complete_course_gen(topic: str, difficulty: str):
    syllabus_json_str = get_syllabus(topic, difficulty)
    course_content = generate_full_course(syllabus_json_str)
    return course_content,syllabus_json_str

if __name__ == "__main__":
    topic = "Python Programming"
    difficulty = "Beginner"
    course_content, syllabus = complete_course_gen(topic, difficulty)
    print(course_content)