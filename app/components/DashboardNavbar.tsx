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

export function DashboardNavbar() {
  const { data: session } = useSession();
  
  // Default to student if role is not available
  const userRole = session?.user?.role?.toLowerCase() || "student";
  
  // Role-specific badge colors
  const roleColors = {
    student: "bg-green-100 text-green-800",
    faculty: "bg-orange-100 text-orange-800",
    admin: "bg-blue-100 text-blue-800",
  };
  
  const roleBadgeColor = roleColors[userRole as keyof typeof roleColors] || roleColors.student;

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${roleBadgeColor}`}>
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} alt="Profile" />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || userRole.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem asChild>
                <Link href={`/${userRole}/profile`} className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-red-600"
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
