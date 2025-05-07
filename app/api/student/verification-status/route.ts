import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile with documents
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: {
          include: {
            documents: true,
          },
        },
      },
    });

    if (!user?.profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Define required document types
    const requiredDocumentTypes: DocumentType[] = [
      "TOR",
      "BIRTH_CERTIFICATE",
      "GRADES",
      "CLEARANCE",
    ];

    const documents = user.profile.documents || [];
    
    // Check which documents are missing or pending
    const pendingDocuments: string[] = [];
    
    // Check if all required documents are submitted
    const missingDocuments = requiredDocumentTypes.filter(
      (type) => !documents.some((doc) => doc.type === type)
    );
    
    // Add missing documents to pending list
    missingDocuments.forEach(type => pendingDocuments.push(type));
    
    // Check if any submitted documents are not verified
    const unverifiedDocuments = documents.filter(
      (doc) => doc.status !== "VERIFIED"
    );
    
    // Add unverified documents to pending list if not already in the list
    unverifiedDocuments.forEach(doc => {
      if (!pendingDocuments.includes(doc.type)) {
        pendingDocuments.push(doc.type);
      }
    });

    // Check if all required documents are submitted
    const hasAllDocuments = missingDocuments.length === 0;

    return NextResponse.json({
      isVerified: user.profile.isVerified,
      pendingDocuments,
      hasAllDocuments,
    });
  } catch (error) {
    console.error("Error checking verification status:", error);
    return NextResponse.json(
      { error: "Failed to check verification status" },
      { status: 500 }
    );
  }
}
