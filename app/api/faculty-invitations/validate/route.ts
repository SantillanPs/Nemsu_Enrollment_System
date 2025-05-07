import { NextResponse } from "next/server";
import { validateInvitationToken } from "@/lib/utils/invitation";
import { z } from "zod";

// Schema for token validation
const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = tokenSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { token } = validationResult.data;

    // Validate the token
    let invitation;
    try {
      invitation = await validateInvitationToken(token);

      if (!invitation) {
        return NextResponse.json(
          { error: "Invalid or expired invitation token" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error in token validation:", error);
      return NextResponse.json(
        { error: "Error validating invitation token. Please try again." },
        { status: 500 }
      );
    }

    // Return the invitation details (without the token for security)
    const { token: _, ...safeInvitation } = invitation;

    return NextResponse.json({
      invitation: safeInvitation,
      valid: true,
    });
  } catch (error) {
    console.error("Error validating faculty invitation:", error);
    return NextResponse.json(
      { error: "Failed to validate invitation token" },
      { status: 500 }
    );
  }
}
