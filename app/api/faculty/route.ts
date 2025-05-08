import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

export async function GET() {
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

    // Check if user is an admin or super admin
    if (!hasRoleAccess(user.role, "ADMIN")) {
      return NextResponse.json(
        { error: "Only administrators can access this endpoint" },
        { status: 403 }
      );
    }

    // Get all faculty members with their profiles
    const facultyMembers = await prisma.user.findMany({
      where: {
        role: "FACULTY",
      },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address: true,
          },
        },
      },
      orderBy: {
        profile: {
          firstName: "asc",
        },
      },
    });

    // Remove sensitive information
    const safeFacultyMembers = facultyMembers.map((faculty) => {
      const { password, ...safeFaculty } = faculty;
      return safeFaculty;
    });

    return NextResponse.json(safeFacultyMembers);
  } catch (error) {
    console.error("Error fetching faculty members:", error);
    return NextResponse.json(
      { error: "Failed to fetch faculty members" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
