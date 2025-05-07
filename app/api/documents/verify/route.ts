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

    // Get the document with profile information
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        profile: true,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // If the student is already verified, automatically mark the document as verified
    const documentStatus = existingDocument.profile.isVerified
      ? ("VERIFIED" as VerificationStatus)
      : (status as VerificationStatus);

    // Update document status
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: documentStatus,
        verificationMessage: existingDocument.profile.isVerified
          ? "Automatically verified because student account is verified"
          : message,
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

    // Get the profile with all documents
    const profile = await prisma.profile.findUnique({
      where: { id: document.profileId },
      include: { documents: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // If the profile is already verified, update all documents to verified status
    if (profile.isVerified) {
      // Update all documents to verified status
      await prisma.document.updateMany({
        where: {
          profileId: profile.id,
          status: { not: "VERIFIED" }, // Only update non-verified documents
        },
        data: {
          status: "VERIFIED",
          verificationMessage:
            "Automatically verified because student account is verified",
        },
      });

      console.log(
        `All documents for profile ${profile.id} have been automatically verified because the student account is verified.`
      );
    }
    // Otherwise, if document is verified or rejected, check all documents and update profile status
    else if (status === "VERIFIED" || status === "REJECTED") {
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
