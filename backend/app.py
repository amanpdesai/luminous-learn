# app.py
from flask import Flask, request, jsonify

app = Flask(__name__)

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