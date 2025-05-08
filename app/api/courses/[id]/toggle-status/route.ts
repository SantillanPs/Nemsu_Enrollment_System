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
        { error: "Only administrators can update course status" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Toggle the course status between OPEN and CLOSED
    const newStatus = existingCourse.status === "OPEN" ? "CLOSED" : "OPEN";

    // Update course status
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        status: newStatus,
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
      message: `Course status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error("Error toggling course status:", error);
    return NextResponse.json(
      { error: "Failed to toggle course status" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
