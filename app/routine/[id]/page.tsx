import { ChevronLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import DaySelect from "./components/DaySelect";
import ExerciseSection from "./components/ExerciseSection";
import { Person } from "@/app/types/person";

const getData = async (id: string): Promise<Person> => {
  const headersList = await headers();
  const proto = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host") || "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/persons/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error("Failed to fetch");

  const data = await res.json();

  return data;
};

interface Props {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Routine(props: Props) {
  const { params, searchParams } = props;
  const { id } = await params;
  const { day } = await searchParams;

  const person = await getData(id);

  return (
    <div className="min-h-screen bg-zinc-950 pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 z-10">
        <div className="px-6 py-4">
          <Link
            href={`/`}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Atras</span>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Rutina de hoy</h1>
              <p className="text-zinc-400 mt-1">{person.name} • Lunes</p>
            </div>

            <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {person.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Day Selector */}
        <DaySelect day={Number(day)} personId={id} />
      </div>

      <ExerciseSection day={Number(day)} personId={id} />
    </div>
  );
}
