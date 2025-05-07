import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

// Define the InvitationStatus enum to match the database
export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  EXPIRED = "EXPIRED",
}

// Define the FacultyInvitation type
export type FacultyInvitation = {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  status: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Generate a random token for faculty invitations
 * @returns A random token string
 */
export const generateInvitationToken = (): string => {
  return randomBytes(32).toString("hex");
};

/**
 * Create a new faculty invitation
 * @param email Email address for the invitation
 * @param adminId ID of the admin creating the invitation
 * @param expirationDays Number of days until the invitation expires (default: 7)
 * @returns The created invitation object
 */
export const createFacultyInvitation = async (
  email: string,
  adminId: string,
  expirationDays: number = 7
): Promise<FacultyInvitation> => {
  try {
    // Check if there's an existing invitation for this email
    const existingInvitation = await prisma.facultyInvitation.findUnique({
      where: { email },
    });

    // If there's an existing invitation, delete it
    if (existingInvitation) {
      await prisma.facultyInvitation.delete({
        where: { id: existingInvitation.id },
      });
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // Generate a unique token
    const token = generateInvitationToken();

    // Create the invitation
    const invitation = await prisma.facultyInvitation.create({
      data: {
        email,
        token,
        expiresAt,
        createdBy: adminId,
        status: InvitationStatus.PENDING,
      },
    });

    return invitation;
  } catch (error) {
    console.error("Error creating faculty invitation:", error);
    throw new Error("Failed to create faculty invitation");
  }
};

/**
 * Validate a faculty invitation token
 * @param token The token to validate
 * @returns The invitation if valid, null if invalid or expired
 */
export const validateInvitationToken = async (
  token: string
): Promise<FacultyInvitation | null> => {
  // Find the invitation by token
  const invitation = await prisma.facultyInvitation.findFirst({
    where: { token },
  });

  // If no invitation found or it's already accepted, return null
  if (!invitation || invitation.status === InvitationStatus.ACCEPTED) {
    return null;
  }

  // Check if the invitation has expired
  const now = new Date();
  if (now > invitation.expiresAt) {
    // Update the invitation status to EXPIRED
    await prisma.facultyInvitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.EXPIRED },
    });
    return null;
  }

  return invitation;
};

/**
 * Mark an invitation as accepted
 * @param token The invitation token
 * @returns The updated invitation
 */
export const markInvitationAsAccepted = async (
  token: string
): Promise<FacultyInvitation | null> => {
  try {
    // Find the invitation first
    const invitation = await prisma.facultyInvitation.findFirst({
      where: { token },
    });

    if (!invitation) {
      console.error("Invitation not found for token:", token);
      return null;
    }

    // Update the invitation
    const updatedInvitation = await prisma.facultyInvitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED },
    });

    return updatedInvitation;
  } catch (error) {
    console.error("Error marking invitation as accepted:", error);
    return null;
  }
};

/**
 * Get the invitation URL for a given token
 * @param token The invitation token
 * @returns The full URL for the faculty signup page with the token
 */
export const getInvitationUrl = (token: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/faculty-signup?token=${token}`;
};
