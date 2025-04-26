from utils.token_verification import supabase
from utils.token_verification import verify_token_and_get_user_id

import json
from typing import Dict, Any, Tuple, Union

def save_course_draft(data: dict, token) -> Union[Dict[str, Any], Tuple[Dict[str, Any], int]]:
    """Create a new course draft in the database"""
    user_id = verify_token_and_get_user_id(token)
    if not user_id:
        return {"error": "Invalid token or user not authenticated"}, 401
    
    course_data = {
        "title": data.get("title"),
        "description": data.get("description"),
        "estimated_duration_hours_per_week": data.get("estimated_duration_hours_per_week"),
        "estimated_number_of_weeks": data.get("estimated_number_of_weeks"),
        "prerequisites": data.get("prerequisites", []),
        "final_exam_description": data.get("final_exam_description", ""),
        "user_id": user_id,
        "level": data.get("level"),
        "depth": data.get("depth"),
        "units": data.get("units", []),
        "unit_lessons": data.get("unit_lessons", []),
        "is_draft": data.get("is_draft", True),
        "last_accessed": data.get("last_accessed") or None,
        "completed": data.get("completed", 0),
    }

    try:
        result = (supabase.table("courses").insert(course_data).execute())
        return result.data
    except Exception as e:
        print(f"[ERROR] Supabase insert failed: {e}")
        return {"error": str(e)}, 500


def update_course_draft(course_id: str, data: dict, token) -> Union[Dict[str, Any], Tuple[Dict[str, Any], int]]:
    """Update an existing course draft in the database"""
    user_id = verify_token_and_get_user_id(token)
    if not user_id:
        return {"error": "Invalid token or user not authenticated"}, 401
    
    # First verify that the course belongs to this user
    try:
        course = supabase.table("courses").select("*").eq("id", course_id).eq("user_id", user_id).execute()
        if not course.data or len(course.data) == 0:
            return {"error": "Course not found or you don't have permission to edit it"}, 404
    except Exception as e:
        print(f"[ERROR] Supabase fetch failed: {e}")
        return {"error": str(e)}, 500
    
    # Prepare update data
    course_data = {
        "title": data.get("title"),
        "description": data.get("description"),
        "units": data.get("units", []),
        "is_draft": data.get("is_draft", True),
        "last_accessed": data.get("last_accessed") or None,
    }
    
    # Optional fields - only include if provided
    if "estimated_duration_hours_per_week" in data:
        course_data["estimated_duration_hours_per_week"] = data["estimated_duration_hours_per_week"]
    if "estimated_number_of_weeks" in data:
        course_data["estimated_number_of_weeks"] = data["estimated_number_of_weeks"]
    if "prerequisites" in data:
        course_data["prerequisites"] = data["prerequisites"]
    if "final_exam_description" in data:
        course_data["final_exam_description"] = data["final_exam_description"]
    if "level" in data:
        course_data["level"] = data["level"]
    if "depth" in data:
        course_data["depth"] = data["depth"]
    if "unit_lessons" in data:
        course_data["unit_lessons"] = data["unit_lessons"]
    if "completed" in data:
        course_data["completed"] = data["completed"]

    try:
        result = supabase.table("courses").update(course_data).eq("id", course_id).execute()
        return result.data
    except Exception as e:
        print(f"[ERROR] Supabase update failed: {e}")
        return {"error": str(e)}, 500