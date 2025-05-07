import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "@/app/constants/documents";

export async function GET() {
  try {
    console.log("Fetching student verification status...");
    const session = await getServerSession();

    if (!session?.user?.email) {
      console.log("Unauthorized: No user email in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`Fetching profile for user: ${session.user.email}`);

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

    console.log(`User found: ${!!user}, Has profile: ${!!user?.profile}`);

    if (!user?.profile) {
      console.log(`Profile not found for user: ${session.user.email}`);

      // Instead of returning a 404 error, return a default response
      // This allows the frontend to continue working even if the profile is missing
      return NextResponse.json({
        isVerified: false,
        pendingDocuments: ["PROFILE_MISSING"],
        hasAllDocuments: false,
        profileMissing: true,
      });
    }

    console.log(`User verification status: ${user.profile.isVerified}`);
    console.log(`Documents count: ${user.profile.documents.length}`);

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
    missingDocuments.forEach((type) => pendingDocuments.push(type));

    // Check if any submitted documents are not verified
    const unverifiedDocuments = documents.filter(
      (doc) => doc.status !== "VERIFIED"
    );

    // Add unverified documents to pending list if not already in the list
    unverifiedDocuments.forEach((doc) => {
      if (!pendingDocuments.includes(doc.type)) {
        pendingDocuments.push(doc.type);
      }
    });

    // Check if all required documents are submitted
    const hasAllDocuments = missingDocuments.length === 0;

    console.log(`Missing documents: ${missingDocuments.length}`);
    console.log(`Pending documents: ${pendingDocuments.length}`);
    console.log(`Has all documents: ${hasAllDocuments}`);

    const response = {
      isVerified: user.profile.isVerified,
      pendingDocuments,
      hasAllDocuments,
    };

    console.log("Returning verification status:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error checking verification status:", error);
    return NextResponse.json(
      { error: "Failed to check verification status" },
      { status: 500 }
    );
  }
}
