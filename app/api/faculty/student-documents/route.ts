import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a faculty member
    if (!session?.user || !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all student documents
    const documents = await prisma.document.findMany({
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
            isVerified: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching student documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch student documents" },
      { status: 500 }
    );
  }
}
