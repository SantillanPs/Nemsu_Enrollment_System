import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Course, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { hasRoleAccess } from "@/lib/utils/role-check";

export async function GET() {
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
        select: { role: true },
      });

      console.log("User role:", user?.role);

      // If the user is a student, only show OPEN courses
      // For admin, faculty, and super admin, show all non-cancelled courses
      if (user && user.role.toLowerCase() === "student") {
        console.log("User is a student - filtering to show only OPEN courses");
        // For students, we only want to show courses with status "OPEN"
        whereClause = {
          status: "OPEN",
        };
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

    const courses = await prisma.course.findMany({
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
        Course_B: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      where: whereClause,
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

    // Transform the response to map Course_B to prerequisites
    const transformedCourses = courses.map((course) => {
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
