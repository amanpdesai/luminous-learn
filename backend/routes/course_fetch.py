from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from utils.course_fetching import get_courses_for_user, get_single_course_for_user

course_fetch_bp = Blueprint("course_fetch", __name__)

@course_fetch_bp.route("/get_user_courses", methods=["GET", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["GET", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def get_user_courses():
    if request.method == "OPTIONS":
        return '', 200

    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    response = get_courses_for_user(token)
    return jsonify(response)

@course_fetch_bp.route("/get_user_course", methods=["GET", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["GET", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def get_user_course():
    if request.method == "OPTIONS":
        return '', 200

    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    course_id = request.args.get("course_id")

    if not course_id:
        return jsonify({"error": "Missing course_id parameter"}), 400

    response = get_single_course_for_user(token, course_id)

    if "error" in response:
        return jsonify(response), 404  # <-- return 404 if error fetching course

    return jsonify(response), 200