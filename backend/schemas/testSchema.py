from pydantic import BaseModel, Field
from typing import List, Union, Literal

class MultipleChoiceQuestion(BaseModel):
    question: str
    answer_choices: List[str]
    answer: str

class TrueOrFalseQuestion(BaseModel):
    question: str
    answer_choices: List[Literal[True, False]] = Field(default_factory=lambda: [True, False])
    answer: Literal[True, False]

class FillInTheBlankQuestion(BaseModel):
    question: str
    answer_choices: List[str]
    answer: str

class ShortAnswerQuestion(BaseModel):
    question: str
    answer: str

class Test(BaseModel):
    title: str
    description: str
    questions: List[Union[MultipleChoiceQuestion, TrueOrFalseQuestion, FillInTheBlankQuestion, ShortAnswerQuestion]]