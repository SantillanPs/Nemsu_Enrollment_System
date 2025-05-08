import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";
import { assignSectionsForCourse } from "@/lib/utils/section-assignment";

// Assign students to sections
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
        { error: "Only admins can assign students to sections" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Use the utility function to assign sections
    const result = await assignSectionsForCourse(courseId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error assigning students to sections:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to assign students to sections",
      },
      { status: 500 }
    );
  }
}
