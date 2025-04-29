from pydantic import BaseModel
from typing import List, Union, Optional
from schemas.testSchema import MultipleChoiceQuestion, TrueOrFalseQuestion, FillInTheBlankQuestion, ShortAnswerQuestion

class MultipleChoiceQuestionFlashcards(MultipleChoiceQuestion):
    card_number: int

class TrueOrFalseQuestionFlashcards(TrueOrFalseQuestion):
    card_number: int

class FillInTheBlankQuestionFlashcards(FillInTheBlankQuestion):
    card_number: int

class ShortAnswerQuestionFlashcards(ShortAnswerQuestion):
    card_number: int

class Flashcard(BaseModel):
    card_number: int
    front: str
    back: str

class FlashcardSet(BaseModel):
    user_id: Optional[str]
    title: str
    topic: str
    flashcards: List[Flashcard]
    learns_completed: Optional[int]
    best_test_score: Optional[int]
    description: str
    difficulty: str
    created_at: Optional[str]
    last_accessed: Optional[str]
    still_learning: Optional[List[Flashcard]]
    still_studying: Optional[List[Flashcard]]
    mastered: Optional[List[Flashcard]]
    source_id: Optional[str]
    source_type: Optional[str]

class FlashcardLearn(BaseModel):
    questions: List[Union[MultipleChoiceQuestionFlashcards, TrueOrFalseQuestionFlashcards, FillInTheBlankQuestionFlashcards, ShortAnswerQuestionFlashcards]]