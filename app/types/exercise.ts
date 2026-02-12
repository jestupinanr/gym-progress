import { Person } from "./person";

export interface ExerciseDayResponse {
  person: Pick<Person, "id" | "name">;
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
  };
  lastSession: {
    weight: number;
    reps: string;
  };
  todayGoal: {
    weight: number;
    reps: string;
  };
  status: string;
}
