import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

/**
 * API endpoint for admins to directly verify student accounts
 * This allows admins to bypass the document verification process
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // Check if user is an admin or super admin
    if (!currentUser || !hasRoleAccess(currentUser.role, "ADMIN")) {
      return NextResponse.json(
        { error: "Only administrators can verify student accounts" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId, isVerified } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if the user exists and is a student
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "User is not a student" },
        { status: 400 }
      );
    }

    if (!user.profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Determine the verification status (default to true if not explicitly set to false)
    const verificationStatus = isVerified !== false;

    // Update the profile verification status
    const updatedProfile = await prisma.profile.update({
      where: { id: user.profile.id },
      data: { isVerified: verificationStatus },
    });

    // If the student is being verified, automatically verify all their documents
    if (verificationStatus) {
      // Update all documents to verified status
      await prisma.document.updateMany({
        where: {
          profileId: user.profile.id,
          status: { not: "VERIFIED" }, // Only update non-verified documents
        },
        data: {
          status: "VERIFIED",
          verificationMessage:
            "Automatically verified because student account is verified by admin",
        },
      });

      console.log(
        `All documents for student ${user.email} (${user.id}) have been automatically verified.`
      );
    }

    // Log the verification action
    console.log(
      `Student ${user.email} (${user.id}) ${
        verificationStatus ? "verified" : "unverified"
      } by admin ${currentUser.email} (${currentUser.id})`
    );

    return NextResponse.json({
      success: true,
      message: verificationStatus
        ? `Student verified successfully. All documents have been automatically verified.`
        : `Student unverified successfully.`,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error verifying student:", error);
    return NextResponse.json(
      { error: "Failed to verify student" },
      { status: 500 }
    );
  }
}
