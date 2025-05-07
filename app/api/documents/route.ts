import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile with documents
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { documents: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile.documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      console.error("Document upload failed: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Document uploads are suspended
    console.log(
      "Document upload attempt rejected: Document uploads are suspended"
    );
    return NextResponse.json(
      {
        error:
          "Document uploads are currently suspended. Please contact the administration for more information.",
      },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error handling document upload:", error);
    return NextResponse.json(
      { error: "Failed to process document upload" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Document management is suspended
    console.log(
      "Document deletion attempt rejected: Document management is suspended"
    );
    return NextResponse.json(
      {
        error:
          "Document management is currently suspended. Please contact the administration for more information.",
      },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error handling document deletion:", error);
    return NextResponse.json(
      { error: "Failed to process document deletion" },
      { status: 500 }
    );
  }
}
