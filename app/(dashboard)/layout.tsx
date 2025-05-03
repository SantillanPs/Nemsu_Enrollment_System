"use client";

import type React from "react";
import { useState, useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BookOpen,
  Users,
  Home,
  User,
  CheckSquare,
  PlusSquare,
} from "lucide-react";

import { StudentNavbar } from "../components/StudentNavbar";
import { StudentSidebar } from "../components/StudentSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const userRole = session.user.role?.toLowerCase() || "student";

  const navigation = {
    student: [
      { name: "Dashboard", href: "/student", icon: Home },
      {
        name: "My Courses",
        href: "/student/my-courses",
        icon: BookOpen,
      },
      {
        name: "Enroll Courses",
        href: "/student/courses",
        icon: BookOpen,
      },
    ],
    faculty: [
      { name: "Dashboard", href: "/faculty", icon: Home },
      {
        name: "My Courses",
        href: "/faculty/courses",
        icon: BookOpen,
      },
      {
        name: "Enrollment Requests",
        href: "/faculty/requests",
        icon: CheckSquare,
      },
      { name: "Students", href: "/faculty/students", icon: Users },
      { name: "Profile", href: "/faculty/profile", icon: User },
    ],
    admin: [
      { name: "Dashboard", href: "/admin", icon: Home },
      {
        name: "Manage Courses",
        href: "/admin/courses",
        icon: BookOpen,
      },
      {
        name: "Student Approvals",
        href: "/admin/student-approvals",
        icon: CheckSquare,
      },
      {
        name: "Faculty Management",
        href: "/admin/faculty",
        icon: Users,
      },
      {
        name: "Create Course",
        href: "/admin/create-course",
        icon: PlusSquare,
      },
    ],
  };

  const roleColors = {
    student: "bg-green-100 text-green-800",
    faculty: "bg-orange-100 text-orange-800",
    admin: "bg-blue-100 text-blue-800",
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex h-screen">
      <StudentSidebar />
      <div className="flex flex-1 flex-col">
        <StudentNavbar />
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
