import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const persons = await prisma.person.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(persons);
  } catch (error) {
    console.error("[GET_PERSONS_ERROR]", error);
    return NextResponse.json(
      { error: "Error fetching persons" },
      { status: 500 },
    );
  }
}
