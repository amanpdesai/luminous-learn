from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from utils.token_verification import verify_token_and_get_user_id
from utils.quick_learn_db import save_quick_learn, get_quick_learns_for_user, get_quick_learn_by_id, delete_quick_learn
import requests

quick_learn_bp = Blueprint('quick_learn', __name__)

# -------------------------------
# Create a new quick learn session
# -------------------------------
@quick_learn_bp.route('/generate_quick_learn', methods=['POST', 'OPTIONS'])
@cross_origin(origin="http://localhost:3000", methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def create_quick_learn():
    if request.method == "OPTIONS":
        return '', 200

    try:
        data = request.get_json()
        topic = data.get('topic')
        difficulty = data.get('difficulty')

        if not topic or not difficulty:
            return jsonify({"error": "Missing required parameters: topic and difficulty"}), 400

        valid_difficulties = ["beginner", "intermediate", "advanced"]
        if difficulty.lower() not in valid_difficulties:
            return jsonify({"error": f"Invalid difficulty level. Must be one of: {', '.join(valid_difficulties)}"}), 400

        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        user_id = verify_token_and_get_user_id(token)
        if not user_id:
            return jsonify({"error": "Invalid or expired token"}), 401

        print(f"[INFO] Generating quick learn for topic: {topic}, difficulty: {difficulty}")
        # Call uAgent REST endpoint instead of direct helper
        agent_response = requests.post(
            "http://localhost:8011/generate_quick_learn",
            json={"topic": topic, "difficulty": difficulty},
            headers={"Content-Type": "application/json"}
        )
        
        if agent_response.status_code != 200:
            print(f"[ERROR] Agent returned error: {agent_response.status_code}, {agent_response.text}")
            return jsonify({"error": f"Agent service error: {agent_response.text}"}), 500
            
        quick_learn_content = agent_response.json()["data"]

        if not isinstance(quick_learn_content, dict):
            print(f"[ERROR] Invalid generated quick learn content: {type(quick_learn_content)}")
            return jsonify({"error": "Failed to generate quick learn content"}), 500

        print(f"[INFO] Saving quick learn to database...")
        db_response = save_quick_learn(quick_learn_content, token)

        if isinstance(db_response, tuple) and isinstance(db_response[1], int):
            return jsonify(db_response[0]), db_response[1]

        return jsonify(db_response), 200

    except Exception as e:
        print(f"[ERROR] Exception in create_quick_learn: {str(e)}")
        return jsonify({"error": f"Failed to generate quick learn: {str(e)}"}), 500

# -------------------------------
# Fetch all quick learns for user
# -------------------------------
@quick_learn_bp.route('/quick_learns', methods=['GET', 'OPTIONS'])
@cross_origin(origin="http://localhost:3000", methods=["GET", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def get_quick_learns():
    if request.method == "OPTIONS":
        return '', 200

    try:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        quick_learns = get_quick_learns_for_user(token)

        if isinstance(quick_learns, tuple) and isinstance(quick_learns[1], int):
            return jsonify(quick_learns[0]), quick_learns[1]

        return jsonify(quick_learns), 200

    except Exception as e:
        print(f"[ERROR] Exception in get_quick_learns: {str(e)}")
        return jsonify({"error": f"Failed to fetch quick learns: {str(e)}"}), 500

# -------------------------------
# Fetch a single quick learn by ID
# -------------------------------
@quick_learn_bp.route('/quick_learn/<quick_learn_id>', methods=['GET', 'OPTIONS'])
@cross_origin(origin="http://localhost:3000", methods=["GET", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def get_quick_learn(quick_learn_id):
    if request.method == "OPTIONS":
        return '', 200

    try:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        quick_learn = get_quick_learn_by_id(token, quick_learn_id)

        if isinstance(quick_learn, tuple) and isinstance(quick_learn[1], int):
            return jsonify(quick_learn[0]), quick_learn[1]

        return jsonify(quick_learn), 200

    except Exception as e:
        print(f"[ERROR] Exception in get_quick_learn: {str(e)}")
        return jsonify({"error": f"Failed to fetch quick learn: {str(e)}"}), 500

# -------------------------------
# Delete a quick learn by ID
# -------------------------------
@quick_learn_bp.route('/quick_learn/<quick_learn_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin(origin="http://localhost:3000", methods=["DELETE", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def delete_quick_learn_route(quick_learn_id):
    if request.method == "OPTIONS":
        return '', 200

    try:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        result = delete_quick_learn(token, quick_learn_id)

        if isinstance(result, tuple) and isinstance(result[1], int):
            return jsonify(result[0]), result[1]

        return jsonify(result), 200

    except Exception as e:
        print(f"[ERROR] Exception in delete_quick_learn_route: {str(e)}")
        return jsonify({"error": f"Failed to delete quick learn: {str(e)}"}), 500