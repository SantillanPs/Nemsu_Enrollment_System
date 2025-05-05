import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
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

    // Check if user is a faculty member
    if (user.role !== "FACULTY") {
      return NextResponse.json(
        { error: "Only faculty members can assign themselves to courses" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if the course already has a faculty assigned
    if (course.facultyId) {
      return NextResponse.json(
        { error: "This course already has a faculty assigned" },
        { status: 400 }
      );
    }

    // Assign the faculty to the course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { facultyId: user.id },
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
      message: "Successfully assigned to course",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error assigning faculty to course:", error);
    return NextResponse.json(
      { error: "Failed to assign faculty to course" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
