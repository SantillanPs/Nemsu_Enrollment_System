import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    console.log(
      "Session in faculty/student-documents:",
      JSON.stringify(session, null, 2)
    );

    // Check if user is authenticated
    if (!session?.user) {
      console.log("No user in session");
      return NextResponse.json(
        { error: "Unauthorized - No user in session" },
        { status: 401 }
      );
    }

    // Get the current user from the database to ensure we have the role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    console.log("Current user from DB:", JSON.stringify(currentUser, null, 2));

    // Check if user is a faculty member, admin, or super admin
    if (
      !currentUser ||
      !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(currentUser.role)
    ) {
      console.log(`User role ${currentUser?.role} not authorized`);
      return NextResponse.json(
        { error: "Unauthorized - Not a faculty member, admin, or super admin" },
        { status: 401 }
      );
    }

    // Get all student profiles with documents
    const profiles = await prisma.profile.findMany({
      where: {
        user: {
          role: "STUDENT",
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentId: true,
        isVerified: true,
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Transform profiles into documents with profile information
    const documents = profiles.flatMap((profile) =>
      profile.documents.map((doc) => ({
        ...doc,
        profile: {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          studentId: profile.studentId,
          isVerified: profile.isVerified,
          user: profile.user,
        },
      }))
    );

    // If there are no documents, return an empty array
    if (documents.length === 0) {
      console.log("No student documents found");
      return NextResponse.json([]);
    }

    console.log(`Found ${documents.length} student documents`);
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching student documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch student documents" },
      { status: 500 }
    );
  }
}
