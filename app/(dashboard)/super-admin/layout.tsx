"use client";

import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Get the current page title based on the pathname
  const getPageTitle = () => {
    if (pathname === "/super-admin") return "Super Admin Dashboard";
    if (pathname === "/super-admin/users") return "User Management";
    if (pathname === "/super-admin/system") return "System Maintenance";
    if (pathname === "/super-admin/security") return "Security Management";

    // For dynamic routes
    if (pathname.startsWith("/super-admin/users/")) {
      if (pathname.includes("/edit/")) return "Edit User";
      return "User Details";
    }

    return "Super Admin Portal";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
        <div className="text-sm text-gray-500">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Super Admin
          </span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">{children}</div>
    </div>
  );
}
