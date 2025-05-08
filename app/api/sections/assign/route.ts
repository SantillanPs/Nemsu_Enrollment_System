import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

// Assign students to sections
export async function POST(request: Request) {
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
        { error: "Only admins can assign students to sections" },
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

    // Get the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get all enrollments for this course that don't have a section assigned
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        sectionId: null,
        status: "PENDING", // Only assign pending enrollments
      },
      orderBy: {
        createdAt: "asc", // Process oldest enrollments first
      },
    });

    if (enrollments.length === 0) {
      return NextResponse.json(
        { message: "No enrollments to assign" },
        { status: 200 }
      );
    }

    // Get all sections for this course
    let sections = await prisma.courseSection.findMany({
      where: {
        courseId,
      },
      include: {
        enrollments: true,
      },
    });

    // If no sections exist, create the first one
    if (sections.length === 0) {
      const newSection = await prisma.courseSection.create({
        data: {
          courseId,
          sectionCode: "A",
          schedule: "TBD",
          room: "TBD",
          maxStudents: course.capacity,
        },
        include: {
          enrollments: true,
        },
      });
      sections = [newSection];
    }

    // Process each enrollment
    const results = [];
    const errors = [];

    for (const enrollment of enrollments) {
      try {
        // Find a section with available space
        let targetSection = sections.find(
          (section) => section.enrollments.length < section.maxStudents
        );

        // If no section has space, create a new one
        if (!targetSection) {
          // Generate the next section code (A, B, C, ...)
          const lastSectionCode = sections[sections.length - 1].sectionCode;
          const nextSectionCode = String.fromCharCode(
            lastSectionCode.charCodeAt(0) + 1
          );

          targetSection = await prisma.courseSection.create({
            data: {
              courseId,
              sectionCode: nextSectionCode,
              schedule: "TBD",
              room: "TBD",
              maxStudents: course.capacity,
            },
            include: {
              enrollments: true,
            },
          });

          sections.push(targetSection);
        }

        // Assign the enrollment to the section
        const updatedEnrollment = await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            sectionId: targetSection.id,
            status: "APPROVED", // Automatically approve when assigned to a section
          },
          include: {
            student: {
              select: {
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            course: {
              select: {
                code: true,
                name: true,
              },
            },
            section: true,
          },
        });

        results.push(updatedEnrollment);

        // Update the section's enrollment count in our local array
        const sectionIndex = sections.findIndex(
          (s) => s.id === targetSection.id
        );
        if (sectionIndex !== -1) {
          sections[sectionIndex].enrollments.push(enrollment);
        }
      } catch (error) {
        console.error(
          `Error assigning enrollment ${enrollment.id} to a section:`,
          error
        );
        errors.push({
          enrollmentId: enrollment.id,
          error: "Failed to assign to a section",
        });
      }
    }

    return NextResponse.json({
      success: results.length > 0,
      assigned: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully assigned ${results.length} out of ${enrollments.length} enrollments to sections.`,
    });
  } catch (error) {
    console.error("Error assigning students to sections:", error);
    return NextResponse.json(
      { error: "Failed to assign students to sections" },
      { status: 500 }
    );
  }
}
