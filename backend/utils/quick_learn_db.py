from utils.token_verification import supabase, verify_token_and_get_user_id
import datetime
import json
from typing import Dict, Any, Tuple, Union

def make_json_serializable(obj):
    # If obj is a list or tuple, process recursively
    if isinstance(obj, (list, tuple)):
        return [make_json_serializable(item) for item in obj]
    # If obj is a dict, process values recursively
    elif isinstance(obj, dict):
        return {k: make_json_serializable(v) for k, v in obj.items()}
    # If obj has a .dict() or .to_dict() method, use it
    elif hasattr(obj, "dict") and callable(getattr(obj, "dict")):
        return make_json_serializable(obj.dict())
    elif hasattr(obj, "to_dict") and callable(getattr(obj, "to_dict")):
        return make_json_serializable(obj.to_dict())
    # If obj is a custom object, fallback to vars()
    elif hasattr(obj, "__dict__"):
        return make_json_serializable(vars(obj))
    # Otherwise, return as is (should be JSON serializable)
    else:
        return obj

def save_quick_learn(quick_learn_data: dict, token: str) -> Union[Dict[str, Any], Tuple[Dict[str, Any], int]]:
    """Create and save a new quick learn session into Supabase."""
    user_id = verify_token_and_get_user_id(token)
    if not user_id:
        return {"error": "Invalid token or user not authenticated"}, 401

    now = datetime.datetime.utcnow().isoformat()

    # Fill in mandatory fields
    quick_learn_data["user_id"] = user_id
    quick_learn_data["created_at"] = now
    quick_learn_data["last_accessed"] = now
    quick_learn_data["completed"] = quick_learn_data.get("completed", 0)  # Initialize to 0 if missing

    # Ensure everything is JSON serializable (especially additional_resources)
    serializable_data = make_json_serializable(quick_learn_data)

    # Print for debugging
    print(f"[DEBUG] Inserting quick learn: {json.dumps(serializable_data, default=str)}...")

    try:
        result = supabase.table("quick_learns").insert(serializable_data).execute()
        return result.data
    except Exception as e:
        import traceback
        print(f"[ERROR] Supabase insert failed: {e}")
        print(traceback.format_exc())
        return {"error": f"Database error: {str(e)}"}, 500

def get_quick_learns_for_user(token: str) -> Union[Dict[str, Any], Tuple[Dict[str, Any], int]]:
    """Get all quick learns for a user"""
    user_id = verify_token_and_get_user_id(token)
    if not user_id:
        return {"error": "Invalid token or user not authenticated"}, 401

    try:
        result = supabase \
            .table("quick_learns") \
            .select("id, title, description, topic, difficulty, sections, completed, estimated_duration_minutes, created_at, last_accessed") \
            .eq("user_id", user_id) \
            .order("last_accessed", desc=True) \
            .execute()
        return result.data
    except Exception as e:
        print(f"[ERROR] Supabase fetch failed for quick learns: {e}")
        return {"error": str(e)}, 500

def get_quick_learn_by_id(token: str, quick_learn_id: str) -> Union[Dict[str, Any], Tuple[Dict[str, Any], int]]:
    """Fetch a single quick learn session by ID."""
    user_id = verify_token_and_get_user_id(token)
    if not user_id:
        return {"error": "Invalid token or user not authenticated"}, 401

    try:
        # Update last accessed timestamp
        supabase \
            .table("quick_learns") \
            .update({"last_accessed": datetime.datetime.utcnow().isoformat()}) \
            .eq("id", quick_learn_id) \
            .eq("user_id", user_id) \
            .execute()

        # Fetch full session
        result = supabase \
            .table("quick_learns") \
            .select("*") \
            .eq("id", quick_learn_id) \
            .eq("user_id", user_id) \
            .single() \
            .execute()

        if not result.data:
            return {"error": "Quick learn not found"}, 404

        return result.data
    except Exception as e:
        print(f"[ERROR] Fetching quick learn by ID failed: {e}")
        return {"error": str(e)}, 500

def delete_quick_learn(token: str, quick_learn_id: str) -> Union[Dict[str, Any], Tuple[Dict[str, Any], int]]:
    """Delete a quick learn session by ID."""
    user_id = verify_token_and_get_user_id(token)
    if not user_id:
        return {"error": "Invalid token or user not authenticated"}, 401

    try:
        supabase \
            .table("quick_learns") \
            .delete() \
            .eq("id", quick_learn_id) \
            .eq("user_id", user_id) \
            .execute()

        return {"success": True, "message": "Quick learn deleted successfully"}
    except Exception as e:
        print(f"[ERROR] Deleting quick learn failed: {e}")
        return {"error": str(e)}, 500