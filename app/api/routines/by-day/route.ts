import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";

// =============================
// Types seguros (🔥 sin any)
// =============================
type RoutineDayWithRelations = Prisma.RoutineDayGetPayload<{
  include: {
    exercises: {
      include: {
        exercise: {
          include: {
            muscleGroup: true;
            workoutSets: true;
          };
        };
      };
    };
  };
}>;

type ExerciseStatus = "dominated" | "in_progress" | "no_data";

// =============================
// Helpers
// =============================
function getLastSession(
  sets: RoutineDayWithRelations["exercises"][number]["exercise"]["workoutSets"],
) {
  if (!sets.length)
    return {
      weight: null,
      reps: null,
      status: "no_data" as const,
    };

  const lastDate = sets[0].date.getTime();

  const lastSessionSets = sets.filter((s) => s.date.getTime() === lastDate);

  const repsArray = lastSessionSets.map((s) => s.reps);

  const allEqual = new Set(repsArray).size === 1;

  return {
    weight: Number(lastSessionSets[0].weight),
    reps: repsArray.join("/"),
    status: allEqual ? "dominated" : "in_progress",
  };
}

// =============================
// GET /api/routine?personId=xxx&day=1
// =============================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const personId = searchParams.get("personId");
    const day = Number(searchParams.get("day"));

    console.log(personId);
    console.log(day);

    // ========= Validación =========
    if (!personId || !day) {
      return NextResponse.json(
        { error: "personId and day are required" },
        { status: 400 },
      );
    }

    // ========= Query Prisma =========
    const routineDay: RoutineDayWithRelations | null =
      await prisma.routineDay.findFirst({
        where: {
          dayOfWeek: day,
          routine: {
            personId,
          },
        },
        include: {
          exercises: {
            orderBy: {
              order: "asc",
            },
            include: {
              exercise: {
                include: {
                  muscleGroup: true,
                  workoutSets: {
                    where: { personId },
                    orderBy: [{ date: "desc" }, { setNumber: "asc" }],
                  },
                },
              },
            },
          },
        },
      });

    if (!routineDay) {
      return NextResponse.json([]);
    }

    // ========= Agrupar por músculo =========
    const grouped: Record<
      string,
      {
        id: string;
        name: string;
        weight: number | null;
        reps: string | null;
        status: "dominated" | "in_progress" | "no_data";
      }[]
    > = {};

    for (const item of routineDay?.exercises) {
      const exercise = item.exercise;
      const last = getLastSession(exercise.workoutSets);

      const muscle = exercise.muscleGroup?.name ?? "Other";

      if (!grouped[muscle]) grouped[muscle] = [];

      grouped[muscle].push({
        id: exercise.id,
        name: exercise.name,
        weight: last?.weight ?? null,
        reps: last?.reps ?? null,
        status: (last?.status as ExerciseStatus) ?? "no_data",
      });
    }

    // ========= Response =========
    return NextResponse.json({
      day: routineDay.dayOfWeek,
      name: routineDay.name,
      groups: grouped,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
