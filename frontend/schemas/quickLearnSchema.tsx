import { Lesson, Test } from './courseSchema'; // Assuming shared Lesson and Test types

export type QuickLearn = {
  user_id?: string;
  title: string;
  description: string;
  level: string;
  estimated_duration_minutes: number;
  lessons: Lesson[];
  assessment: Test;
  completed_count?: number;
  created_at?: string;
  last_accessed?: string;
};