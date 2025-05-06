import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const courseIds = Array.isArray(body.courseIds)
      ? body.courseIds
      : body.courseId
      ? [body.courseId]
      : [];

    if (courseIds.length === 0) {
      return NextResponse.json(
        { error: "No course IDs provided" },
        { status: 400 }
      );
    }

    // Check if enrollment is currently allowed
    try {
      const now = new Date();
      const activeEnrollmentPeriod = await prisma.enrollmentPeriod.findFirst({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      });

      if (!activeEnrollmentPeriod) {
        return NextResponse.json(
          {
            error:
              "Enrollment is currently closed. Please check back during the enrollment period.",
          },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error("Error checking enrollment period:", error);
      // If there's an error (like table doesn't exist), continue with enrollment
      // This allows enrollment to work before the enrollment periods feature is fully set up
    }

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

    // Define required document types
    const requiredDocumentTypes = [
      "TOR",
      "BIRTH_CERTIFICATE",
      "GRADES",
      "CLEARANCE",
    ];

    // Check if user is verified
    if (!user.profile.isVerified) {
      // Check if all required documents are submitted and verified
      const documents = user.profile.documents || [];

      // Check if all required documents are submitted
      const missingDocuments = requiredDocumentTypes.filter(
        (type) => !documents.some((doc) => doc.type === type)
      );

      if (missingDocuments.length > 0) {
        return NextResponse.json(
          {
            error: `Missing required documents: ${missingDocuments.join(
              ", "
            )}. Please upload all required documents.`,
          },
          { status: 403 }
        );
      }

      // Check if all submitted documents are verified
      const unverifiedDocuments = documents.filter(
        (doc) => doc.status !== "VERIFIED"
      );

      if (unverifiedDocuments.length > 0) {
        const unverifiedTypes = unverifiedDocuments
          .map((doc) => doc.type)
          .join(", ");
        return NextResponse.json(
          {
            error: `The following documents are not yet verified: ${unverifiedTypes}. Please wait for verification or contact an administrator.`,
          },
          { status: 403 }
        );
      }

      // This should not happen if the system is working correctly, but just in case
      return NextResponse.json(
        {
          error:
            "Your account must be verified before enrolling in courses. Please contact an administrator.",
        },
        { status: 403 }
      );
    }

    // Get all courses with prerequisites
    const courses = await prisma.course.findMany({
      where: {
        id: {
          in: courseIds,
        },
      },
      include: {
        Course_B: true,
      },
    });

    // Transform courses to include prerequisites
    const transformedCourses = courses.map((course) => {
      const { Course_B, ...rest } = course;
      return {
        ...rest,
        prerequisites: Course_B || [],
      };
    });

    if (transformedCourses.length === 0) {
      return NextResponse.json({ error: "No courses found" }, { status: 404 });
    }

    // Check for missing courses
    if (transformedCourses.length !== courseIds.length) {
      const foundCourseIds = transformedCourses.map((course) => course.id);
      const missingCourseIds = courseIds.filter(
        (id) => !foundCourseIds.includes(id)
      );

      return NextResponse.json(
        {
          error: `Some courses were not found: ${missingCourseIds.join(", ")}`,
        },
        { status: 404 }
      );
    }

    // Get completed course IDs for prerequisite checking
    const completedCourseIds = user.enrollments
      .filter((enrollment) => enrollment.status === "COMPLETED")
      .map((enrollment) => enrollment.courseId);

    // Get existing enrollments to avoid duplicates
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: user.id,
        courseId: {
          in: courseIds,
        },
      },
    });

    const existingCourseIds = existingEnrollments.map(
      (enrollment) => enrollment.courseId
    );

    // Process each course for enrollment
    const results = [];
    const errors = [];

    for (const course of transformedCourses) {
      // Skip if already enrolled
      if (existingCourseIds.includes(course.id)) {
        errors.push({
          courseId: course.id,
          code: course.code,
          error: "Already enrolled in this course",
        });
        continue;
      }

      // Check prerequisites
      if (course.prerequisites.length > 0) {
        const missingPrerequisites = course.prerequisites.filter(
          (prerequisite) => !completedCourseIds.includes(prerequisite.id)
        );

        if (missingPrerequisites.length > 0) {
          const prerequisiteCodes = missingPrerequisites
            .map((prereq) => prereq.code)
            .join(", ");

          errors.push({
            courseId: course.id,
            code: course.code,
            error: `Missing prerequisites: ${prerequisiteCodes}`,
          });
          continue;
        }
      }

      // Create enrollment
      try {
        const enrollment = await prisma.enrollment.create({
          data: {
            studentId: user.id,
            courseId: course.id,
            status: "PENDING",
          },
          include: {
            course: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        });

        results.push(enrollment);
      } catch (error) {
        console.error(`Error enrolling in course ${course.id}:`, error);
        errors.push({
          courseId: course.id,
          code: course.code,
          error: "Failed to create enrollment",
        });
      }
    }

    return NextResponse.json({
      success: results.length > 0,
      enrollments: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully enrolled in ${results.length} out of ${courseIds.length} courses.`,
    });
  } catch (error) {
    console.error("Error creating enrollments:", error);
    return NextResponse.json(
      { error: "Failed to create enrollments" },
      { status: 500 }
    );
  }
}
