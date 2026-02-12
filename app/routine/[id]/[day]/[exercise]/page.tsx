import { ChevronLeft } from "lucide-react";
import { headers } from "next/headers";
import SessionsSection from "./components/SessionsSection";
import { ExerciseDayResponse } from "@/app/types/exercise";
import SessionTrackForm from "./components/SessionTrackForm";
import Link from "next/link";

const getData = async (
  id: string,
  exerciseId: string,
  day: number,
): Promise<ExerciseDayResponse> => {
  const headersList = await headers();
  const proto = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host") || "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(
    `${baseUrl}/api/exercise-detail?personId=${id}&exerciseId=${exerciseId}&day=${day}`,
    {
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) throw new Error("Failed to fetch");

  const data = await res.json();

  return data;
};

interface Props {
  params: { id: string; day: string; exercise: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function WorkoutForm(props: Props) {
  const { params } = props;
  const { id, day, exercise } = await params;

  const data = await getData(id, exercise, Number(day));

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 z-10 px-6 py-4">
        <Link
          href={`/routine/${id}?day=${day}`}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Routine</span>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {data.exercise.name}
            </h1>
            <p className="text-zinc-400 mt-1">
              {data.person.name} • {data.exercise.muscleGroup}
            </p>
          </div>
        </div>
      </div>

      <SessionsSection exercise={data} />
      <SessionTrackForm exercise={data} day={Number(day)} />
    </div>
  );
}
