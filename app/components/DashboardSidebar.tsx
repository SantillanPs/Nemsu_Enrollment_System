"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
    { name: "Enrollment Requests", href: "/faculty/requests", icon: CheckSquare },
    { name: "Students", href: "/faculty/students", icon: Users },
    { name: "Profile", href: "/faculty/profile", icon: User },
  ],
  admin: [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Manage Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Student Approvals", href: "/admin/student-approvals", icon: CheckSquare },
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

export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Default to student if role is not available
  const userRole = session?.user?.role?.toLowerCase() || "student";
  
  // Get the appropriate navigation items and portal title based on user role
  const navigation = navigationItems[userRole as keyof typeof navigationItems] || navigationItems.student;
  const portalTitle = portalTitles[userRole as keyof typeof portalTitles] || portalTitles.student;

  return (
    <div className="flex h-full w-56 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href={`/${userRole}`} className="flex items-center">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">{portalTitle}</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
