import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

// Get finished enrollment periods
export async function GET() {
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

    const now = new Date();

    // Find finished enrollment periods (past end date and not active)
    try {
      const finishedEnrollmentPeriods = await prisma.enrollmentPeriod.findMany({
        where: {
          endDate: { lt: now },
        },
        orderBy: {
          endDate: "desc",
        },
      });

      // Check if there are any finished enrollment periods
      const hasFinishedPeriods = finishedEnrollmentPeriods.length > 0;

      return NextResponse.json({
        hasFinishedPeriods,
        finishedPeriods: finishedEnrollmentPeriods,
      });
    } catch (error) {
      console.error("Error accessing enrollment periods:", error);
      // If there's an error (like table doesn't exist), return default values
      return NextResponse.json({
        hasFinishedPeriods: false,
        finishedPeriods: [],
      });
    }
  } catch (error) {
    console.error("Error checking finished enrollment periods:", error);
    return NextResponse.json(
      { error: "Failed to check finished enrollment periods" },
      { status: 500 }
    );
  }
}
