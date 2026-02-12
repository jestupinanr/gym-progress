import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// =============================
// Types
// =============================
interface SetInput {
  setNumber: number;
  weight: number;
  reps: number;
}

interface Body {
  personId: string;
  exerciseId: string;
  day: number; // 1–7 (lun–dom)
  sets: SetInput[];
}

// =============================
// Helpers
// =============================

// 🔥 Convierte day(1–7) → fecha real de ESTA semana
function getDateFromWeekDay(selectedDay: number) {
  const today = new Date();

  const currentDay = today.getDay(); // 0=dom
  const normalizedToday = currentDay === 0 ? 7 : currentDay;

  const diff = selectedDay - normalizedToday;

  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

// 🔥 semana relativa desde primer registro
function calculateRelativeWeek(firstDate: Date, currentDate: Date) {
  const diffMs = currentDate.getTime() - firstDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.floor(diffDays / 7) + 1;
}

// =============================
// POST /api/workout-sets
// =============================
export async function POST(req: Request) {
  try {
    const body: Body = await req.json();

    const { personId, exerciseId, day, sets } = body;

    // =============================
    // Validaciones
    // =============================
    if (!personId || !exerciseId || !day || !sets?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // =============================
    // Fecha basada en día seleccionado
    // =============================
    const workoutDate = getDateFromWeekDay(day);

    // =============================
    // Obtener primera semana del usuario
    // =============================
    const firstWorkout = await prisma.workoutSet.findFirst({
      where: { personId },
      orderBy: { date: "asc" },
      select: { date: true, week: true },
    });

    let week = 1;

    if (firstWorkout) {
      week = calculateRelativeWeek(firstWorkout.date, workoutDate);
    }

    // =============================
    // Crear sets
    // =============================
    await prisma.workoutSet.createMany({
      data: sets.map((s) => ({
        personId,
        exerciseId,
        date: workoutDate,
        week,
        weight: s.weight,
        reps: s.reps,
        setNumber: s.setNumber,
        unit: "kg",
      })),
    });

    // =============================
    // Response
    // =============================
    return NextResponse.json({
      success: true,
      date: workoutDate,
      week,
      setsSaved: sets.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
