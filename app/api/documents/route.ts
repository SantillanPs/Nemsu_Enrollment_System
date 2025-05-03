import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as DocumentType;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: "File and document type are required" },
        { status: 400 }
      );
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { documents: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if document of this type already exists
    const existingDocument = profile.documents.find(
      (doc) => doc.type === documentType
    );

    if (existingDocument) {
      return NextResponse.json(
        { error: "Document of this type already exists" },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Upload the file to a storage service (e.g., AWS S3)
    // 2. Get the URL of the uploaded file
    // For this example, we'll use a placeholder URL
    const fileUrl = `https://storage.example.com/${profile.id}/${documentType}/${file.name}`;

    // Create document record
    const document = await prisma.document.create({
      data: {
        type: documentType,
        fileUrl,
        profileId: profile.id,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { documents: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if document belongs to user
    const document = profile.documents.find((doc) => doc.id === documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete document
    await prisma.document.delete({
      where: { id: documentId },
    });

    // In a real application, you would also delete the file from storage

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
