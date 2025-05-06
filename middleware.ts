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
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/faculty-signup");

  if (isAuthPage) {
    if (token) {
      // If user is already logged in, redirect to their role-specific dashboard
      let role = token.role?.toLowerCase() || "student";

      // Format the role for URL (replace underscore with hyphen)
      if (role === "super_admin") {
        role = "super-admin";
      } else {
        role = role.replace("_", "-");
      }

      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    // Allow access to auth pages if not logged in
    return NextResponse.next();
  }

  // Check protected routes
  if (
    request.nextUrl.pathname.startsWith("/student") ||
    request.nextUrl.pathname.startsWith("/faculty") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/super-admin")
  ) {
    if (!token) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", request.url));
    }

    let role = token.role?.toLowerCase();
    const requestedPath = request.nextUrl.pathname.split("/")[1];

    // Format the role for URL consistency (replace underscore with hyphen)
    let formattedRole = role;
    if (role === "super_admin") {
      formattedRole = "super-admin";
    } else if (role) {
      formattedRole = role.replace("_", "-");
    }

    // Super admin specific routes check
    if (requestedPath === "super-admin" && role !== "super_admin") {
      // Only super admins can access super admin routes
      return NextResponse.redirect(new URL(`/${formattedRole}`, request.url));
    }

    // Check if user has access to the requested role's routes
    // SUPER_ADMIN can access all routes
    if (role !== "super_admin" && formattedRole !== requestedPath) {
      // Redirect to their appropriate dashboard if trying to access wrong role's routes
      return NextResponse.redirect(new URL(`/${formattedRole}`, request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/login",
    "/signup",
    "/faculty-signup",
    "/student/:path*",
    "/faculty/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
    // Note: We're still not including the /super-admin creation page in the matcher
    // That page is protected by the secret key instead
  ],
};
