from flask import Flask
from flask_cors import CORS
from routes.course_update import course_update_bp
from routes.course_gen import course_gen_bp
from routes.course_fetch import course_fetch_bp
from routes.quick_learn import quick_learn_bp
from uagents import Bureau
from agents import syllabus_agent, quick_learn_agent, course_content_agent
import threading
import os
# Start the Bureau once (non-blocking)
# Configure Bureau with our three agents
bureau = Bureau(port=8000)
# bureau = Bureau(
#     port=8000,
#     endpoints=[
#         "http://localhost:8010/submit",
#         "http://localhost:8011/submit",
#         "http://localhost:8012/submit",
#     ],
# )
bureau.add(syllabus_agent)
bureau.add(quick_learn_agent)
bureau.add(course_content_agent)

# Start Bureau in background thread so it doesn't block Flask
# threading.Thread(target=bureau.run, daemon=True).start()

app = Flask(__name__)

# Enable CORS for all routes starting with /api
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://luminous-learn.vercel.app"]}})

app.register_blueprint(course_update_bp, url_prefix="/api")
app.register_blueprint(course_gen_bp, url_prefix="/api")
app.register_blueprint(course_fetch_bp, url_prefix="/api")
app.register_blueprint(quick_learn_bp, url_prefix="/api")

if __name__ == "__main__":
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":   # inside the reloader child
        threading.Thread(target=bureau.run, daemon=True).start()
    app.run(host="0.0.0.0", port=8080, debug=True)