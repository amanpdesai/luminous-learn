# --- ROUTES FILE ---

from flask import Blueprint, request, jsonify
from utils.token_verification import verify_token_and_get_user_id, supabase
from utils.flashcards import generate_flashcards
from datetime import datetime, timezone
from flask_cors import cross_origin

flashcards_bp = Blueprint('create_flashcards', __name__)

@flashcards_bp.route("/create_flashcard_set", methods=["POST", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def create_flashcards():
    if request.method == "OPTIONS":
        return '', 200

    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Missing authorization header"}), 401

        token = auth_header.replace("Bearer ", "")
        user_id = verify_token_and_get_user_id(token)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        body = request.get_json()
        source_type = body.get('source_type')
        source_id = body.get('source_id')
        card_count = body.get('card_count')
        content_scope = body.get('content_scope', "all")
        learning_goal = body.get('learning_goal')

        print(source_id)

        if not all([source_type, source_id, card_count, learning_goal]):
            return jsonify({"error": "Missing required fields"}), 400

        # Generate flashcards and get metadata
        flashcards_data, course_data, real_source_type = generate_flashcards(
            source_id=source_id,
            source_type=source_type,
            contentInput=content_scope,
            num_cards=card_count,
            learning_goal=learning_goal
        )

        if not course_data:
            return jsonify({"error": "Source content not found"}), 404

        insert_data = {
            "user_id": user_id,
            "title": course_data.get('title', 'Untitled'),
            "topic": course_data.get('topic', 'General'),
            "flashcards": flashcards_data,
            "sessions_completed": 0,
            "last_test_score": 0,
            "still_learning_count": 0,
            "still_studying_count": 0,
            "mastered_count": 0,
            "source_id": source_id,
            "source_type": real_source_type,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_accessed": datetime.now(timezone.utc).isoformat(),
        }

        try:
            result = supabase.table('flashcard_sets').insert(insert_data).execute()
            flashcard_set_id = result.data[0]['id']
        except Exception as e:
            print(f"[ERROR inserting flashcards]: {e}")
            return jsonify({"error": "Failed to insert flashcards", "details": str(e)}), 500

        return jsonify({
            "message": "Flashcard set created successfully",
            "flashcard_set_id": flashcard_set_id
        }), 201

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@flashcards_bp.route("/flashcard_sets", methods=["GET", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["GET", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def get_flashcard_sets():
    if request.method == "OPTIONS":
        return '', 200

    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Missing authorization header"}), 401
        
        token = auth_header.replace("Bearer ", "")
        user_id = verify_token_and_get_user_id(token)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        try:
            response = supabase.table("flashcard_sets").select("*").eq("user_id", user_id).execute()
        except Exception as e:
            print(f"[ERROR fetching flashcard sets]: {e}")
            return jsonify({"error": "Failed to fetch flashcard sets", "details": str(e)}), 500

        return jsonify(response.data), 200

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@flashcards_bp.route("/flashcards/<string:source_type>/<string:flashcard_set_id>", methods=["GET", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["GET", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def get_flashcard_set(source_type, flashcard_set_id):
    if request.method == "OPTIONS":
        return '', 200

    try:
        print("="*50)
        print("[Incoming GET Request] /flashcards")
        print(f"Requested source_type: '{source_type}'")
        print(f"Requested flashcard_set_id: '{flashcard_set_id}'")

        auth_header = request.headers.get('Authorization')
        if not auth_header:
            print("[Error] Missing Authorization header")
            return jsonify({"error": "Missing authorization header"}), 401

        token = auth_header.replace("Bearer ", "")
        user_id = verify_token_and_get_user_id(token)
        print(f"Resolved user_id from token: {user_id}")

        if not user_id:
            print("[Error] Token invalid, could not resolve user")
            return jsonify({"error": "Invalid token"}), 401

        print("[Querying Supabase] Looking for flashcard set with...")
        print(f"  user_id: {user_id}")
        print(f"  flashcard_set_id: {flashcard_set_id}")
        print(f"  source_type: {source_type}")

        result = supabase.table("flashcard_sets") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("id", flashcard_set_id) \
            .eq("source_type", source_type) \
            .limit(1) \
            .execute()

        print(f"[Supabase Query Result]: {result.data}")

        if not result.data:
            print("[Error] Flashcard set not found in DB")
            return jsonify({"error": "Flashcard set not found"}), 404

        flashcard_set = result.data[0]

        flashcards_data = flashcard_set.get('flashcards', [])
        if isinstance(flashcards_data, dict) and 'flashcards' in flashcards_data:
            flashcards_data = flashcards_data['flashcards']

        print(f"[Success] Returning {len(flashcards_data)} flashcards")
        print("="*50)

        return jsonify({ "flashcard_set": flashcard_set }), 200

    except Exception as e:
        print("="*50)
        print(f"[Exception caught in route]: {str(e)}")
        print("="*50)
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@flashcards_bp.route("/flashcards/update_card_progress/<string:source_type>/<string:flashcard_set_id>/<string:card_id>", methods=["POST", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def update_card_progress(source_type, flashcard_set_id, card_id):
    if request.method == "OPTIONS":
        return '', 200

    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Missing authorization header"}), 401
        
        token = auth_header.replace("Bearer ", "")
        user_id = verify_token_and_get_user_id(token)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        body = request.get_json()
        correct_delta = body.get("correct", 0)
        incorrect_delta = body.get("incorrect", 0)

        # Fetch the flashcard set
        result = supabase.table("flashcard_sets") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("id", flashcard_set_id) \
            .eq("source_type", source_type) \
            .limit(1) \
            .execute()

        if not result.data:
            return jsonify({"error": "Flashcard set not found"}), 404

        flashcard_set = result.data[0]
        flashcards_data = flashcard_set.get('flashcards', {}).get('flashcards', [])

        # Find the specific card
        for card in flashcards_data:
            print(f"Checking card id: {card.get('id')} against {card_id}")
            if str(card.get('id')) == str(card_id):
                print(f"[MATCH] Updating card {card.get('id')}")
                card['correct'] = card.get('correct', 0) + correct_delta
                card['incorrect'] = card.get('incorrect', 0) + incorrect_delta
                break
        else:
            print(f"[NO MATCH] Card id {card_id} not found!")
            return jsonify({"error": "Flashcard not found in set"}), 404

        # Save back the updated flashcards list
        supabase.table("flashcard_sets").update({
            "flashcards": {"flashcards": flashcards_data},
            "last_accessed": datetime.now(timezone.utc).isoformat()
        }).eq("id", flashcard_set_id).execute()

        return jsonify({"message": "Card progress updated successfully."}), 200

    except Exception as e:
        print(f"[ERROR updating flashcard progress]: {str(e)}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


@flashcards_bp.route("/flashcards/update_flashcard_set_progress/<string:source_type>/<string:flashcard_set_id>", methods=["POST", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def update_flashcard_set_progress(source_type, flashcard_set_id):
    if request.method == "OPTIONS":
        return '', 200

    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Missing authorization header"}), 401
        
        token = auth_header.replace("Bearer ", "")
        user_id = verify_token_and_get_user_id(token)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        body = request.get_json()
        sessions_completed_delta = body.get("sessions_completed_delta", 0)
        last_test_score = body.get("last_test_score", None)

        # 1. Fetch the current flashcard set including flashcards
        result = supabase.table("flashcard_sets") \
            .select("sessions_completed, flashcards") \
            .eq("id", flashcard_set_id) \
            .eq("user_id", user_id) \
            .eq("source_type", source_type) \
            .single() \
            .execute()

        if not result.data:
            return jsonify({"error": "Flashcard set not found"}), 404

        flashcard_set = result.data
        flashcards_data = flashcard_set.get('flashcards', {}).get('flashcards', [])

        still_learning = 0
        still_studying = 0
        mastered = 0

        # 2. Recompute categories
        for card in flashcards_data:
            correct = card.get('correct', 0)
            incorrect = card.get('incorrect', 0)

            total_attempts = correct + incorrect
            if total_attempts == 0:
                still_learning += 1
                continue

            accuracy = correct / total_attempts

            if accuracy < 0.5:
                still_learning += 1
            elif 0.5 <= accuracy < 0.85:
                still_studying += 1
            else:
                mastered += 1

        # 3. Compute new sessions_completed value
        current_sessions_completed = flashcard_set.get("sessions_completed", 0)
        new_sessions_completed = current_sessions_completed + sessions_completed_delta

        # 4. Update flashcard_set
        update_data = {
            "sessions_completed": new_sessions_completed,
            "still_learning_count": still_learning,
            "still_studying_count": still_studying,
            "mastered_count": mastered,
            "last_accessed": datetime.now(timezone.utc).isoformat()
        }
        
        # Add last_test_score if provided
        if last_test_score is not None:
            update_data["last_test_score"] = last_test_score
            
        supabase.table("flashcard_sets").update(update_data).eq("id", flashcard_set_id).eq("user_id", user_id).eq("source_type", source_type).execute()

        return jsonify({"message": "Flashcard set progress updated successfully."}), 200

    except Exception as e:
        print(f"[ERROR updating flashcard set progress]: {str(e)}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@flashcards_bp.route("/flashcards/update_flashcard_set/<string:source_type>/<string:flashcard_set_id>", methods=["POST", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "https://luminous-learn.vercel.app"], methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def update_flashcard_set_full(source_type, flashcard_set_id):
    if request.method == "OPTIONS":
        return '', 200

    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Missing authorization header"}), 401

        token = auth_header.replace("Bearer ", "")
        user_id = verify_token_and_get_user_id(token)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        body = request.get_json()
        title = body.get("title")
        description = body.get("description")
        flashcards = body.get("flashcards")

        if not title or not isinstance(flashcards, list):
            return jsonify({"error": "Missing title or invalid flashcards format"}), 400

        # 1. Fetch to make sure the flashcard set exists and belongs to this user
        result = supabase.table("flashcard_sets") \
            .select("id") \
            .eq("user_id", user_id) \
            .eq("id", flashcard_set_id) \
            .eq("source_type", source_type) \
            .single() \
            .execute()

        if not result.data:
            return jsonify({"error": "Flashcard set not found"}), 404

        # 2. Update the flashcard set
        update_payload = {
            "title": title,
            "description": description,
            "flashcards": { "flashcards": flashcards },
            "last_accessed": datetime.now(timezone.utc).isoformat(),
        }

        supabase.table("flashcard_sets").update(update_payload) \
            .eq("id", flashcard_set_id) \
            .eq("user_id", user_id) \
            .eq("source_type", source_type) \
            .execute()

        return jsonify({ "message": "Flashcard set updated successfully." }), 200

    except Exception as e:
        print(f"[ERROR updating flashcard set full]: {str(e)}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500
