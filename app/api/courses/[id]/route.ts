import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

// Get a specific course
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
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
        sections: {
          include: {
            enrollments: {
              include: {
                student: {
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
            },
          },
        },
        enrollments: {
          include: {
            student: {
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
        },
        Course_B: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Transform the response to map Course_B to prerequisites
    const { Course_B, ...rest } = course;
    const transformedCourse = {
      ...rest,
      prerequisites: Course_B || [],
    };

    return NextResponse.json(transformedCourse);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Update a course
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
        { error: "Only administrators can update courses" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        credits: parseInt(body.credits),
        capacity: parseInt(body.capacity),
        semester: body.semester,
        year: parseInt(body.year),
        status: body.status,
        facultyId: body.facultyId || null,
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

    // Handle prerequisites if provided
    if (
      body.prerequisites &&
      Array.isArray(body.prerequisites) &&
      body.prerequisites.length > 0
    ) {
      // First disconnect all existing prerequisites
      await prisma.course.update({
        where: { id },
        data: {
          Course_B: {
            set: [], // Clear existing connections
          },
        },
      });

      // Then connect new prerequisites
      await prisma.course.update({
        where: { id },
        data: {
          Course_B: {
            connect: body.prerequisites.map((id: string) => ({ id })),
          },
        },
      });
    }

    return NextResponse.json({
      data: updatedCourse,
      message: "Course updated successfully",
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Delete a course
export async function DELETE(
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
        { error: "Only administrators can delete courses" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            enrollments: true,
          },
        },
        enrollments: true,
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Delete all enrollments for this course
    await prisma.enrollment.deleteMany({
      where: { courseId: id },
    });

    // Delete all sections for this course
    await prisma.courseSection.deleteMany({
      where: { courseId: id },
    });

    // Delete the course
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      // Check for specific Prisma errors
      if (error.message.includes("Foreign key constraint failed")) {
        return NextResponse.json(
          {
            error:
              "Cannot delete this course because it is referenced by other records.",
            details: error.message,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to delete course",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
