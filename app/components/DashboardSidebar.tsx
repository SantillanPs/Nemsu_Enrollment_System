"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Users,
  Calendar,
  PlusSquare,
  FileText,
  GraduationCap,
  LogOut,
  Shield,
  Key,
  Settings,
  Server,
  UserPlus,
  SwitchCamera,
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the navigation item interface
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }> | (() => null);
  isDivider?: boolean;
}

// Define navigation items for each role
const navigationItems: Record<string, NavigationItem[]> = {
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
      name: "Available Courses",
      href: "/faculty/available-courses",
      icon: PlusSquare,
    },

    { name: "Student Documents", href: "/faculty/documents", icon: FileText },
  ],
  admin: [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Manage Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Faculty Management", href: "/admin/faculty", icon: Users },
    { name: "Create Course", href: "/admin/create-course", icon: PlusSquare },
    {
      name: "Enrollment Periods",
      href: "/admin/enrollment-periods",
      icon: Calendar,
    },
  ],
  super_admin: [
    { name: "Dashboard", href: "/super-admin", icon: Home },
    { name: "User Management", href: "/super-admin/users", icon: Users },
    { name: "System Maintenance", href: "/super-admin/system", icon: Server },
    { name: "Security", href: "/super-admin/security", icon: Shield },
    {
      name: "Key Management",
      href: "/system-maintenance/security/key-management/maintenance-security-key-8675309",
      icon: Key,
    },
    {
      name: "Create Super Admin",
      href: "/super-admin-creation",
      icon: UserPlus,
    },
  ],
};

// Define portal titles for each role
const portalTitles = {
  student: "Student Portal",
  faculty: "Faculty Portal",
  admin: "Admin Portal",
  super_admin: "Super Admin Portal",
};

interface DashboardSidebarProps {
  onCloseSidebar?: () => void;
  activeSidebar?: string | null;
  onSidebarChange?: (sidebar: string | null) => void;
}

