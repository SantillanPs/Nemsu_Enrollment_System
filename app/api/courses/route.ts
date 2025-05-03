import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Course, Prisma } from "@prisma/client";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        faculty: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        prerequisites: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      where: {
        status: {
          not: "CANCELLED",
        },
      },
      orderBy: [
        {
          year: "asc",
        },
        {
          semester: "asc",
        },
      ],
    });

    if (!courses) {
      return NextResponse.json({ error: "No courses found" }, { status: 404 });
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Database query failed" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
