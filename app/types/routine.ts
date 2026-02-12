export type ExerciseStatus = "dominated" | "in_progress" | "no_data";

export interface ExerciseItem {
  id: string;
  name: string;
  weight: number | null;
  reps: string | null;
  status: ExerciseStatus;
}

export type ExerciseGroups = Record<string, ExerciseItem[]>;

export interface RoutineByDayResponse {
  day: number;
  name: string;
  groups: ExerciseGroups;
}
