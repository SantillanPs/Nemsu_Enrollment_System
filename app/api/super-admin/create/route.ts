import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validateSecretKey } from "@/config/superadmin";

/**
 * Creates a super admin user with full system access
 * This endpoint is protected by a secret key and should not be exposed in the UI
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, secretKey } = body;

    // Validate the secret key
    if (!secretKey || !validateSecretKey(secretKey)) {
      // Return a generic error to prevent enumeration attacks
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create super admin user with profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "SUPER_ADMIN", // Special role with full access
        profile: {
          create: {
            firstName,
            lastName,
            dateOfBirth: new Date(), // Default date
            phone: "",
            address: "",
            isVerified: true, // Super admin is verified by default
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Remove password from response
    const { password: _, ...safeUser } = user;

    return NextResponse.json(
      {
        data: safeUser,
        message: "Super admin created successfully",
        accessInfo:
          "This user has full system access. Keep credentials secure.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating super admin:", error);
    return NextResponse.json(
      { error: "Failed to create super admin" },
      { status: 500 }
    );
  }
}
