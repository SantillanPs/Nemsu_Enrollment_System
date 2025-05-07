import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

export async function GET() {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // Check if user is an admin or super admin
    if (!currentUser || !hasRoleAccess(currentUser.role, "ADMIN")) {
      return NextResponse.json(
        { error: "Only administrators can access student data" },
        { status: 403 }
      );
    }

    // Get all students with their profiles and documents
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      include: {
        profile: {
          include: {
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Remove sensitive information
    const safeStudents = students.map(student => {
      const { password, ...safeStudent } = student;
      return safeStudent;
    });

    return NextResponse.json(safeStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
