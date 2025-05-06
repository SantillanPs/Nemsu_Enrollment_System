import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["FACULTY", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, status, message } = body;

    if (!documentId || !status) {
      return NextResponse.json(
        { error: "Document ID and status are required" },
        { status: 400 }
      );
    }

    // Update document status
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: status as VerificationStatus,
        verificationMessage: message,
      },
      include: {
        profile: true,
      },
    });

    // Define required document types
    const requiredDocumentTypes = [
      "TOR",
      "BIRTH_CERTIFICATE",
      "GRADES",
      "CLEARANCE",
    ];

    // If document is verified or rejected, check all documents and update profile status
    if (status === "VERIFIED" || status === "REJECTED") {
      const profile = await prisma.profile.findUnique({
        where: { id: document.profileId },
        include: { documents: true },
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 }
        );
      }

      // Check if all required documents are submitted
      const hasAllRequiredDocuments = requiredDocumentTypes.every((type) =>
        profile.documents.some((doc) => doc.type === type)
      );

      // Check if all documents are verified
      const allVerified =
        hasAllRequiredDocuments &&
        profile.documents.every((doc) => doc.status === "VERIFIED");

      // Update profile verification status
      await prisma.profile.update({
        where: { id: document.profileId },
        data: { isVerified: allVerified },
      });

      // Log the verification status
      console.log(
        `Profile ${document.profileId} verification status updated to ${allVerified}. ` +
          `Has all required documents: ${hasAllRequiredDocuments}. ` +
          `All documents verified: ${allVerified}.`
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error verifying document:", error);
    return NextResponse.json(
      { error: "Failed to verify document" },
      { status: 500 }
    );
  }
}
