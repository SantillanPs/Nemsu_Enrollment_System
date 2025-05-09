import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hasRoleAccess } from "@/lib/utils/role-check";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Extract the id parameter from context
    const { id } = context.params;

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
        { error: "Only administrators can access student details" },
        { status: 403 }
      );
    }

    // Get the student with their profile and documents
    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            documents: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if the user is a student
    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { error: "User is not a student" },
        { status: 400 }
      );
    }

    // Remove sensitive information
    const { password, ...safeStudent } = student;

    return NextResponse.json(safeStudent);
  } catch (error) {
    console.error("Error fetching student details:", error);
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Extract the id parameter from context
    const { id } = context.params;

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
        { error: "Only administrators can update student information" },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { email, profile } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!profile || !profile.firstName || !profile.lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Check if the student exists
    const student = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if the user is a student
    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { error: "User is not a student" },
        { status: 400 }
      );
    }

    // Check if the email is already in use by another user
    if (email !== student.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { error: "Email is already in use by another user" },
          { status: 400 }
        );
      }
    }

    // Update the user and profile in a transaction
    const updatedStudent = await prisma.$transaction(async (tx) => {
      // Update the user
      const updatedUser = await tx.user.update({
        where: { id },
        data: { email },
      });

      // Update the profile
      const updatedProfile = await tx.profile.update({
        where: { id: student.profile.id },
        data: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          studentId: profile.studentId,
          dateOfBirth: profile.dateOfBirth
            ? new Date(profile.dateOfBirth)
            : undefined,
          phone: profile.phone,
          address: profile.address,
          schoolYear: profile.schoolYear,
          maxUnits: profile.maxUnits || 18, // Add maxUnits field with default of 18
        },
      });

      return {
        ...updatedUser,
        profile: updatedProfile,
      };
    });

    // Remove sensitive information
    const { password, ...safeStudent } = updatedStudent;

    return NextResponse.json({
      message: "Student updated successfully",
      student: safeStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}
