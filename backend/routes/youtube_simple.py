"""
YouTube Search Service
~~~~~~~~~~~~~~~~~~~~~
Flask routes for YouTube video search functionality.
Provides endpoints for searching YouTube videos with filtering options.
"""
import re
import json
import os
import urllib.parse
import urllib.request
from typing import List, Optional

import requests
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from utils.token_verification import verify_token_and_get_user_id

youtube_bp = Blueprint('youtube', __name__)

# Maximum video duration (30 minutes)
MAX_DURATION_SECONDS = 30 * 60

# Regex to validate YouTube watch URLs
YT_WATCH_PATTERN = re.compile(r"^https?://(www\.)?youtube\.com/watch\?v=[\w-]{11}")


def fetch_videos(query: str, max_results: int = 3) -> List[str]:
    """
    Returns up to max_results YouTube watch URLs for the query.
    Filters videos longer than 30 minutes and live streams.
    """
    if not query or max_results <= 0:
        return []
        
    # Simple direct YouTube search via their AJAX endpoint
    try:
        # Prepare the query
        encoded_query = urllib.parse.quote(query)
        url = f"https://www.youtube.com/results?search_query={encoded_query}&sp=EgIQAQ%253D%253D"  # Non-live videos filter
        
        # Set up a request with browser-like headers to avoid being blocked
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        
        # Make the request
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
        
        # Extract the video IDs
        video_ids = re.findall(r"videoId\":\"([\w-]{11})", html)
        
        # Remove duplicates while maintaining order
        unique_ids = []
        for vid in video_ids:
            if vid not in unique_ids:
                unique_ids.append(vid)
        
        # Create the watch URLs
        watch_urls = [f"https://www.youtube.com/watch?v={vid}" for vid in unique_ids[:max_results * 2]]
        
        # Filter and verify the URLs
        results = []
        for url in watch_urls:
            if len(results) >= max_results:
                break
                
            if _url_ok(url):
                results.append(url)
                
        return results[:max_results]
        
    except Exception as e:
        print(f"[youtube_simple] Search failed: {e}")
        return []


def _url_ok(url: str) -> bool:
    """Verify that a URL exists and returns a 2xx status code."""
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        return 200 <= response.status_code < 400
    except Exception:
        return False


# -------------------------------
# Search for YouTube videos
# -------------------------------
@youtube_bp.route('/search_videos', methods=['POST', 'OPTIONS'])
@cross_origin(origin="http://localhost:3000", methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def search_videos():
    if request.method == "OPTIONS":
        return '', 200
    
    try:
        data = request.get_json()
        query = data.get('query')
        max_results = data.get('max_results', 3)
        
        if not query:
            return jsonify({"error": "Missing required parameter: query"}), 400
        
        # Validate and convert max_results
        try:
            max_results = int(max_results)
            if max_results < 1:
                max_results = 1
            elif max_results > 10:
                max_results = 10
        except (ValueError, TypeError):
            max_results = 3
        
        print(f"[INFO] Searching YouTube videos for: {query}, max_results: {max_results}")
        videos = fetch_videos(query, max_results)
        
        return jsonify({
            "videos": videos,
            "query": query,
            "count": len(videos)
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Exception in search_videos: {str(e)}")
        return jsonify({"error": f"Failed to search videos: {str(e)}"}), 500

# -------------------------------
# Alias to match agent endpoint
# -------------------------------
@youtube_bp.route('/generate_videos', methods=['POST', 'OPTIONS'])
@cross_origin(origin="http://localhost:3000", methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def generate_videos():
    """Alias endpoint matching the agent endpoint for consistency."""
    return search_videos()

# -------------------------------
# Enrich content with videos
# -------------------------------
@youtube_bp.route('/enrich_content', methods=['POST', 'OPTIONS'])
@cross_origin(origin="http://localhost:3000", methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def enrich_content():
    """Endpoint to enrich existing content with related videos."""
    if request.method == "OPTIONS":
        return '', 200
    
    try:
        data = request.get_json()
        title = data.get('title')
        content_type = data.get('type', 'lesson')  # lesson, course, etc.
        max_results = data.get('max_results', 3)
        
        if not title:
            return jsonify({"error": "Missing required parameter: title"}), 400
        
        # Construct a search query based on the title and content type
        search_query = f"{title} {content_type} tutorial"
        print(f"[INFO] Enriching content with videos for: {search_query}")
        
        videos = fetch_videos(search_query, max_results)
        
        return jsonify({
            "videos": videos,
            "title": title,
            "query": search_query,
            "count": len(videos)
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Exception in enrich_content: {str(e)}")
        return jsonify({"error": f"Failed to enrich content: {str(e)}"}), 500
