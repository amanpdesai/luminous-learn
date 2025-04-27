from flask import Flask
from flask_cors import CORS
from routes.course_update import course_update_bp
from routes.course_gen import course_gen_bp
from routes.course_fetch import course_fetch_bp
from routes.quick_learn import quick_learn_bp
from routes.flashcards import flashcards_bp

"""
This Flask app is now agnostic of uAgents.  Run each agent separately:

    python -m agents.syllabus_agent       # serves on 8010
    python -m agents.quick_learn_agent    # serves on 8011
    python -m agents.course_content_agent # serves on 8012

Then start the Flask API:

    python app.py
"""

app = Flask(__name__)

# Enable CORS for all routes starting with /api
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://luminous-learn.vercel.app"]}})

app.register_blueprint(course_update_bp, url_prefix="/api")
app.register_blueprint(course_gen_bp, url_prefix="/api")
app.register_blueprint(course_fetch_bp, url_prefix="/api")
app.register_blueprint(quick_learn_bp, url_prefix="/api")
app.register_blueprint(flashcards_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)