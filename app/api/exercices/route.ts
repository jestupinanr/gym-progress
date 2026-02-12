import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
      select: {
        id: true,
        name: true,
        muscleGroup: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // normalizamos la respuesta
    const formatted = exercises.map((e) => ({
      id: e.id,
      name: e.name,
      muscleGroup: e.muscleGroup?.name ?? null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[GET_EXERCISES_ERROR]", error);
    return NextResponse.json(
      { error: "Error fetching exercises" },
      { status: 500 },
    );
  }
}
