export type MultipleChoiceQuestion = {
  question: string;
  answer_choices: string[];
  answer: string;
};

export type TrueOrFalseQuestion = {
  question: string;
  answer_choices: [true, false];
  answer: true | false;
};

export type FillInTheBlankQuestion = {
  question: string;
  answer_choices: string[];
  answer: string;
};

export type ShortAnswerQuestion = {
  question: string;
  answer: string;
};

export type Test = {
  title: string;
  instructions: string;
  questions: Array<
    MultipleChoiceQuestion | TrueOrFalseQuestion | FillInTheBlankQuestion | ShortAnswerQuestion
  >;
};

export type Resource = {
  title: string;
  url: string;
  type: string;
};

export type Lesson = {
  lesson_number: number;
  title: string;
  summary: string;
  learning_objectives: string[];
  content: string;
  examples: string;
  knowledge_check: MultipleChoiceQuestion | TrueOrFalseQuestion | FillInTheBlankQuestion | ShortAnswerQuestion;
  additional_resources: Resource[];
  duration_in_min: string;
  status?: string;
};

export type Unit = {
  unit_number: number;
  title: string;
  description: string;
  lessons: Lesson[];
  unit_test: Test;
  completed?: string;
};

export type Course = {
  user_id?: string;
  title: string;
  description: string;
  estimated_duration_hours_per_week: number;
  estimated_number_of_weeks: number;
  prerequisites: string[];
  level: string;
  depth: string;
  units: Unit[];
  final_exam: Test;
  is_draft?: boolean;
  created_at?: string;
  last_accessed?: string;
  completed_count?: number;
};