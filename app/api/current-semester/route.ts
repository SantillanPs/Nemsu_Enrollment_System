import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    // Find active enrollment period that includes the current date
    const activeEnrollmentPeriod = await prisma.enrollmentPeriod.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    // If there's no active enrollment period, find the most recent one
    if (!activeEnrollmentPeriod) {
      const mostRecentPeriod = await prisma.enrollmentPeriod.findFirst({
        where: {
          isActive: true,
        },
        orderBy: {
          endDate: "desc",
        },
      });

      if (mostRecentPeriod) {
        return NextResponse.json({
          semester: mostRecentPeriod.semester || "NONE",
          enrollmentPeriodId: mostRecentPeriod.id,
          isActive: false,
        });
      }

      // If there's no active enrollment period at all, return default values
      return NextResponse.json({
        semester: "NONE",
        enrollmentPeriodId: null,
        isActive: false,
      });
    }

    return NextResponse.json({
      semester: activeEnrollmentPeriod.semester || "NONE",
      enrollmentPeriodId: activeEnrollmentPeriod.id,
      isActive: true,
    });
  } catch (error) {
    console.error("Error fetching current semester:", error);
    return NextResponse.json(
      { error: "Failed to fetch current semester" },
      { status: 500 }
    );
  }
}
