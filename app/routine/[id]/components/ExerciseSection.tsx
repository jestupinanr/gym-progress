import { ExerciseStatus, RoutineByDayResponse } from "@/app/types/routine";
import { headers } from "next/headers";
import Link from "next/link";

const getData = async (
  id: string,
  day: number,
): Promise<RoutineByDayResponse> => {
  const headersList = await headers();
  const proto = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host") || "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(
    `${baseUrl}/api/routines/by-day?personId=${id}&day=${day}`,
    {
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) throw new Error("Failed to fetch");

  const data = await res.json();

  return data;
};

interface ExercisSectionProps {
  personId: string;
  day: number;
}
export default async function ExerciseSection({
  day,
  personId,
}: ExercisSectionProps) {
  const exercise = await getData(personId, day);

  const getStatusBadge = (status: ExerciseStatus) => {
    switch (status) {
      case "dominated":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
            <span>Dominado</span>
            <span>💪</span>
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <span>En progreso</span>
            <span>⏳</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Exercise Groups */}
      <div className="px-6 mt-6">
        {Object.entries(exercise.groups).map(([muscleGroup, exercises]) => (
          <div key={muscleGroup} className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                {muscleGroup}
              </h2>
              <div className="h-1 w-12 bg-blue-600 mt-2 rounded-full"></div>
            </div>

            <div className="space-y-3">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="bg-zinc-900 p-5 rounded-3xl hover:bg-zinc-800"
                >
                  <Link href={`/routine/${personId}/${day}/${exercise.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {exercise.name}
                      </h3>
                      {getStatusBadge(exercise.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-zinc-500">Ultimo peso:</span>
                        <span className="text-blue-400 font-semibold">
                          {exercise.weight} Kg
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-zinc-500">Ultima reps:</span>
                        <span className="text-zinc-300 font-mono">
                          {exercise.reps}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="px-6 mt-8">
        {/* <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Total Exercises</p>
              <p className="text-2xl font-bold text-white">
                {routine.exercises.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-zinc-400 text-sm mb-1">You got this</p>
              <p className="text-2xl">🔥</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
