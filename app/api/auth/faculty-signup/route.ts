import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  validateInvitationToken,
  markInvitationAsAccepted,
} from "@/lib/utils/invitation";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Received faculty signup data:", {
      ...data,
      password: "[REDACTED]",
    });

    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      phone,
      address,
      department,
      position,
      token,
    } = data;

    // Validate required fields
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !department ||
      !position ||
      !token
    ) {
      console.error("Missing required fields");
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Validate the invitation token
    let invitation;
    try {
      invitation = await validateInvitationToken(token);
      if (!invitation) {
        console.error("Invalid or expired invitation token");
        return NextResponse.json(
          { error: "Invalid or expired invitation token" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error validating invitation token:", error);
      return NextResponse.json(
        { error: "Error validating invitation token. Please try again." },
        { status: 500 }
      );
    }

    // Verify that the email matches the invitation
    if (invitation.email !== email) {
      console.error("Email does not match invitation");
      return NextResponse.json(
        { error: "Email does not match the invitation" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Email already registered:", email);
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Validate date of birth
    const dobDate = new Date(dateOfBirth);
    if (isNaN(dobDate.getTime())) {
      console.error("Invalid date of birth:", dateOfBirth);
      return NextResponse.json(
        { error: "Invalid date of birth" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "FACULTY",
        profile: {
          create: {
            firstName,
            lastName,
            dateOfBirth: dobDate,
            phone: phone || "",
            address: address || "",
            isVerified: true, // Faculty members are verified by default since they're invited
          },
        },
      },
      include: {
        profile: true,
      },
    });

    console.log("Faculty user created successfully:", {
      id: user.id,
      email: user.email,
    });

    // Mark the invitation as accepted
    try {
      const result = await markInvitationAsAccepted(token);
      if (!result) {
        console.warn(
          "Failed to mark invitation as accepted, but user was created"
        );
      }
    } catch (error) {
      console.error("Error marking invitation as accepted:", error);
      // Continue anyway since the user was created successfully
    }

    // Remove password from response
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      user: safeUser,
      message: "Faculty account created successfully. You can now login.",
    });
  } catch (error) {
    console.error("Error in faculty signup:", error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const field = error.meta?.target as string[];
        if (field?.includes("email")) {
          return NextResponse.json(
            { error: "Email already registered" },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create account",
      },
      { status: 500 }
    );
  }
}
