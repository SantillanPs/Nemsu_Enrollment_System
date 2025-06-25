import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Course, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { hasRoleAccess } from "@/lib/utils/role-check";

export async function GET(request: Request) {
  // Check if we should include sections
  const { searchParams } = new URL(request.url);
  const includeSections = searchParams.get("includeSections") === "true";
  try {
    // Get the current user's session to check their role
    const session = await getServerSession();
    let whereClause: any = {
      status: {
        not: "CANCELLED",
      },
    };

    // If the user is logged in, check their role
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          profile: true,
        },
      });

      console.log("User role:", user?.role);

      // If the user is a student, only show OPEN courses
      // For admin, faculty, and super admin, show all non-cancelled courses
      if (user && user.role.toLowerCase() === "student") {
        console.log("User is a student - filtering to show only OPEN courses");
        console.log("Student profile:", user.profile);

        // For students, we only want to show courses with status "OPEN" initially
        whereClause = {
          status: "OPEN",
        };

        try {
          // Get the current active semester
          const currentSemesterResponse = await fetch(
            `${process.env.NEXTAUTH_URL}/api/current-semester`
          );

          if (!currentSemesterResponse.ok) {
            console.error(
              "Failed to fetch current semester:",
              await currentSemesterResponse.text()
            );
            // Continue with just the OPEN status filter
          } else {
            const currentSemesterData = await currentSemesterResponse.json();
            const currentSemester = currentSemesterData.semester;
            console.log("Current semester data:", currentSemesterData);

            // Get student's current enrollments to check which courses they've already taken
            const studentEnrollments = await prisma.enrollment.findMany({
              where: {
                studentId: user.id,
              },
              select: {
                courseId: true,
                status: true,
                course: {
                  select: {
                    code: true,
                    year: true,
                    semester: true,
                  },
                },
              },
            });

            console.log(`Student has ${studentEnrollments.length} enrollments`);

            // Get the list of course IDs the student has already enrolled in
            const enrolledCourseIds = studentEnrollments.map((e) => e.courseId);

            // If we have a valid semester and the student has a school year
            if (
              currentSemester &&
              currentSemester !== "NONE" &&
              user.profile?.schoolYear
            ) {
              // Create an OR condition to show:
              // 1. Courses matching current year and semester
              // 2. Courses from previous years that the student hasn't enrolled in yet
              whereClause = {
                status: "OPEN",
                OR: [
                  // Current year and semester courses
                  {
                    semester: currentSemester,
                    year: user.profile.schoolYear,
                  },
                  // Previous years' courses that student hasn't taken yet
                  {
                    year: { lt: user.profile.schoolYear },
                    semester: currentSemester,
                    id: { notIn: enrolledCourseIds },
                  },
                ],
              };

              console.log(
                "Applying advanced filters:",
                JSON.stringify(whereClause, null, 2)
              );
            } else {
              // If we don't have semester or school year, just filter by OPEN status
              whereClause = {
                status: "OPEN",
              };
            }
          }
        } catch (error) {
          console.error("Error fetching current semester:", error);
          // Continue with just the OPEN status filter
        }
      } else {
        console.log(
          "User is admin/faculty/super-admin - showing all non-cancelled courses"
        );
        // For admin, faculty, and super admin, show all non-cancelled courses
        whereClause = {
          status: {
            not: "CANCELLED",
          },
        };
      }
    }

    // Define the include and orderBy options to reuse
    const includeOptions = {
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
      Course_B: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      ...(includeSections ? { sections: true } : {}),
    };

    const orderByOptions = [
      {
        year: "asc" as const,
      },
      {
        semester: "asc" as const,
      },
    ];

    // First attempt with all filters
    let courses = await prisma.course.findMany({
      include: includeOptions,
      where: whereClause,
      orderBy: orderByOptions,
    });

    console.log(`Found ${courses.length} courses with filters:`, whereClause);

    // If no courses found with our filters, try a more relaxed approach
    if (courses.length === 0 && whereClause.OR) {
      console.log(
        "No courses found with advanced filters. Trying with relaxed filters."
      );

      // Try with just the status filter and current semester
      const relaxedFilter = {
        status: "OPEN",
        semester: whereClause.OR[0].semester, // Use the current semester from our original filter
      };

      courses = await prisma.course.findMany({
        include: includeOptions,
        where: relaxedFilter,
        orderBy: orderByOptions,
      });

      console.log(
        `Found ${courses.length} courses with relaxed filter:`,
        relaxedFilter
      );

      // If still no courses, try with just the status filter
      if (courses.length === 0) {
        console.log(
          "No courses found with relaxed filters. Trying with status-only filter."
        );

        const statusOnlyFilter = {
          status: "OPEN",
        };

        courses = await prisma.course.findMany({
          include: includeOptions,
          where: statusOnlyFilter,
          orderBy: orderByOptions,
        });

        console.log(
          `Found ${courses.length} courses with status-only filter:`,
          statusOnlyFilter
        );
      }
    }

    // Transform the response to map Course_B to prerequisites
    const transformedCourses = courses.map((course: any) => {
      const { Course_B, ...rest } = course;
      return {
        ...rest,
        prerequisites: Course_B || [],
      };
    });

    console.log(
      "Returning courses with statuses:",
      transformedCourses.map((course) => ({
        id: course.id,
        code: course.code,
        status: course.status,
      }))
    );

    console.log("Where clause used:", JSON.stringify(whereClause));

    return NextResponse.json(transformedCourses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Database query failed" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

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

    // Check if user is an admin
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can create courses" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "code",
      "name",
      "description",
      "credits",
      "capacity",
      "semester",
      "year",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code: body.code },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: "Course code already exists" },
        { status: 400 }
      );
    }

    // Create course with optional facultyId
    const courseData = {
      code: body.code,
      name: body.name,
      description: body.description,
      credits: parseInt(body.credits),
      capacity: parseInt(body.capacity),
      semester: body.semester,
      year: parseInt(body.year),
      status: body.status || "OPEN",
    };

    // Only add facultyId if it's provided and not empty
    if (body.facultyId) {
      Object.assign(courseData, { facultyId: body.facultyId });
    }

    const course = await prisma.course.create({
      data: courseData,
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
      await prisma.course.update({
        where: { id: course.id },
        data: {
          Course_B: {
            connect: body.prerequisites.map((id: string) => ({ id })),
          },
        },
      });
    }

    return NextResponse.json(
      { data: course, message: "Course created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Course with this code already exists" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create course",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
