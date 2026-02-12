// import { Person } from "@prisma/client";
import { headers } from "next/headers";
import Link from "next/link";
import { Person } from "../types/person";

const getData = async (): Promise<Person[]> => {
  const headersList = await headers();
  const proto = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host") || "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/persons`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error("Failed to fetch");

  const data = await res.json();

  return data;
};

export default async function Home() {
  const persons = await getData();
  const today = new Date().getDay();

  return (
    <div className="min-h-screen">
      <div className="min-h-screen bg-zinc-950 px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">A entrenar! 💪</h1>
          <p className="text-zinc-400 text-lg">Quien entreno hoy?</p>
        </div>

        {/* Person Cards */}
        <div className="flex flex-col gap-4 max-w-md">
          {persons.map((person) => (
            <Link
              key={person.id}
              href={`/routine/${person.id}?day=${today}`}
              className="group w-full bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 rounded-2xl p-6 transition-all duration-200 border border-zinc-800 hover:border-zinc-700"
            >
              <div className="flex items-center gap-5">
                {/* Avatar with Initials */}
                <div className="shrink-0 w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Name */}
                <div className="flex-1 text-left">
                  <h2 className="text-2xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {person.name}
                  </h2>
                </div>

                {/* Arrow Icon */}
                <div className="shrink-0">
                  <svg
                    className="w-6 h-6 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-zinc-600 text-sm">
            Seleccione la persona para ver su rutina
          </p>
        </div>
      </div>
    </div>
  );
}
