import requests

url = "http://localhost:5000/predict"
data = {"feature": 42}

response = requests.post(url, json=data)
print(response.json())