# app.py
from flask import Flask, request, jsonify
from routes.course_gen import course_bp
from flask_cors import CORS

app = Flask(__name__)
app.register_blueprint(course_bp)
CORS(app, origins=["http://localhost:3000", "https://luminous-learn.vercel.app"])

@app.route("/")
def home():
    return jsonify(message="Hello from Flask!")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    # Mock response – this is where your ML model would go
    result = {"input": data, "prediction": "mock_result"}
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)