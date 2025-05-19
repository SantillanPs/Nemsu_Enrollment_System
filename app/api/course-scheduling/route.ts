import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";
import { z } from "zod";

// Schema for schedule creation
const scheduleSchema = z.object({
  schedules: z.array(
    z.object({
      courseId: z.string(),
      day: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      sectionNumber: z.number().optional(),
    })
  ),
});

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
    if (!hasRoleAccess(user.role, "ADMIN")) {
      return NextResponse.json(
        { error: "Only administrators can create course schedules" },
        { status: 403 }
      );
    }

    // Check if there are any finished enrollment periods
    const now = new Date();
    const finishedEnrollmentPeriods = await prisma.enrollmentPeriod.findMany({
      where: {
        endDate: { lt: now },
      },
      take: 1,
    });

    if (finishedEnrollmentPeriods.length === 0) {
      return NextResponse.json(
        {
          error:
            "Course scheduling can only be used after an enrollment period has finished",
        },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = scheduleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { schedules } = validationResult.data;

    // Group schedules by courseId
    const courseSchedules = schedules.reduce((acc, schedule) => {
      if (!acc[schedule.courseId]) {
        acc[schedule.courseId] = [];
      }
      acc[schedule.courseId].push(schedule);
      return acc;
    }, {} as Record<string, typeof schedules>);

    // Process each course
    const results = [];

    for (const [courseId, courseScheduleItems] of Object.entries(
      courseSchedules
    )) {
      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          sections: true,
        },
      });

      if (!course) {
        results.push({
          courseId,
          success: false,
          error: "Course not found",
        });
        continue;
      }

      // Process each schedule item
      for (const scheduleItem of courseScheduleItems) {
        // Format the schedule string
        const scheduleString = `${scheduleItem.day} ${scheduleItem.startTime} - ${scheduleItem.endTime}`;

        // Check if we need to update an existing section or create a new one
        if (scheduleItem.sectionNumber) {
          // Try to find an existing section by section number
          const existingSections = course.sections || [];
          const sectionIndex = scheduleItem.sectionNumber - 1;

          if (
            existingSections.length > 0 &&
            sectionIndex < existingSections.length
          ) {
            // Update the existing section
            const sectionToUpdate = existingSections[sectionIndex];
            const updatedSection = await prisma.courseSection.update({
              where: { id: sectionToUpdate.id },
              data: {
                schedule: scheduleString,
              },
            });

            results.push({
              courseId,
              sectionId: updatedSection.id,
              sectionCode: updatedSection.sectionCode,
              schedule: scheduleString,
              success: true,
              updated: true,
            });

            continue; // Skip to the next schedule item
          }
        }

        // If we get here, we need to create a new section
        // Generate a section code
        const sectionCode = generateSectionCode(course.sections);

        // Create the section
        const section = await prisma.courseSection.create({
          data: {
            courseId,
            sectionCode,
            schedule: scheduleString,
            room: "TBD", // Default room, can be updated later
            maxStudents: course.capacity,
          },
        });

        results.push({
          courseId,
          sectionId: section.id,
          sectionCode,
          schedule: scheduleString,
          success: true,
        });
      }
    }

    return NextResponse.json(
      { results, message: "Schedules created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating schedules:", error);
    return NextResponse.json(
      { error: "Failed to create schedules" },
      { status: 500 }
    );
  }
}

// Helper function to generate the next section code
function generateSectionCode(
  existingSections: { sectionCode: string }[]
): string {
  if (existingSections.length === 0) {
    return "A";
  }

  // Get all existing section codes
  const sectionCodes = existingSections.map((section) => section.sectionCode);

  // Find the highest section code
  const highestCode = sectionCodes.sort().pop() || "A";

  // Generate the next code (A -> B, Z -> AA, etc.)
  const nextCode = getNextSectionCode(highestCode);

  return nextCode;
}

// Helper function to get the next section code
function getNextSectionCode(code: string): string {
  // Simple implementation for A-Z
  if (code.length === 1 && code !== "Z") {
    return String.fromCharCode(code.charCodeAt(0) + 1);
  } else if (code === "Z") {
    return "AA";
  } else {
    // For multi-character codes (AA, AB, etc.)
    const lastChar = code.charAt(code.length - 1);
    const prefix = code.slice(0, -1);

    if (lastChar === "Z") {
      return getNextSectionCode(prefix) + "A";
    } else {
      return prefix + String.fromCharCode(lastChar.charCodeAt(0) + 1);
    }
  }
}
