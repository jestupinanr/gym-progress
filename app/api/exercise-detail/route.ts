/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// =============================
// Helpers
// =============================
function getLastSession(sets: any[]) {
  if (!sets.length) return null;

  const lastDate = sets[0].date.getTime();

  return sets.filter((s) => s.date.getTime() === lastDate);
}

function buildGoal(reps: number[]) {
  if (!reps.length) return [];

  const max = Math.max(...reps);

  return reps.map((r) => (r < max ? r + 1 : r));
}

// =============================
// GET /api/exercise-detail
// =============================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const personId = searchParams.get("personId");
    const exerciseId = searchParams.get("exerciseId");

    if (!personId || !exerciseId) {
      return NextResponse.json(
        { error: "personId and exerciseId required" },
        { status: 400 },
      );
    }

    // =============================
    // Query Prisma
    // =============================
    const [person, exercise] = await Promise.all([
      prisma.person.findUnique({
        where: { id: personId },
        select: { id: true, name: true },
      }),

      prisma.exercise.findUnique({
        where: { id: exerciseId },
        include: {
          muscleGroup: true,
          workoutSets: {
            where: { personId },
            orderBy: [{ date: "desc" }, { setNumber: "asc" }],
          },
        },
      }),
    ]);

    if (!person || !exercise) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // =============================
    // Última sesión
    // =============================
    const lastSessionSets = getLastSession(exercise.workoutSets);

    const lastReps = lastSessionSets?.map((s) => s.reps) ?? [];

    const lastWeight = lastSessionSets?.length
      ? Number(lastSessionSets[0].weight)
      : null;

    // =============================
    // Meta sugerida hoy
    // =============================
    const goalReps = buildGoal(lastReps);

    const dominated = lastReps.length > 0 && new Set(lastReps).size === 1;

    // =============================
    // Response
    // =============================
    return NextResponse.json({
      person: {
        id: person.id,
        name: person.name,
      },

      exercise: {
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup?.name ?? "Other",
      },

      lastSession: {
        weight: lastWeight,
        reps: lastReps.join("/"),
      },

      todayGoal: {
        weight: lastWeight,
        reps: goalReps.join("/"),
      },

      status: dominated ? "dominated" : "in_progress",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
