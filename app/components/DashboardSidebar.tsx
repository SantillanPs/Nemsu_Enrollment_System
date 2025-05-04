"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Users,
  User,
  CheckSquare,
  PlusSquare,
  FileText,
  GraduationCap,
  LogOut,
} from "lucide-react";

// Define navigation items for each role
const navigationItems = {
  student: [
    { name: "Dashboard", href: "/student", icon: Home },
    { name: "My Courses", href: "/student/my-courses", icon: BookOpen },
    { name: "Enroll Courses", href: "/student/courses", icon: PlusSquare },
    { name: "Documents", href: "/student/profile/documents", icon: FileText },
  ],
  faculty: [
    { name: "Dashboard", href: "/faculty", icon: Home },
    { name: "My Courses", href: "/faculty/courses", icon: BookOpen },
    {
      name: "Enrollment Requests",
      href: "/faculty/requests",
      icon: CheckSquare,
    },
    { name: "Student Documents", href: "/faculty/documents", icon: FileText },
  ],
  admin: [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Manage Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Faculty Management", href: "/admin/faculty", icon: Users },
    { name: "Create Course", href: "/admin/create-course", icon: PlusSquare },
  ],
};

// Define portal titles for each role
const portalTitles = {
  student: "Student Portal",
  faculty: "Faculty Portal",
  admin: "Admin Portal",
};

interface DashboardSidebarProps {
  onCloseSidebar?: () => void;
}

export function DashboardSidebar({ onCloseSidebar }: DashboardSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Default to student if role is not available
  const userRole = session?.user?.role?.toLowerCase() || "student";

  // Get the appropriate navigation items and portal title based on user role
  const navigation =
    navigationItems[userRole as keyof typeof navigationItems] ||
    navigationItems.student;
  const portalTitle =
    portalTitles[userRole as keyof typeof portalTitles] || portalTitles.student;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex h-16 items-center justify-between border-b px-6 bg-gradient-to-r from-blue-600 to-indigo-700">
        <Link href={`/${userRole}`} className="flex items-center">
          <GraduationCap className="h-6 w-6 text-white" />
          <span className="ml-2 text-lg font-semibold text-white">
            {portalTitle}
          </span>
        </Link>
        {onCloseSidebar && (
          <button
            onClick={onCloseSidebar}
            className="text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {session?.user?.name?.charAt(0) ||
                userRole.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "hover:bg-blue-50 text-gray-700 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
