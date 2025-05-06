import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a faculty member or super admin
    if (!hasRoleAccess(user.role, "FACULTY")) {
      return NextResponse.json(
        { error: "Only faculty members can access this endpoint" },
        { status: 403 }
      );
    }

    // Get courses without assigned faculty
    const courses = await prisma.course.findMany({
      where: {
        facultyId: null,
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        Course_B: {
          select: {
            id: true,
            code: true,
            name: true,
          },
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

    // Transform the response to map Course_B to prerequisites
    const transformedCourses = courses.map((course) => {
      const { Course_B, ...rest } = course;
      return {
        ...rest,
        prerequisites: Course_B || [],
      };
    });

    return NextResponse.json(transformedCourses);
  } catch (error) {
    console.error("Error fetching available courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch available courses" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
