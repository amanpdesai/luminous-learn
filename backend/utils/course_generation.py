import datetime
from uuid import UUID
from google import genai
import os
from dotenv import load_dotenv
import threading
import json
import time
import re
import requests
from utils.syllabus_generation import Syllabus

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

class Resource(BaseModel):
    unit_title: str
    text: str  # Example: "Official Python Documentation"
    url: str   # Example: "https://docs.python.org/3/"

class GradedQuestion(BaseModel):
    question: str
    answer_choices: List[str]
    answer: str  # this will be the correct answer text

class Assessment(BaseModel):
    title: str
    instructions: Optional[str] = None
    questions: List[GradedQuestion]

class Lesson(BaseModel):
    lesson: str
    lesson_summary: str
    learning_objectives: List[str]

class LessonComplete(BaseModel):
    unit_number: int
    lesson: str
    lesson_summary: str
    learning_objectives: List[str]
    readings: str
    examples: str
    exercises: str
    assessments: GradedQuestion
    additional_resources: List[Resource]
    duration_in_min: str
    status: str

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
    prerequisites: List[str]  # <--- REQUIRED
    final_exam_description: str  # <--- REQUIRED
    level: str
    depth: str
    units: List[Unit]
    unit_lessons: List[LessonComplete] = []  # <--- has default
    is_draft: bool = False
    last_accessed: str = None
    completed: int = 0
    user_id: str = None

class CourseFull(BaseModel):
    course: Course

'''
3. Functions
'''

def generate_course_from_syllabus(syllabus_json: dict) -> dict:
    print("Generating full course from syllabus...")

    try:
        print(syllabus_json)

        # 🛠 WRAP it if missing course
        if "course" not in syllabus_json:
            syllabus_json = {"course": syllabus_json}

        # Validate and parse
        syllabus_obj = Syllabus(**syllabus_json)
        print("Syllabus parsed successfully.")

    except Exception as e:
        raise ValueError(f"Invalid syllabus input. Error: {e}")

    print("course from syllabus")
    # Get the course fields from Syllabus
    course_from_syllabus = syllabus_obj.course

    print("creating full course")
    # 🛠️ Now MANUALLY assemble the Course object
    
    print("total_lessons")
    total_lessons = total_lessons = sum(len(unit.lesson_outline) for unit in course_from_syllabus.units)
    print("init vars")
    # Now generate lesson contents
    all_content = [None] * total_lessons
    threads = []
    index = 0
    print("thread create and start")
    for unit in course_from_syllabus.units:
        unit_title = f"UNIT {unit.unit_number}: {unit.title}"
        for lesson in unit.lesson_outline:
            thread = threading.Thread(
                target=generate_lesson_threaded,
                args=(lesson, unit_title, index, unit.unit_number, all_content)
            )
            threads.append(thread)
            thread.start()
            index += 1
    print("joining threads....")
    for thread in threads:
        thread.join()

    print("All lessons generated.")

    # Finally wrap it into CourseFull
    print("creeating course full")

    print(all_content)
    try:
        full_course = Course(
            title=course_from_syllabus.title,
            description=course_from_syllabus.description,
            estimated_duration_hours_per_week=course_from_syllabus.estimated_duration_hours_per_week,
            estimated_number_of_weeks=course_from_syllabus.estimated_number_of_weeks,
            prerequisites=[],  # Default empty
            final_exam_description="",  # Default empty
            level=course_from_syllabus.level,
            depth=course_from_syllabus.depth,
            units=[
                Unit(
                    unit_number=unit.unit_number,
                    title=unit.title,
                    unit_description=unit.unit_description,
                    lesson_outline=[
                        Lesson(**lesson.model_dump()) for lesson in unit.lesson_outline
                    ]
                )
                for unit in course_from_syllabus.units
            ],
            unit_lessons=[
                LessonComplete(**lesson)
                for lesson in all_content
                if lesson and "error" not in lesson  # <-- SKIP error lessons
            ],  # will fill later
            is_draft=course_from_syllabus.is_draft,
            last_accessed=course_from_syllabus.last_accessed,
            completed=course_from_syllabus.completed,
            user_id=""
        )
    except Exception as e:
        print(e)
    print("assinging into coursefull block")
    course_full = CourseFull(course=full_course)

    return course_full.model_dump()

