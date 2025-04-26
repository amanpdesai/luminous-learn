from flask import Blueprint, request, jsonify
from utils.test_upload import parse_and_upload_syllabus
from utils.course_generation import get_syllabus


course_bp = Blueprint('course_gen', __name__)

@course_bp.route('/api/generate_syllabus', methods=['POST'])
def generate_syllabus():
    data = request.json
    topic = data.get('topic')
    difficulty = data.get('difficulty')
    depth = data.get('depth')
    
    syllabus = get_syllabus(topic, difficulty, depth)

    return jsonify(syllabus)

@course_bp.route('/api/upload_syllabus', methods=['POST'])
def upload_syllabus():
    syllabus = request.json.get('syllabus')
    parse_and_upload_syllabus(syllabus)  # Call your existing DB logic
    return jsonify({"status": "success"})