export function DashboardSidebar({
  onCloseSidebar,
  activeSidebar: propActiveSidebar,
  onSidebarChange,
}: DashboardSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Use local state if no external state management is provided
  const [localActiveSidebar, setLocalActiveSidebar] = useState<string | null>(
    null
  );

  // Use either the prop value or local state
  const activeSidebar =
    propActiveSidebar !== undefined ? propActiveSidebar : localActiveSidebar;

  // Function to update the sidebar state
  const updateSidebar = (value: string | null) => {
    if (onSidebarChange) {
      onSidebarChange(value);
    } else {
      setLocalActiveSidebar(value);
    }
  };

  // Get the user's actual role
  const userRole = session?.user?.role?.toLowerCase() || "student";

  // For super admins, allow switching between sidebars
  // For other users, just use their role
  const effectiveRole =
    userRole === "super_admin" && activeSidebar ? activeSidebar : userRole;

  // Define role-specific color themes
  const roleThemes = {
    student: {
      gradient: "from-green-600 to-green-700",
      active: "bg-green-50 text-green-700",
      activeIcon: "text-green-600",
      hover: "hover:bg-green-50 hover:text-green-700",
      hoverIcon: "group-hover:text-green-600",
      avatar: "bg-green-100 text-green-600",
      darkActive: "dark:bg-green-900/20 dark:text-green-300",
      darkActiveIcon: "dark:text-green-400",
      darkHover: "dark:hover:text-green-300 dark:hover:bg-green-900/20",
      darkHoverIcon: "dark:group-hover:text-green-400",
    },
    faculty: {
      gradient: "from-amber-600 to-amber-700",
      active: "bg-amber-50 text-amber-700",
      activeIcon: "text-amber-600",
      hover: "hover:bg-amber-50 hover:text-amber-700",
      hoverIcon: "group-hover:text-amber-600",
      avatar: "bg-amber-100 text-amber-600",
      darkActive: "dark:bg-amber-900/20 dark:text-amber-300",
      darkActiveIcon: "dark:text-amber-400",
      darkHover: "dark:hover:text-amber-300 dark:hover:bg-amber-900/20",
      darkHoverIcon: "dark:group-hover:text-amber-400",
    },
    admin: {
      gradient: "from-blue-600 to-blue-700",
      active: "bg-blue-50 text-blue-700",
      activeIcon: "text-blue-600",
      hover: "hover:bg-blue-50 hover:text-blue-700",
      hoverIcon: "group-hover:text-blue-600",
      avatar: "bg-blue-100 text-blue-600",
      darkActive: "dark:bg-blue-900/20 dark:text-blue-300",
      darkActiveIcon: "dark:text-blue-400",
      darkHover: "dark:hover:text-blue-300 dark:hover:bg-blue-900/20",
      darkHoverIcon: "dark:group-hover:text-blue-400",
    },
    super_admin: {
      gradient: "from-red-600 to-red-800",
      active: "bg-red-50 text-red-700",
      activeIcon: "text-red-600",
      hover: "hover:bg-red-50 hover:text-red-700",
      hoverIcon: "group-hover:text-red-600",
      avatar: "bg-red-100 text-red-600",
      darkActive: "dark:bg-red-900/20 dark:text-red-300",
      darkActiveIcon: "dark:text-red-400",
      darkHover: "dark:hover:text-red-300 dark:hover:bg-red-900/20",
      darkHoverIcon: "dark:group-hover:text-red-400",
    },
  };

  // Get the theme for the current role
  const currentTheme =
    roleThemes[effectiveRole as keyof typeof roleThemes] || roleThemes.student;

  // Get the appropriate navigation items and portal title based on user role
  const navigation =
    navigationItems[effectiveRole as keyof typeof navigationItems] ||
    navigationItems.student;
  const portalTitle =
    portalTitles[effectiveRole as keyof typeof portalTitles] ||
    portalTitles.student;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white dark:bg-gray-800 shadow-sm">
      <div
        className={`flex h-16 items-center justify-between border-b px-6 bg-gradient-to-r ${currentTheme.gradient}`}
      >
        <Link href={`/${effectiveRole}`} className="flex items-center">
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
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${currentTheme.avatar}`}
          >
            <span className="font-semibold">
              {session?.user?.name?.charAt(0) ||
                effectiveRole.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {effectiveRole.charAt(0).toUpperCase() + effectiveRole.slice(1)}
              {userRole === "super_admin" && activeSidebar && (
                <span
                  className={`ml-1 ${
                    activeSidebar === "student"
                      ? "text-green-500"
                      : activeSidebar === "faculty"
                      ? "text-amber-500"
                      : activeSidebar === "admin"
                      ? "text-blue-500"
                      : "text-red-500"
                  }`}
                >
                  (Viewing)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navigation.map((item) => {
          // Handle dividers
          if (item.isDivider) {
            return (
              <div key={item.name}>
                <div className="my-2 border-t border-gray-200"></div>
                <div className="py-2 text-xs text-gray-500 text-center">
                  {item.name}
                </div>
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? `${currentTheme.active} ${currentTheme.darkActive}`
                  : `text-gray-700 ${currentTheme.hover} dark:text-gray-300 ${currentTheme.darkHover}`
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    isActive
                      ? `${currentTheme.activeIcon} ${currentTheme.darkActiveIcon}`
                      : `text-gray-500 ${currentTheme.hoverIcon} dark:text-gray-400 ${currentTheme.darkHoverIcon}`
                  )}
                />
              )}
              {item.name}
            </Link>
          );
        })}
      </nav>
      {/* Show sidebar switcher only for super admins */}
      {userRole === "super_admin" && (
        <div className="p-4 border-t">
          <div className="flex items-center mb-2">
            <SwitchCamera
              className={`h-5 w-5 mr-2 ${
                userRole === "super_admin" ? "text-red-500" : ""
              }`}
            />
            <h3 className="font-medium text-gray-700">Switch Dashboard</h3>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            View different dashboards while maintaining super admin access.
          </p>
          <Select
            value={activeSidebar || "super_admin"}
            onValueChange={(value) => {
              updateSidebar(value === "super_admin" ? null : value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select dashboard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin Dashboard</SelectItem>
              <SelectItem value="student">Student Dashboard</SelectItem>
              <SelectItem value="faculty">Faculty Dashboard</SelectItem>
              <SelectItem value="admin">Admin Dashboard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

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
