import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if user is an admin
    if (!hasRoleAccess(user.role, "ADMIN")) {
      return NextResponse.json(
        { error: "Only administrators can assign instructors to courses" },
        { status: 403 }
      );
    }

    // Get the course ID from params
    const { id: courseId } = await params;
    const body = await request.json();
    const { facultyId } = body;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if faculty exists
    if (facultyId && facultyId !== "none") {
      const faculty = await prisma.user.findUnique({
        where: { id: facultyId },
      });

      if (!faculty) {
        return NextResponse.json(
          { error: "Faculty member not found" },
          { status: 404 }
        );
      }

      // Check if the user is a faculty member
      if (faculty.role !== "FACULTY") {
        return NextResponse.json(
          { error: "Selected user is not a faculty member" },
          { status: 400 }
        );
      }
    }

    // Update the course with the new faculty
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        facultyId: facultyId === "none" ? null : facultyId,
      },
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
      },
    });

    return NextResponse.json({
      data: updatedCourse,
      message:
        facultyId && facultyId !== "none"
          ? "Instructor assigned successfully"
          : "Instructor removed successfully",
    });
  } catch (error) {
    console.error("Error assigning instructor to course:", error);
    return NextResponse.json(
      { error: "Failed to assign instructor to course" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
