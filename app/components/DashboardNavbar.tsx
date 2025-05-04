"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, Bell, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardNavbarProps {
  children?: React.ReactNode;
}

export function DashboardNavbar({ children }: DashboardNavbarProps) {
  const { data: session } = useSession();

  // Default to student if role is not available
  const userRole = session?.user?.role?.toLowerCase() || "student";

  // Role-specific badge colors
  const roleColors = {
    student: "bg-green-100 text-green-800",
    faculty: "bg-orange-100 text-orange-800",
    admin: "bg-blue-100 text-blue-800",
  };

  const roleBadgeColor =
    roleColors[userRole as keyof typeof roleColors] || roleColors.student;

  return (
    <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          {children}
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${roleBadgeColor}`}
          >
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
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
                <Avatar className="h-8 w-8 border-2 border-blue-100">
                  <AvatarImage src={session?.user?.image || ""} alt="Profile" />
                  <AvatarFallback className="bg-blue-600 text-white">
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
                  <AvatarFallback className="bg-blue-600 text-white">
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
                <Link
                  href={`/${userRole}/profile`}
                  className="flex items-center cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
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
