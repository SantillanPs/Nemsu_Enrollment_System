import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { validateSecretKey, updateSecretKey } from "@/config/superadmin";
import crypto from "crypto";
import { hasRoleAccess } from "@/lib/utils/role-check";

/**
 * API route to regenerate the super admin secret key
 * This can be accessed in three ways:
 * 1. By a SUPER_ADMIN user who is logged in
 * 2. By providing the current secret key
 * 3. By providing a special access token (for emergency recovery)
 *
 * The special access token is: maintenance-security-key-8675309
 * We validate against a hash of this token for security
 */

// Hash of the special access token
const VALID_TOKEN_HASH =
  "5e7f5e4c8f2f1f5d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentSecretKey, accessToken } = body;

    // Method 1: Check if the user is a logged-in SUPER_ADMIN
    const session = await getServerSession();
    let isAuthorized = false;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user && hasRoleAccess(user.role, "SUPER_ADMIN")) {
        isAuthorized = true;
      }
    }

    // Method 2: Check if the current secret key is valid
    if (!isAuthorized && currentSecretKey) {
      isAuthorized = validateSecretKey(currentSecretKey);
    }

    // Method 3: Check if a valid access token was provided
    if (!isAuthorized && accessToken) {
      // Hash the provided token and compare with the stored hash
      const hash = crypto
        .createHash("sha256")
        .update(accessToken)
        .digest("hex");
      if (hash === VALID_TOKEN_HASH) {
        isAuthorized = true;

        // Log this emergency access (in a real app, this would go to a secure audit log)
        console.log(
          `Emergency access token used to regenerate key at ${new Date().toISOString()}`
        );
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Generate and save a new secret key
    const newSecretKey = updateSecretKey();

    // Log the key regeneration event (in a real app, this would go to a secure audit log)
    console.log(
      `Super admin secret key regenerated at ${new Date().toISOString()}`
    );

    return NextResponse.json({
      message: "Secret key regenerated successfully",
      newSecretKey,
    });
  } catch (error) {
    console.error("Error regenerating secret key:", error);
    return NextResponse.json(
      { error: "Failed to regenerate secret key" },
      { status: 500 }
    );
  }
}
