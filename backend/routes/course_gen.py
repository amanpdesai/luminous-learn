from flask import Blueprint, Response, request, jsonify
from flask_cors import cross_origin
from utils.course_generation import generate_course_from_syllabus
from utils.syllabus_generation import get_syllabus, regenerate_learning_objectives
from utils.course_updating import save_course_draft


course_gen_bp = Blueprint('course_gen', __name__)

@course_gen_bp.route('/generate_syllabus', methods=['POST', 'OPTIONS'])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def generate_syllabus():
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    topic = data.get('topic')
    difficulty = data.get('difficulty')
    depth = data.get('depth')

    syllabus_json_str = get_syllabus(topic, difficulty, depth)
    return Response(syllabus_json_str, status=200, mimetype='application/json')

@course_gen_bp.route("/generate_course", methods=["POST", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def generate_course_using_syllabus():
    if request.method == "OPTIONS":
        return '', 200

    try:
        data = request.get_json()
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        print("check for misisng?")
        # Step 1: Check if any learning objectives are missing
        def needs_filling(course_data):
            units = course_data.get("units", [])
            for unit in units:
                for lesson in unit.get("lesson_outline", []):
                    if not lesson.get("learning_objectives"):
                        return True
            return False

        # If missing, call Gemini to regenerate
        if needs_filling(data):
            print("missing stuff!!")
            filled_syllabus = regenerate_learning_objectives(data)
        else:
            print("no missing stuff :D")
            filled_syllabus = data  # Already complete

        # Step 2: Generate full course content
        full_course = generate_course_from_syllabus(filled_syllabus)

        print("bouta save course:")
        print(type(full_course))

        # Step 3: Save course to Supabase
        save_response = save_course_draft(full_course["course"], token)

        return jsonify(save_response), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500