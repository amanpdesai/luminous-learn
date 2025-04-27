from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from utils.course_updating import save_course_draft, update_course_draft, delete_course

course_update_bp = Blueprint("course", __name__)

@course_update_bp.route("/save_draft", methods=["POST", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def save_draft():
    if request.method == "OPTIONS":
        return '', 200  # preflight success

    data = request.get_json()
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    response = save_course_draft(data, token)
    return jsonify(response)

@course_update_bp.route("/update_draft/<course_id>", methods=["PUT", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["PUT", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def update_draft(course_id):
    if request.method == "OPTIONS":
        return '', 200  # preflight success

    data = request.get_json()
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    response = update_course_draft(course_id, data, token)
    
    if isinstance(response, tuple) and len(response) == 2 and isinstance(response[1], int):
        return jsonify(response[0]), response[1]
    
    return jsonify(response)

@course_update_bp.route("/delete_course/<course_id>", methods=["DELETE", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["DELETE", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def delete_course_endpoint(course_id):
    if request.method == "OPTIONS":
        return '', 200  # preflight success

    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    response = delete_course(course_id, token)
    
    if isinstance(response, tuple) and len(response) == 2 and isinstance(response[1], int):
        return jsonify(response[0]), response[1]
    
    return jsonify(response)