from pydantic import BaseModel
from typing import List, Union, Optional
from schemas.testSchema import MultipleChoiceQuestion, TrueOrFalseQuestion, FillInTheBlankQuestion, ShortAnswerQuestion, Test

class Resource(BaseModel):
    title: str
    url: str
    type: str

class Lesson(BaseModel):
    lesson_number: int
    title: str
    summary: str
    learning_objectives: List[str]
    content: str
    examples: str
    knowledge_check: Union[MultipleChoiceQuestion, TrueOrFalseQuestion, FillInTheBlankQuestion, ShortAnswerQuestion]
    additional_resources: List[Resource]
    duration_in_min: str
    status: Optional[str]

class Unit(BaseModel):
    unit_number: int
    title: str
    description: str
    lessons: List[Lesson]
    unit_test: Test
    completed: Optional[str]

class Course(BaseModel):
    user_id: Optional[str]
    title: str
    description: str
    estimated_duration_hours_per_week: int
    estimated_number_of_weeks: int
    prerequisites: List[str]
    level: str
    depth: str
    units: List[Unit]
    final_exam: Test
    is_draft: Optional[bool]
    created_at: Optional[str]
    last_accessed: Optional[str]
    completed_count: Optional[int]