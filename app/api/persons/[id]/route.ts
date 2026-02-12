import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const person = await prisma.person.findUnique({
      where: { id },
    });

    return NextResponse.json(person);
  } catch (error) {
    console.error("[GET_PERSON_ERROR]", error);

    return NextResponse.json(
      { error: "Error fetching person" },
      { status: 500 },
    );
  }
}
