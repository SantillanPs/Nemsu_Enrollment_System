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

    // Check if user is a student or super admin
    if (!hasRoleAccess(user.role, "STUDENT")) {
      return NextResponse.json(
        { error: "Only students can access this endpoint" },
        { status: 403 }
      );
    }

    // Get enrollments for this student
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: user.id,
      },
      select: {
        courseId: true,
        status: true,
      },
    });

    // Transform to a map of courseId -> status for easier consumption by the frontend
    const enrolledCourseMap = enrollments.reduce((acc, enrollment) => {
      acc[enrollment.courseId] = enrollment.status;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(enrolledCourseMap);
  } catch (error) {
    console.error("Error fetching enrolled course IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrolled course IDs" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
