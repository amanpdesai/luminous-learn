from supabase import create_client
import os
import jwt
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def verify_token_and_get_user_id(token: str):
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})  # Only for extracting sub
        return decoded.get("sub")
    except Exception as e:
        print(f"Token decode error: {e}")
        return None