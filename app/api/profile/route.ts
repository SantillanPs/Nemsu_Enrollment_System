import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/profile
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        profile: true,
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate academic information
    const completedEnrollments = user.enrollments.filter(
      (enrollment) => enrollment.status === "COMPLETED"
    );

    const totalCredits = completedEnrollments.reduce(
      (sum, enrollment) => sum + enrollment.course.credits,
      0
    );

    const gpa = calculateGPA(completedEnrollments);

    return NextResponse.json({
      profile: user.profile,
      academic: {
        totalCredits,
        gpa,
        enrollmentStatus: totalCredits >= 12 ? "Full-time" : "Part-time",
        academicStatus: gpa >= 2.0 ? "Good Standing" : "Academic Probation",
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth,
        phone: body.phone,
        address: body.address,
        userId: user.id,
      },
      update: {
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth,
        phone: body.phone,
        address: body.address,
      },
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate GPA
function calculateGPA(enrollments: any[]) {
  if (enrollments.length === 0) return 0;

  const gradePoints: { [key: string]: number } = {
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    F: 0.0,
  };

  let totalPoints = 0;
  let totalCredits = 0;

  enrollments.forEach((enrollment) => {
    if (enrollment.grade && gradePoints[enrollment.grade]) {
      totalPoints += gradePoints[enrollment.grade] * enrollment.course.credits;
      totalCredits += enrollment.course.credits;
    }
  });

  return totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0;
}
