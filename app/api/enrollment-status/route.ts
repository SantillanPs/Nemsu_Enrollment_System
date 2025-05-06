import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    try {
      // Find active enrollment period that includes the current date
      const activeEnrollmentPeriod = await prisma.enrollmentPeriod.findFirst({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      });

      // Find upcoming enrollment periods
      const upcomingEnrollmentPeriods = await prisma.enrollmentPeriod.findMany({
        where: {
          isActive: true,
          startDate: { gt: now },
        },
        orderBy: {
          startDate: "asc",
        },
        take: 1,
      });

      const isEnrollmentOpen = !!activeEnrollmentPeriod;
      const nextEnrollmentPeriod =
        upcomingEnrollmentPeriods.length > 0
          ? upcomingEnrollmentPeriods[0]
          : null;

      return NextResponse.json({
        isEnrollmentOpen,
        currentPeriod: activeEnrollmentPeriod,
        nextPeriod: nextEnrollmentPeriod,
      });
    } catch (error) {
      console.error("Error accessing enrollment periods:", error);
      // If there's an error (like table doesn't exist), return default values
      return NextResponse.json({
        isEnrollmentOpen: true, // Default to open enrollment if table doesn't exist
        currentPeriod: null,
        nextPeriod: null,
      });
    }
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    return NextResponse.json(
      { error: "Failed to check enrollment status" },
      { status: 500 }
    );
  }
}
