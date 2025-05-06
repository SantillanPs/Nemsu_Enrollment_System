import { prisma } from "@/lib/db/client";
import { getUserById } from "@/lib/db/utils";
import { successResponse, errorResponse } from "@/lib/utils/api/response";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const { id } = await params;
    const user = await getUserById(id);
    if (!user) {
      return errorResponse("User not found", 404);
    }
    return successResponse(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return errorResponse("Failed to fetch user");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const { id } = await params;
    const body = await request.json();
    const user = await prisma.user.update({
      where: { id },
      data: {
        profile: {
          update: {
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            address: body.address,
          },
        },
      },
      include: {
        profile: true,
      },
    });
    const { password, ...safeUser } = user;
    return successResponse(safeUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return errorResponse("Failed to update user");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const { id } = await params;
    await prisma.user.delete({
      where: { id },
    });
    return successResponse(null, "User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
    return errorResponse("Failed to delete user");
  }
}
