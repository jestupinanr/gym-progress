"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface DaySelectProps {
  day: number;
  personId: string;
}
export default function DaySelect({ day, personId }: DaySelectProps) {
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
  ];
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedDay, setSelectedDay] = useState(days[day]);

  const changeDay = (day: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const dayNumber = days.findIndex((d) => d === day);
    params.set("day", dayNumber.toString());
    router.push(`/routine/${personId}?${params.toString()}`);
    setSelectedDay(day);
  };
  return (
    <div className="px-6 py-3 overflow-x-auto">
      <div className="flex gap-2">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => changeDay(day)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDay === day
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
}
