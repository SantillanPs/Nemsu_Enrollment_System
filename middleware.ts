import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  if (isAuthPage) {
    if (token) {
      // If user is already logged in, redirect to their role-specific dashboard
      const role = token.role?.toLowerCase() || "student";
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    // Allow access to auth pages if not logged in
    return NextResponse.next();
  }

  // Check protected routes
  if (
    request.nextUrl.pathname.startsWith("/student") ||
    request.nextUrl.pathname.startsWith("/faculty") ||
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    if (!token) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = token.role?.toLowerCase();
    const requestedPath = request.nextUrl.pathname.split("/")[1];

    // Check if user has access to the requested role's routes
    if (role !== requestedPath) {
      // Redirect to their appropriate dashboard if trying to access wrong role's routes
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/login",
    "/signup",
    "/student/:path*",
    "/faculty/:path*",
    "/admin/:path*",
  ],
};
