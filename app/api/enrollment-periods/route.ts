import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

// Get all enrollment periods
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

    if (!user || !hasRoleAccess(user.role, "ADMIN")) {
      return NextResponse.json(
        { error: "Only admins can access enrollment periods" },
        { status: 403 }
      );
    }

    // Get all enrollment periods
    try {
      const enrollmentPeriods = await prisma.enrollmentPeriod.findMany({
        orderBy: { startDate: "desc" },
      });

      return NextResponse.json({ enrollmentPeriods });
    } catch (error) {
      console.error("Error fetching enrollment periods:", error);
      // If there's an error (like table doesn't exist), return empty array
      return NextResponse.json({ enrollmentPeriods: [] });
    }
  } catch (error) {
    console.error("Error fetching enrollment periods:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollment periods" },
      { status: 500 }
    );
  }
}

// Create a new enrollment period
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
        { error: "Only admins can create enrollment periods" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("Received request body:", body);
    const { name, description, startDate, endDate, isActive } = body;

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Name, start date, and end date are required" },
        { status: 400 }
      );
    }

    // Validate dates
    console.log("Received dates:", { startDate, endDate });

    let start, end;

    try {
      start = new Date(startDate);
      end = new Date(endDate);

      console.log("Parsed dates:", { start, end });

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format. Dates could not be parsed." },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error parsing dates:", error);
      return NextResponse.json(
        { error: "Invalid date format. Error parsing dates." },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    try {
      // If this period is active, deactivate all other periods
      if (isActive) {
        await prisma.enrollmentPeriod.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      // Create the enrollment period
      const enrollmentPeriod = await prisma.enrollmentPeriod.create({
        data: {
          name,
          description,
          startDate: start,
          endDate: end,
          isActive: isActive || false,
        },
      });

      return NextResponse.json({
        success: true,
        enrollmentPeriod,
      });
    } catch (error) {
      console.error("Error creating enrollment period:", error);
      return NextResponse.json(
        {
          error:
            "Failed to create enrollment period. Database may not be set up correctly.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating enrollment period:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment period" },
      { status: 500 }
    );
  }
}
