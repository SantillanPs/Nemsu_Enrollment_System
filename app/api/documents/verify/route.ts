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

    // If all documents are verified, update profile status
    if (status === "VERIFIED") {
      const profile = await prisma.profile.findUnique({
        where: { id: document.profileId },
        include: { documents: true },
      });

      const allVerified = profile?.documents.every(
        (doc) => doc.status === "VERIFIED"
      );

      if (allVerified) {
        await prisma.profile.update({
          where: { id: document.profileId },
          data: { isVerified: true },
        });
      }
    } else if (status === "REJECTED") {
      // If any document is rejected, set profile as unverified
      await prisma.profile.update({
        where: { id: document.profileId },
        data: { isVerified: false },
      });
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
