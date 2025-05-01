"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  User,
  Bell,
  CheckSquare,
  PlusSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// This would come from authentication in a real app
const getUserRole = () => {
  // For demo purposes, we'll extract the role from the URL
  // In a real app, this would come from your auth system
  const pathname = usePathname();
  if (pathname?.includes("/admin")) return "admin";
  if (pathname?.includes("/faculty")) return "faculty";
  return "student";
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const userRole = getUserRole();

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
      //{ name: "My Enrollments", href: "/student/enrollments", icon: FileText },
      //{ name: "Profile", href: "/student/profile", icon: User },
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
      //{ name: "Reports", href: "/admin/reports", icon: BarChart3 },
    ],
  };

  const roleColors = {
    student: "bg-green-100 text-green-800",
    faculty: "bg-orange-100 text-orange-800",
    admin: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div
          className="fixed inset-0 bg-gray-900/80 z-40"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          style={{ display: sidebarOpen ? "block" : "none" }}
        />

        <div
          className={`fixed inset-0 flex z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          <div className="relative flex-1 flex flex-col w-full max-w-xs bg-white">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="-m-2.5 p-2.5 rounded-md text-gray-700"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex-shrink-0 flex items-center px-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold">University</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation[userRole].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href
                          ? "text-gray-500"
                          : "text-gray-400 group-hover:text-gray-500",
                        "mr-4 flex-shrink-0 h-6 w-6"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div>
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>
                      {userRole === "student"
                        ? "ST"
                        : userRole === "faculty"
                        ? "FA"
                        : "AD"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700">
                    {userRole === "student"
                      ? "John Student"
                      : userRole === "faculty"
                      ? "Dr. Jane Faculty"
                      : "Admin User"}
                  </p>
                  <Badge className={roleColors[userRole]}>
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold">University</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation[userRole].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  )}
                >
                  <item.icon
                    className={cn(
                      pathname === item.href
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 flex-shrink-0 h-5 w-5"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>
                    {userRole === "student"
                      ? "ST"
                      : userRole === "faculty"
                      ? "FA"
                      : "AD"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {userRole === "student"
                    ? "John Student"
                    : userRole === "faculty"
                    ? "Dr. Jane Faculty"
                    : "Admin User"}
                </p>
                <Badge className={roleColors[userRole]}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <header className="bg-white shadow">
          <div className="flex justify-between items-center px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-semibold text-gray-900">
              {userRole === "student"
                ? "Student Dashboard"
                : userRole === "faculty"
                ? "Faculty Dashboard"
                : "Admin Dashboard"}
            </h1>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt="User" />
                      <AvatarFallback>
                        {userRole === "student"
                          ? "ST"
                          : userRole === "faculty"
                          ? "FA"
                          : "AD"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <Link href="/">
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="py-6">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
