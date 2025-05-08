import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";
import { assignSectionsForCourse } from "@/lib/utils/section-assignment";

// Process enrollments after enrollment period closes
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
        { error: "Only admins can process enrollments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { enrollmentPeriodId } = body;

    if (!enrollmentPeriodId) {
      return NextResponse.json(
        { error: "Enrollment period ID is required" },
        { status: 400 }
      );
    }

    // Get the enrollment period
    const enrollmentPeriod = await prisma.enrollmentPeriod.findUnique({
      where: { id: enrollmentPeriodId },
    });

    if (!enrollmentPeriod) {
      return NextResponse.json(
        { error: "Enrollment period not found" },
        { status: 404 }
      );
    }

    // Check if the enrollment period is active
    if (enrollmentPeriod.isActive) {
      // If it's still active, deactivate it
      await prisma.enrollmentPeriod.update({
        where: { id: enrollmentPeriodId },
        data: { isActive: false },
      });
    }

    // Get all courses with pending enrollments
    const coursesWithEnrollments = await prisma.course.findMany({
      where: {
        enrollments: {
          some: {
            status: "PENDING",
            sectionId: null,
          },
        },
      },
      include: {
        enrollments: {
          where: {
            status: "PENDING",
            sectionId: null,
          },
        },
      },
    });

    if (coursesWithEnrollments.length === 0) {
      return NextResponse.json(
        { message: "No pending enrollments to process" },
        { status: 200 }
      );
    }

    // Process each course
    const results = [];
    const errors = [];

    for (const course of coursesWithEnrollments) {
      try {
        // Call the section assignment utility function directly
        const assignmentResult = await assignSectionsForCourse(course.id);

        results.push({
          courseId: course.id,
          code: course.code,
          assigned: assignmentResult.assigned?.length || 0,
          total: course.enrollments.length,
        });
      } catch (error) {
        console.error(`Error processing course ${course.id}:`, error);
        errors.push({
          courseId: course.id,
          code: course.code,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: results.length > 0,
      processed: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully processed enrollments for ${results.length} out of ${coursesWithEnrollments.length} courses.`,
    });
  } catch (error) {
    console.error("Error processing enrollments:", error);
    return NextResponse.json(
      { error: "Failed to process enrollments" },
      { status: 500 }
    );
  }
}
