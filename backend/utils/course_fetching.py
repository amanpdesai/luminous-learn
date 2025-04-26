from utils.token_verification import supabase
from utils.token_verification import verify_token_and_get_user_id

def get_courses_for_user(token: str):
    user_id = verify_token_and_get_user_id(token)
    if not user_id:
        return {"error": "Invalid token or user not authenticated"}, 401

    try:
        result = supabase \
            .table("courses") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("last_accessed", desc=True) \
            .execute()
        return result.data
    except Exception as e:
        return {"error": str(e)}, 500
    
def get_single_course_for_user(token, course_id):
    # Use token to fetch user_id
    user_id = verify_token_and_get_user_id(token)

    if not user_id:
        return {"error": "Invalid token or user not authenticated"}, 401

    # Now fetch the specific course matching both user_id AND course_id
    try:
        # Use token to fetch user_id
        user_id = verify_token_and_get_user_id(token)

        # Fetch the specific course
        result = supabase \
            .table("courses") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("id", course_id) \
            .single() \
            .execute()

        if not result.data:
            return {"error": "Course not found"}, 404  # Explicit if no data

        return result.data
    except Exception as e:
        return {"error": str(e)}, 500