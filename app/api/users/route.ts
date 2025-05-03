import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ApiResponse, SafeUser } from "@/types";
import { DEFAULT_PAGINATION_LIMIT } from "@/config/constants";
import bcrypt from "bcryptjs";
import { PrismaClient, User, Profile } from "@prisma/client";

const prismaClient = new PrismaClient();

type UserWithProfile = User & {
  profile: Profile | null;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(
      searchParams.get("limit") ?? String(DEFAULT_PAGINATION_LIMIT)
    );
    const search = searchParams.get("search") ?? "";

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: search } },
            { profile: { firstName: { contains: search } } },
            { profile: { lastName: { contains: search } } },
          ],
        },
        include: {
          profile: true,
        },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: {
          OR: [
            { email: { contains: search } },
            { profile: { firstName: { contains: search } } },
            { profile: { lastName: { contains: search } } },
          ],
        },
      }),
    ]);

    const safeUsers = users.map((user) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return NextResponse.json({
      data: safeUsers,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    // Create user with profile
    const user = await prismaClient.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        role: body.role ?? "STUDENT",
        profile: {
          create: {
            firstName: body.firstName,
            lastName: body.lastName,
            dateOfBirth: body.dateOfBirth
              ? new Date(body.dateOfBirth)
              : new Date(),
            phone: body.phone || "",
            address: body.address || "",
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Remove password from response
    const { password, ...safeUser } = user;

    return NextResponse.json(
      { data: safeUser, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
