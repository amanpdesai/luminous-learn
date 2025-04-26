from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
import os
import json
from utils.token_verification import supabase

load_dotenv()

google_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=google_key)

class TrueOrFalseQuestion(BaseModel):
    question: str
    answer: bool

class MultipleChoiceQuestion(BaseModel):
    question: str
    choices: List[str]
    correct_choice: str

class FreeResponseQuestion(BaseModel):
    question: str
    answer: str

class Flashcard(BaseModel):
    front: str
    back: str
    trueorfalseq: TrueOrFalseQuestion
    multiplechoice: MultipleChoiceQuestion
    freeresponse: FreeResponseQuestion

class FlashcardSet(BaseModel):
    flashcards: List[Flashcard]

def get_single_course_or_quicklearn(source_id):
    try:
        result = supabase.table("courses").select("*").eq("id", source_id).single().execute()
        if result.data:
            return result.data, "course"
        result = supabase.table("quick_learns").select("*").eq("id", source_id).single().execute()
        if result.data:
            return result.data, "quick-learn"
        return None, None
    except Exception as e:
        print(f"[ERROR fetching source]: {e}")
        return None, None

def generate_flashcards(source_id, source_type, contentInput, num_cards, learning_goal):
    # Fetch course or quick learn based on source_type
    if source_type == "course":
        result = supabase.table("courses").select("*").eq("id", source_id).single().execute()
    else:
        result = supabase.table("quick_learns").select("*").eq("id", source_id).single().execute()

    if not result.data:
        raise ValueError(f"Source not found for source_id={source_id} and source_type={source_type}")

    course_data = result.data

    # Handle "completed lessons" scope for courses only
    if source_type == "course" and contentInput.lower() == "completed" and course_data.get('completed') is not None:
        course_data['unit_lessons'] = course_data['unit_lessons'][:course_data['completed']]

    # Determine what content to feed into the LLM
    if source_type == "course":
        content = course_data.get('unit_lessons')
        if not content:
            raise ValueError("Course is missing 'unit_lessons' content.")
    else:
        # For quick-learn, fallback options
        content = str(course_data)

    # Create the prompt for the LLM
    prompt = [
        "You are an expert flashcard generator.",
        f"Generate {num_cards} flashcards for the following content: {content}",
        "Focus on covering concepts clearly and understandably.",
        f"If the learning goal is '{learning_goal}', adjust the difficulty and depth accordingly.",
        "Return a clean structured JSON following the provided schema without any empty fields."
    ]

    # Send prompt to Gemini
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config={
            'response_mime_type': 'application/json',
            'response_schema': FlashcardSet,
        },
    )

    # Parse the JSON response
    parsed = json.loads(response.text)

    # Add additional metadata to each flashcard
    for idx, card in enumerate(parsed['flashcards'], start=1):
        card['id'] = idx
        card['correct'] = 0
        card['incorrect'] = 0

    return parsed, course_data, source_type