def generate_lesson_threaded(lesson, unit_title, index, unit_number, all_content):
    try:
        print(f"Generating content for lesson: {lesson.lesson}")
        # Generate the detailed content for this lesson
        print(lesson.lesson)
        print(lesson.lesson_summary)
        print(lesson.learning_objectives)
        lesson_content = generate_lesson_content(
            lesson.lesson,  # lesson title
            lesson.lesson_summary,  # lesson summary
            lesson.learning_objectives,  # learning objectives
            unit_title  # unit title
        )
        
        # Now, directly update the 2D array at the correct index
        lesson_content["unit_number"] = unit_number
        all_content[index] = lesson_content  # Assign to the specific slot in the 2D array
        
    except Exception as e:
        # Handle errors and assign error message at the specific index
        all_content[index] = {"error": f"Error generating content for lesson {lesson.lesson}: {e}"}

def generate_lesson_content(lesson_title: str, lesson_summary: str, learning_objectives: List[str], unit_title: str) -> dict:
    """
    Generate the lesson content and return a JSON object (dictionary).
    """
    print(f"gemini call: {lesson_title}")
    
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            # Core instruction
            f"Create educational content for the lesson '{lesson_title}' based on this summary: {lesson_summary}. Learning objectives: {', '.join(learning_objectives)}.",
            
            # Section specifications
            "Structure your response with these four sections:",
            "1. Readings: Clear, comprehensive explanations of key concepts",
            "2. Examples: Practical demonstrations of the concepts",
            "3. Exercises: Practice activities for students",
            "4. Assessments: Questions to test understanding (should be auto-gradable) using given JSON schema",
            
            # Resources request
            "Add a final section titled 'Additional Resources' with 6 relevant links to articles, papers, books, or educational materials (not courses).",
            
            # Formatting instructions - clear, valid syntax
            "FORMATTING RULES: Use these precise formats in the content sections:",
            "1. MARKDOWN: Use properly closed tags:",
            "   - Bold: **bold text**",
            "   - Italic: *italic text*",
            "   - Headers: ## Section Title",
            "   - Lists: - Item 1\n  - Item 2 (with proper indentation)",
            "   - Code: ```language\ncode here\n```",
            "2. LATEX: For mathematical notation:",
            "   - Inline math: $x^2 + y^2 = z^2$",
            "   - Display math: $$\\frac{d}{dx}f(x) = \\lim_{h \\to 0}\\frac{f(x+h) - f(x)}{h}$$",
            "   - Always check that LaTeX delimiters ($ and $$) are properly paired",
            "3. QUALITY GUIDELINES:",
            "   - Use syntax highlighting in code blocks by specifying the language",
            "   - Keep formatting clean and consistent",
            "   - For complex formulas, prefer display math ($$...$$) over inline ($...$)",
            "   - Avoid mixing HTML with markdown unless absolutely necessary",
            "   - Ensure all formatting syntax is valid and properly closed"
        ],
        config={'response_mime_type': 'application/json',
                'response_schema': LessonComplete,  # Assuming this schema is correct
               }
    )

    # Handle the response from Gemini API
    try:
        # Extract the content properly based on the response structure
        if hasattr(response, 'candidates') and response.candidates:
            # Get the first candidate
            candidate = response.candidates[0]
            
            # Check if the response has structured content with parts
            if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts') and candidate.content.parts:
                part = candidate.content.parts[0]
                
                # Check if it has function_call and if function_call has args
                if hasattr(part, 'function_call') and part.function_call and hasattr(part.function_call, 'args'):
                    lesson_data = part.function_call.args
                # It might be a text response
                elif hasattr(part, 'text'):
                    text_content = part.text
                    # Try to parse as JSON if it's a string
                    if isinstance(text_content, str):
                        try:
                            lesson_data = json.loads(text_content)
                        except json.JSONDecodeError:
                            # If not valid JSON, create a basic structure
                            lesson_data = {
                                "lesson": lesson_title,
                                "lesson_summary": lesson_summary,
                                "learning_objectives": learning_objectives,
                                "readings": text_content,
                                "examples": "",
                                "exercises": "",
                                "assessments": "",
                                "additional_resources": [],
                                "duration_in_min": "60",
                            }
                    else:
                        lesson_data = text_content
                else:
                    # Handle case where response doesn't have the expected structure
                    return {"error": f"Response for lesson '{lesson_title}' doesn't have expected structure"}
            else:
                return {"error": f"Response for lesson '{lesson_title}' doesn't have content parts"}
        
        # Try to handle response.text if available
        elif hasattr(response, 'text'):
            # For responses that have text property
            if isinstance(response.text, dict):
                # Already a dictionary
                lesson_data = response.text
            elif isinstance(response.text, str):
                # Try to parse as JSON
                try:
                    lesson_data = json.loads(response.text)
                except json.JSONDecodeError:
                    # Create basic structure if not valid JSON
                    lesson_data = {
                        "lesson": lesson_title,
                        "lesson_summary": lesson_summary,
                        "learning_objectives": learning_objectives,
                        "readings": response.text,
                        "examples": "",
                        "exercises": "",
                        "assessments": "",
                        "additional_resources": [],
                        "duration_in_min": "60",
                    }
            else:
                return {"error": f"Unexpected response type for lesson '{lesson_title}': {type(response.text)}"}
        else:
            # Try to use response directly as last resort
            lesson_data = response
    except Exception as e:
        return {"error": f"Error processing response for lesson '{lesson_title}': {str(e)}"}
    
    lesson_data["status"] = "not started"

    # Ensure additional_resources is always a list
    if 'additional_resources' not in lesson_data:
        lesson_data['additional_resources'] = []
    
    # Extract the content and validate additional resources
    lesson_data['additional_resources'] = extract_and_validate_additional_resources(lesson_data.get('additional_resources', []), unit_title)
    return lesson_data

