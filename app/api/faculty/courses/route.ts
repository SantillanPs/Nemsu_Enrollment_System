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

    // Check if user is a faculty member or super admin
    if (!hasRoleAccess(user.role, "FACULTY")) {
      return NextResponse.json(
        { error: "Only faculty members can access this endpoint" },
        { status: 403 }
      );
    }

    // Get courses taught by this faculty member
    const courses = await prisma.course.findMany({
      where: {
        facultyId: user.id,
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
        Course_B: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          year: "asc",
        },
        {
          semester: "asc",
        },
      ],
    });

    if (!courses) {
      return NextResponse.json({ error: "No courses found" }, { status: 404 });
    }

    // Add enrollment statistics to each course
    const coursesWithStats = courses.map((course) => {
      const totalEnrollments = course.enrollments.length;
      const pendingEnrollments = course.enrollments.filter(
        (e) => e.status === "PENDING"
      ).length;
      const approvedEnrollments = course.enrollments.filter(
        (e) => e.status === "APPROVED"
      ).length;
      const completedEnrollments = course.enrollments.filter(
        (e) => e.status === "COMPLETED"
      ).length;

      // Process sections with enrollment counts
      const sectionsWithStats = (course.sections || []).map((section) => {
        const sectionEnrollments = section.enrollments;
        const totalSectionEnrollments = sectionEnrollments.length;
        const pendingSectionEnrollments = sectionEnrollments.filter(
          (e) => e.status === "PENDING"
        ).length;
        const approvedSectionEnrollments = sectionEnrollments.filter(
          (e) => e.status === "APPROVED"
        ).length;
        const completedSectionEnrollments = sectionEnrollments.filter(
          (e) => e.status === "COMPLETED"
        ).length;

        return {
          ...section,
          stats: {
            totalEnrollments: totalSectionEnrollments,
            pendingEnrollments: pendingSectionEnrollments,
            approvedEnrollments: approvedSectionEnrollments,
            completedEnrollments: completedSectionEnrollments,
            availableSeats: section.maxStudents - approvedSectionEnrollments,
          },
        };
      });

      // Extract Course_B and map it to prerequisites
      const { Course_B, ...restCourse } = course;

      return {
        ...restCourse,
        prerequisites: Course_B || [],
        sections: sectionsWithStats,
        stats: {
          totalEnrollments,
          pendingEnrollments,
          approvedEnrollments,
          completedEnrollments,
          availableSeats: course.capacity - approvedEnrollments,
          totalSections: course.sections ? course.sections.length : 0,
        },
      };
    });

    return NextResponse.json(coursesWithStats);
  } catch (error) {
    console.error("Error fetching faculty courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
