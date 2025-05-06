import { NextResponse } from "next/server";

/**
 * API route to get system statistics for the super admin dashboard
 * This is a simplified version that returns mock data
 */
export async function GET() {
  // Return mock data without any authentication checks for now
  // In a production app, you would implement proper authentication
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
}
