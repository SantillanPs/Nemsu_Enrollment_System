import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

// Get a specific section
export async function GET(
  request: Request,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id, sectionId } = await params;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get the section
    const section = await prisma.courseSection.findUnique({
      where: {
        id: sectionId,
        courseId: id,
      },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Error fetching section:", error);
    return NextResponse.json(
      { error: "Failed to fetch section" },
      { status: 500 }
    );
  }
}

// Update a section
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !hasRoleAccess(user.role, "ADMIN")) {
      return NextResponse.json(
        { error: "Only admins can update sections" },
        { status: 403 }
      );
    }

    const { id, sectionId } = await params;
    const body = await request.json();
    const { sectionCode, schedule, room, maxStudents } = body;

    // Validate required fields
    if (!sectionCode || !schedule || !room || !maxStudents) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if section exists
    const existingSection = await prisma.courseSection.findUnique({
      where: {
        id: sectionId,
        courseId: id,
      },
    });

    if (!existingSection) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Check if the new section code conflicts with another section in the same course
    if (sectionCode !== existingSection.sectionCode) {
      const conflictingSection = await prisma.courseSection.findUnique({
        where: {
          courseId_sectionCode: {
            courseId: id,
            sectionCode,
          },
        },
      });

      if (conflictingSection && conflictingSection.id !== sectionId) {
        return NextResponse.json(
          { error: "Section code already exists for this course" },
          { status: 400 }
        );
      }
    }

    // Update the section
    const updatedSection = await prisma.courseSection.update({
      where: {
        id: sectionId,
      },
      data: {
        sectionCode,
        schedule,
        room,
        maxStudents:
          typeof maxStudents === "string" && maxStudents.trim() === ""
            ? 30 // Default to 30 if empty
            : typeof maxStudents === "string"
            ? parseInt(maxStudents) || 30 // Parse string or default to 30 if NaN
            : maxStudents, // Use as is if it's already a number
      },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      section: updatedSection,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}

// Delete a section
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !hasRoleAccess(user.role, "ADMIN")) {
      return NextResponse.json(
        { error: "Only admins can delete sections" },
        { status: 403 }
      );
    }

    const { id, sectionId } = await params;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if section exists
    const existingSection = await prisma.courseSection.findUnique({
      where: {
        id: sectionId,
        courseId: id,
      },
      include: {
        enrollments: true,
      },
    });

    if (!existingSection) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Delete all enrollments for this section
    await prisma.enrollment.deleteMany({
      where: { sectionId },
    });

    // Delete the section
    await prisma.courseSection.delete({
      where: { id: sectionId },
    });

    return NextResponse.json({
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    );
  }
}
