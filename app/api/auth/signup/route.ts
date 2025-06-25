import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Received signup data:", { ...data, password: "[REDACTED]" });

    const {
      email,
      password,
      firstName,
      lastName,
      studentId,
      schoolYear,
      dateOfBirth,
    } = data;

    // Validate required fields
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !studentId ||
      !schoolYear ||
      !dateOfBirth
    ) {
      console.error("Missing required fields:", {
        hasEmail: !!email,
        hasPassword: !!password,
        hasFirstName: !!firstName,
        hasLastName: !!lastName,
        hasStudentId: !!studentId,
        hasSchoolYear: !!schoolYear,
        hasDateOfBirth: !!dateOfBirth,
      });
      return NextResponse.json(
        { error: "All fields are required" },
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

    // Check if student ID already exists
    const existingStudentId = await prisma.profile.findUnique({
      where: { studentId },
    });

    if (existingStudentId) {
      console.log("Student ID already registered:", studentId);
      return NextResponse.json(
        { error: "Student ID already registered" },
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
        role: "STUDENT",
        profile: {
          create: {
            firstName,
            lastName,
            dateOfBirth: dobDate,
            studentId,
            schoolYear: parseInt(schoolYear),
            isVerified: false,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    console.log("User created successfully:", {
      id: user.id,
      email: user.email,
    });

    // Remove password from response
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      user: safeUser,
      message:
        "Account created successfully. You can now login and complete your profile.",
    });
  } catch (error) {
    console.error("Error in signup:", error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const field = error.meta?.target as string[];
        if (field?.includes("email")) {
          return NextResponse.json(
            { error: "Email already registered" },
            { status: 400 }
          );
        } else if (field?.includes("studentId")) {
          return NextResponse.json(
            { error: "Student ID already registered" },
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
  } finally {
    // Ensure Prisma connection is properly closed
    await prisma.$disconnect();
  }
}
