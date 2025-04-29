from pydantic import BaseModel
from typing import List, Optional

class Lesson(BaseModel):
    title: str
    summary: str
    learning_objectives: List[str]

class Unit(BaseModel):
    unit_number: int
    title: str
    description: str
    lesson_outline: List[Lesson]

class Syllabus(BaseModel):
    title: str
    description: str
    estimated_duration_hours_per_week: int
    estimated_number_of_weeks: int
    level: str
    depth: str
    units: List[Unit]
    is_draft: Optional[bool] = False
    last_accessed: Optional[str] = None
    completed: Optional[int] = 0
    user_id: Optional[str] = None