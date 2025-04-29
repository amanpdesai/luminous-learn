export type LessonOutline = {
  title: string;
  summary: string;
  learning_objectives: string[];
};

export type UnitOutline = {
  unit_number: number;
  title: string;
  description: string;
  lesson_outline: LessonOutline[];
};

export type Syllabus = {
  title: string;
  description: string;
  estimated_duration_hours_per_week: number;
  estimated_number_of_weeks: number;
  level: string;
  depth: string;
  units: UnitOutline[];
  is_draft?: boolean;
  last_accessed?: string;
  completed?: number;
  user_id?: string;
};