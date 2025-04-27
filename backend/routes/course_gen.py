from flask import Blueprint, Response, request, jsonify
from flask_cors import cross_origin
from utils.course_updating import save_course_draft
import requests
import json


course_gen_bp = Blueprint('course_gen', __name__)

@course_gen_bp.route('/generate_syllabus', methods=['POST', 'OPTIONS'])
@cross_origin(origin="http://localhost:3000", methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def generate_syllabus():
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    topic = data.get('topic')
    difficulty = data.get('difficulty')
    depth = data.get('depth', 'comprehensive')

    # Call syllabus agent instead of direct function
    agent_response = requests.post(
        "http://localhost:8010/generate_syllabus",
        json={"topic": topic, "difficulty": difficulty, "depth": depth},
        headers={"Content-Type": "application/json"}
    )
    
    if agent_response.status_code != 200:
        return jsonify({"error": f"Agent service error: {agent_response.text}"}), 500

    # Robustly extract the json_text field, even if agent's response body isn't valid JSON
    try:
        syllabus_payload = agent_response.json()
    except ValueError:
        try:
            # Fallback: some servers may not send the correct Content-Type header
            syllabus_payload = json.loads(agent_response.text or "{}")
        except json.JSONDecodeError as e:
            print(f"[ERROR] Failed to parse agent syllabus response as JSON: {e}\nBody: {agent_response.text[:200]}")
            return jsonify({"error": "Invalid syllabus format returned by agent"}), 500

    syllabus_json_str = syllabus_payload.get("json_text")
    if not syllabus_json_str:
        # Fallback: maybe the agent already returned the syllabus dict directly
        syllabus_json_str = json.dumps(syllabus_payload)

    return Response(syllabus_json_str, status=200, mimetype='application/json')

@course_gen_bp.route("/generate_course", methods=["POST", "OPTIONS"])
@cross_origin(origin="http://localhost:3000", methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
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

        # If missing, call syllabus agent to regenerate
        if needs_filling(data):
            print("missing stuff!!")
            # This would ideally use a more specific endpoint for regeneration
            # For now we'll just use the same endpoint but with course data
            syllabus_agent_response = requests.post(
                "http://localhost:8010/generate_syllabus",
                json={"topic": str(data.get("title")), "difficulty": str(data.get("level")), "depth": str(data.get("depth", "comprehensive"))},
                headers={"Content-Type": "application/json"}
            )
            
            if syllabus_agent_response.status_code != 200:
                return jsonify({"error": f"Syllabus agent error: {syllabus_agent_response.text}"}), 500
                
            filled_syllabus = json.loads(syllabus_agent_response.json()["json_text"])
        else:
            print("no missing stuff :D")
            filled_syllabus = data  # Already complete

        # Step 2: Generate full course content via agent
        course_agent_response = requests.post(
            "http://localhost:8012/generate_full_course",
            json={"syllabus_json": filled_syllabus},
            headers={"Content-Type": "application/json"}
        )
        print(course_agent_response.text)
        
        if course_agent_response.status_code != 200:
            return jsonify({"error": f"Course content agent error: {course_agent_response.text}"}), 500
            
        full_course = course_agent_response.json()["course_json"]

        print("bouta save course:")
        print(type(full_course))

        # Step 3: Save course to Supabase
        save_response = save_course_draft(full_course["course"], token)

        # If save_course_draft returns (dict, status_code) handle properly
        if isinstance(save_response, tuple) and len(save_response) == 2 and isinstance(save_response[1], int):
            return jsonify(save_response[0]), save_response[1]

        return jsonify(save_response), 200

    except Exception as e:
        # Log full stack trace for debugging
        import traceback, sys
        traceback.print_exc(file=sys.stderr)
        return jsonify({"status": "error", "message": str(e)}), 500