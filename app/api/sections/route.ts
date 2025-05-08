import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

// Get all sections for a course
export async function GET(request: Request) {
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

    // Parse query parameters
    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get all sections for the course
    const sections = await prisma.courseSection.findMany({
      where: {
        courseId: courseId,
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

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}

// Create a new section
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
        { error: "Only admins can create sections" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId, sectionCode, schedule, room, maxStudents } = body;

    // Validate required fields
    if (!courseId || !sectionCode || !schedule || !room || !maxStudents) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if section code already exists for this course
    const existingSection = await prisma.courseSection.findUnique({
      where: {
        courseId_sectionCode: {
          courseId,
          sectionCode,
        },
      },
    });

    if (existingSection) {
      return NextResponse.json(
        { error: "Section code already exists for this course" },
        { status: 400 }
      );
    }

    // Create the section
    const section = await prisma.courseSection.create({
      data: {
        courseId,
        sectionCode,
        schedule,
        room,
        maxStudents: parseInt(maxStudents.toString()),
      },
    });

    return NextResponse.json(
      { section, message: "Section created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}
