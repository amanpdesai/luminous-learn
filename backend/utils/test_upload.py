from supabase import create_client
import os
from dotenv import load_dotenv

# 1. Load the syllabus JSON file
# syllabus_path = Path(__file__).parent.parent / 'data' / 'example_syllabus.json'
# with open(syllabus_path, 'r') as f:
#     syllabus_dict = json.load(f)

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Service Role key

supabaseClient = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

supabaseClient

def parse_and_upload_syllabus(syllabus_dict, debug=False):
    course = syllabus_dict['course']

    if debug:
        print(f"Course Title: {course['title']}")

    # 2. Insert Course
    course_data = {
        "title": course['title'],
        "description": course['description'],
        "estimated_duration_hours": course['estimated_duration_hours'],
        "prerequisites": course['prerequisites'],
        "final_exam_description": course['final_assessment']['final_exam_description']
    }

    course_resp = supabaseClient.table('courses').insert(course_data).execute()
    course_id = course_resp.data[0]['id']

    if debug:
        print(f"Inserted course with ID: {course_id}")

    # 3. Insert Units, Lessons, Topics
    for unit in course['units']:
        unit_data = {
            "course_id": course_id,
            "unit_number": unit['Unit_number'],
            "title": unit['title'],
            "unit_description": unit['unit_description'],
            "learning_objectives": unit['learning_objectives'],
            "assessment": unit['assessment']
        }
        unit_resp = supabaseClient.table('units').insert(unit_data).execute()
        unit_id = unit_resp.data[0]['id']

        if debug:
            print(f"  Inserted unit {unit['Unit_number']} with ID: {unit_id}")

        for lesson in unit['lesson_outline']:
            lesson_data = {
                "unit_id": unit_id,
                "lesson_title": lesson['lesson'],
                "duration_minutes": lesson['duration_minutes']
            }
            lesson_resp = supabaseClient.table('lessons').insert(lesson_data).execute()
            lesson_id = lesson_resp.data[0]['id']

            if debug:
                print(f"    Inserted lesson '{lesson['lesson']}' with ID: {lesson_id}")

            for topic in lesson['topics']:
                topic_data = {
                    "lesson_id": lesson_id,
                    "topic_title": topic
                }
                supabaseClient.table('lesson_topics').insert(topic_data).execute()
                if debug:
                    print(f"      Inserted topic '{topic}'")
