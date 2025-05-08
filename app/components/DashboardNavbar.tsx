"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, Bell, LogOut, Shield } from "lucide-react";
import { LoadingLink } from "@/components/ui/loading-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  UserRole,
  hasRoleAccess,
  getEffectiveRole,
} from "@/lib/utils/role-check";

interface DashboardNavbarProps {
  children?: React.ReactNode;
  activeSidebar?: string | null;
}

export function DashboardNavbar({
  children,
  activeSidebar,
}: DashboardNavbarProps) {
  const { data: session } = useSession();

  // Default to student if role is not available
  const userRole = session?.user?.role?.toLowerCase() || UserRole.STUDENT;

  // For super admins, determine the effective role based on the active sidebar
  const isUserSuperAdmin = hasRoleAccess(userRole, "SUPER_ADMIN");
  const effectiveRole = getEffectiveRole(userRole, activeSidebar);

  // Check if the user is a verified student
  const isVerifiedStudent =
    userRole === UserRole.STUDENT && session?.user?.isVerified;

  // Role-specific colors
  const roleColors = {
    student: {
      badge: "bg-green-100 text-green-800",
      avatar: "bg-green-600 border-green-200",
      avatarBg: "bg-green-100",
      avatarText: "text-green-600",
    },
    faculty: {
      badge: "bg-amber-100 text-amber-800",
      avatar: "bg-amber-600 border-amber-200",
      avatarBg: "bg-amber-100",
      avatarText: "text-amber-600",
    },
    admin: {
      badge: "bg-blue-100 text-blue-800",
      avatar: "bg-blue-600 border-blue-200",
      avatarBg: "bg-blue-100",
      avatarText: "text-blue-600",
    },
    super_admin: {
      badge: "bg-red-100 text-red-800",
      avatar: "bg-red-600 border-red-200",
      avatarBg: "bg-red-100",
      avatarText: "text-red-600",
    },
  };

  const roleTheme =
    roleColors[effectiveRole as keyof typeof roleColors] || roleColors.student;

  return (
    <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          {children}
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${roleTheme.badge}`}
            >
              {effectiveRole.charAt(0).toUpperCase() + effectiveRole.slice(1)}
            </span>

            {/* Show super admin badge when viewing other dashboards */}
            {isUserSuperAdmin && activeSidebar && (
              <Badge
                variant="outline"
                className={`flex items-center gap-1 ${
                  activeSidebar === "student"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : activeSidebar === "faculty"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : activeSidebar === "admin"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                <Shield className="h-3 w-3" />
                <span className="text-xs">Super Admin</span>
              </Badge>
            )}

            {/* Show verified badge for verified students */}
            {isVerifiedStudent && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
              >
                <Shield className="h-3 w-3" />
                <span className="text-xs">Verified</span>
              </Badge>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {/* Theme Toggle - Placeholder for future implementation */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-sun"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-help-circle"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar
                  className={`h-8 w-8 border-2 ${
                    effectiveRole === "student"
                      ? "border-green-200"
                      : effectiveRole === "faculty"
                      ? "border-amber-200"
                      : effectiveRole === "admin"
                      ? "border-blue-200"
                      : "border-red-200"
                  }`}
                >
                  <AvatarImage src={session?.user?.image || ""} alt="Profile" />
                  <AvatarFallback className={`${roleTheme.avatar} text-white`}>
                    {session?.user?.name?.charAt(0) ||
                      userRole.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2 border-b mb-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} alt="Profile" />
                  <AvatarFallback className={`${roleTheme.avatar} text-white`}>
                    {session?.user?.name?.charAt(0) ||
                      userRole.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.email || ""}
                  </p>
                </div>
              </div>
              <DropdownMenuItem asChild>
                <LoadingLink
                  href={`/${effectiveRole}/profile`}
                  className="flex items-center cursor-pointer"
                  loaderSize={4}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </LoadingLink>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
