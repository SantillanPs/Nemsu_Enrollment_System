import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

// Get all sections for a course
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    const { id } = await params;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get all sections for the course
    const sections = await prisma.courseSection.findMany({
      where: {
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
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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
        { error: "Only admins can create sections" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { sectionCode, schedule, room, maxStudents } = body;

    // Validate required fields
    if (!sectionCode || !room) {
      return NextResponse.json(
        { error: "Section code and room are required" },
        { status: 400 }
      );
    }

    // Use default schedule if not provided
    const finalSchedule = schedule || "TBD";

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if section code already exists for this course
    const existingSection = await prisma.courseSection.findUnique({
      where: {
        courseId_sectionCode: {
          courseId: id,
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

    // Process maxStudents value
    let processedMaxStudents = 30; // Default value

    if (maxStudents !== undefined && maxStudents !== null) {
      if (typeof maxStudents === "number") {
        processedMaxStudents = maxStudents;
      } else if (typeof maxStudents === "string") {
        if (maxStudents.trim() !== "") {
          const parsed = parseInt(maxStudents);
          if (!isNaN(parsed)) {
            processedMaxStudents = parsed;
          }
        }
      }
    }

    console.log("Creating section with data:", {
      courseId: id,
      sectionCode,
      schedule: finalSchedule,
      room,
      maxStudents: processedMaxStudents,
    });

    // Create the section
    const section = await prisma.courseSection.create({
      data: {
        courseId: id,
        sectionCode,
        schedule: finalSchedule,
        room,
        maxStudents: processedMaxStudents,
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
