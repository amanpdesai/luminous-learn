import { MultipleChoiceQuestion, TrueOrFalseQuestion, FillInTheBlankQuestion, ShortAnswerQuestion } from "./courseSchema";

export type MultipleChoiceQuestionFlashcards = MultipleChoiceQuestion & {
  card_number: number;
};

export type TrueOrFalseQuestionFlashcards = TrueOrFalseQuestion & {
  card_number: number;
};

export type FillInTheBlankQuestionFlashcards = FillInTheBlankQuestion & {
  card_number: number;
};

export type ShortAnswerQuestionFlashcards = ShortAnswerQuestion & {
  card_number: number;
};

export type Flashcard = {
  card_number: number;
  front: string;
  back: string;
};

export type FlashcardSet = {
  user_id?: string;
  title: string;
  topic: string;
  flashcards: Flashcard[];
  learns_completed?: number;
  best_test_score?: number;
  description: string;
  difficulty: string;
  created_at?: string;
  last_accessed?: string;
  still_learning?: Flashcard[];
  still_studying?: Flashcard[];
  mastered?: Flashcard[];
  source_id?: string;
  source_type?: string;
};

export type FlashcardLearn = {
  questions: Array<
    MultipleChoiceQuestionFlashcards |
    TrueOrFalseQuestionFlashcards |
    FillInTheBlankQuestionFlashcards |
    ShortAnswerQuestionFlashcards
  >;
};