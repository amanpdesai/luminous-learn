from pydantic import BaseModel
from typing import List, Optional
from schemas.testSchema import Test
from schemas.courseSchema import Lesson

class QuickLearn(BaseModel):
    user_id: Optional[str]
    title: str
    description: str
    level: str
    estimated_duration_minutes: int
    lessons: List[Lesson]
    assessment: Test
    completed_count: Optional[int]
    created_at: Optional[str]
    last_accessed: Optional[str]