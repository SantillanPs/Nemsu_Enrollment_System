"use client";

import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Get the current page title based on the pathname
  const getPageTitle = () => {
    if (pathname === "/admin") return "Admin Dashboard";
    if (pathname === "/admin/courses") return "Course Management";
    if (pathname === "/admin/faculty") return "Faculty Management";
    if (pathname === "/admin/create-course") return "Create Course";

    // For dynamic routes
    if (pathname.startsWith("/admin/courses/")) {
      if (pathname.includes("/edit/")) return "Edit Course";
      return "Course Details";
    }

    if (pathname.startsWith("/admin/faculty/")) {
      if (pathname.includes("/edit/")) return "Edit Faculty";
      if (pathname.includes("/add")) return "Add Faculty";
      return "Faculty Details";
    }

    return "Admin Portal";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">{children}</div>
    </div>
  );
}
