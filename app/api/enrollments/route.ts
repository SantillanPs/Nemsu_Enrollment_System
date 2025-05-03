import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();

    // Get user's profile with verification status
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: {
          include: {
            documents: true,
          },
        },
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user?.profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Check if user is verified
    if (!user.profile.isVerified) {
      return NextResponse.json(
        { error: "Your account must be verified before enrolling in courses" },
        { status: 403 }
      );
    }

    // Check if all required documents are verified
    const hasUnverifiedDocuments = user.profile.documents.some(
      (doc) => doc.status !== "VERIFIED"
    );

    if (hasUnverifiedDocuments) {
      return NextResponse.json(
        { error: "All documents must be verified before enrolling in courses" },
        { status: 403 }
      );
    }

    // Get course with prerequisites
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        prerequisites: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check prerequisites
    if (course.prerequisites.length > 0) {
      const completedCourseIds = user.enrollments
        .filter((enrollment) => enrollment.status === "COMPLETED")
        .map((enrollment) => enrollment.courseId);

      const missingPrerequisites = course.prerequisites.filter(
        (prerequisite) => !completedCourseIds.includes(prerequisite.id)
      );

      if (missingPrerequisites.length > 0) {
        const prerequisiteCodes = missingPrerequisites
          .map((course) => course.code)
          .join(", ");
        return NextResponse.json(
          {
            error: `Missing prerequisites: ${prerequisiteCodes}. You must complete these courses first.`,
          },
          { status: 403 }
        );
      }
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Create new enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: user.id,
        courseId,
        status: "PENDING",
      },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 }
    );
  }
}
