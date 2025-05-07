import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

/**
 * API route to get system statistics for the super admin dashboard
 * This is a simplified version that returns mock data
 */
export async function GET() {
  try {
    // Check if the user is a logged-in SUPER_ADMIN
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // Check if user is a super admin
    if (!user || !hasRoleAccess(user.role, "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Only super admins can access this endpoint" },
        { status: 403 }
      );
    }

    // Return mock data for now
    return NextResponse.json({
      users: {
        total: 1350,
        students: 1248,
        faculty: 86,
        admins: 12,
        superAdmins: 4,
      },
      courses: {
        total: 142,
      },
      enrollments: {
        total: 3567,
      },
      system: {
        status: "Operational",
        uptime: "99.9%",
        lastRestart: "2 days ago",
      },
    });
  } catch (error) {
    console.error("Error fetching super admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch system statistics" },
      { status: 500 }
    );
  }
}
