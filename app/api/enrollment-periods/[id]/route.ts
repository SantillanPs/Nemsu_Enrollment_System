import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Get a specific enrollment period
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before accessing its properties
    const { id } = await params;

    try {
      const enrollmentPeriod = await prisma.enrollmentPeriod.findUnique({
        where: { id },
      });

      if (!enrollmentPeriod) {
        return NextResponse.json(
          { error: "Enrollment period not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ enrollmentPeriod });
    } catch (error) {
      console.error("Error fetching enrollment period:", error);
      return NextResponse.json(
        {
          error:
            "Failed to fetch enrollment period. Database may not be set up correctly.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching enrollment period:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollment period" },
      { status: 500 }
    );
  }
}

// Update an enrollment period
export async function PATCH(
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

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can update enrollment periods" },
        { status: 403 }
      );
    }

    // Await params before accessing its properties
    const { id } = await params;
    const body = await request.json();
    const { name, description, startDate, endDate, isActive } = body;

    // Check if enrollment period exists
    const existingPeriod = await prisma.enrollmentPeriod.findUnique({
      where: { id },
    });

    if (!existingPeriod) {
      return NextResponse.json(
        { error: "Enrollment period not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    console.log("Received dates for update:", { startDate, endDate });

    if (startDate !== undefined) {
      try {
        const start = new Date(startDate);
        console.log("Parsed start date:", start);

        if (isNaN(start.getTime())) {
          return NextResponse.json(
            { error: "Invalid start date format. Date could not be parsed." },
            { status: 400 }
          );
        }
        updateData.startDate = start;
      } catch (error) {
        console.error("Error parsing start date:", error);
        return NextResponse.json(
          { error: "Invalid start date format. Error parsing date." },
          { status: 400 }
        );
      }
    }

    if (endDate !== undefined) {
      try {
        const end = new Date(endDate);
        console.log("Parsed end date:", end);

        if (isNaN(end.getTime())) {
          return NextResponse.json(
            { error: "Invalid end date format. Date could not be parsed." },
            { status: 400 }
          );
        }
        updateData.endDate = end;
      } catch (error) {
        console.error("Error parsing end date:", error);
        return NextResponse.json(
          { error: "Invalid end date format. Error parsing date." },
          { status: 400 }
        );
      }
    }

    // Validate dates if both are provided
    if (updateData.startDate && updateData.endDate) {
      if (updateData.startDate >= updateData.endDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    } else if (updateData.startDate && existingPeriod.endDate) {
      if (updateData.startDate >= existingPeriod.endDate) {
        return NextResponse.json(
          { error: "Start date must be before existing end date" },
          { status: 400 }
        );
      }
    } else if (updateData.endDate && existingPeriod.startDate) {
      if (existingPeriod.startDate >= updateData.endDate) {
        return NextResponse.json(
          { error: "End date must be after existing start date" },
          { status: 400 }
        );
      }
    }

    // If this period is being activated, deactivate all other periods
    if (isActive !== undefined) {
      updateData.isActive = isActive;

      if (isActive) {
        await prisma.enrollmentPeriod.updateMany({
          where: {
            id: { not: id },
            isActive: true,
          },
          data: { isActive: false },
        });
      }
    }

    // Update the enrollment period
    const updatedPeriod = await prisma.enrollmentPeriod.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      enrollmentPeriod: updatedPeriod,
    });
  } catch (error) {
    console.error("Error updating enrollment period:", error);
    return NextResponse.json(
      { error: "Failed to update enrollment period" },
      { status: 500 }
    );
  }
}

// Delete an enrollment period
export async function DELETE(
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

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete enrollment periods" },
        { status: 403 }
      );
    }

    // Await params before accessing its properties
    const { id } = await params;

    // Check if enrollment period exists
    const existingPeriod = await prisma.enrollmentPeriod.findUnique({
      where: { id },
    });

    if (!existingPeriod) {
      return NextResponse.json(
        { error: "Enrollment period not found" },
        { status: 404 }
      );
    }

    try {
      // Delete the enrollment period
      await prisma.enrollmentPeriod.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Enrollment period deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting enrollment period:", error);
      return NextResponse.json(
        {
          error:
            "Failed to delete enrollment period. Database may not be set up correctly.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting enrollment period:", error);
    return NextResponse.json(
      { error: "Failed to delete enrollment period" },
      { status: 500 }
    );
  }
}
