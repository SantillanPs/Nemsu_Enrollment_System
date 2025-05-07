import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import {
  createFacultyInvitation,
  getInvitationUrl,
} from "@/lib/utils/invitation";
import { z } from "zod";
import { hasRoleAccess } from "@/lib/utils/role-check";

// Schema for invitation creation
const invitationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  expirationDays: z.number().int().min(1).max(30).optional(),
});

// GET handler to list all invitations
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is an admin or super admin
    if (!hasRoleAccess(user.role, "ADMIN")) {
      return NextResponse.json(
        { error: "Only administrators can access this endpoint" },
        { status: 403 }
      );
    }

    // Get all faculty invitations
    const invitations = await prisma.facultyInvitation.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Add invitation URLs to the response
    const invitationsWithUrls = invitations.map((invitation) => ({
      ...invitation,
      invitationUrl: getInvitationUrl(invitation.token),
    }));

    return NextResponse.json(invitationsWithUrls);
  } catch (error) {
    console.error("Error fetching faculty invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch faculty invitations" },
      { status: 500 }
    );
  }
}

// POST handler to create a new invitation
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is an admin or super admin
    if (!hasRoleAccess(user.role, "ADMIN")) {
      return NextResponse.json(
        { error: "Only administrators can create faculty invitations" },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = invitationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, expirationDays = 7 } = validationResult.data;

    // Check if the email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Create the invitation
    let invitation;
    try {
      invitation = await createFacultyInvitation(
        email,
        user.id,
        expirationDays
      );
    } catch (error) {
      console.error("Error creating faculty invitation:", error);
      return NextResponse.json(
        { error: "Failed to create faculty invitation. Please try again." },
        { status: 500 }
      );
    }

    // Generate the invitation URL
    const invitationUrl = getInvitationUrl(invitation.token);

    return NextResponse.json({
      invitation: {
        ...invitation,
        invitationUrl,
      },
      message: "Faculty invitation created successfully",
    });
  } catch (error) {
    console.error("Error creating faculty invitation:", error);
    return NextResponse.json(
      { error: "Failed to create faculty invitation" },
      { status: 500 }
    );
  }
}