def extract_and_validate_additional_resources(resources, unit_title: str) -> List[Resource]:
    valid_resources = []
    
    # If resources is None or empty, return empty list
    if not resources:
        return valid_resources
        
    # Convert resources to a list if it's not already
    if not isinstance(resources, list):
        # If it's a dict, try to convert to a list of items
        if isinstance(resources, dict):
            resources = [f"{k}: {v}" for k, v in resources.items()]
        else:
            # If it's some other type, wrap it in a list
            resources = [str(resources)]
    
    for resource in resources:
        # Handle case where resource is a dict
        if isinstance(resource, dict):
            # If it already has the right structure, use it directly
            if 'url' in resource and 'text' in resource:
                try:
                    valid_resources.append(Resource(
                        unit_title=unit_title,
                        text=resource['text'],
                        url=resource['url']
                    ))
                    continue
                except Exception:
                    # If there's an error, fall back to string conversion
                    resource = str(resource)
            else:
                # Convert dict to string
                resource = str(resource)
        
        # Now handle string resources
        try:
            # Convert to string if it's not already
            resource_str = str(resource)
            
            # Try to find a URL in the string
            match = re.search(r'https?://\S+', resource_str)
            if match:
                url = match.group(0)
                # Clean up the URL if it ends with a period or other punctuation
                if url[-1] in ['.', ',', ')', ']', '}', ';', ':', '"', "'"]:
                    url = url[:-1]
                    
                valid_resources.append(Resource(
                    unit_title=unit_title,
                    text=resource_str,
                    url=url
                ))
        except Exception as e:
            print(f"Error processing resource: {e}")
            continue
    return valid_resources

def validate_url(url: str) -> bool:
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        if response.status_code >= 400 or response.status_code == 405:
            response = requests.get(url, allow_redirects=True, timeout=8)
        return response.status_code < 400
    except requests.RequestException:
        return False