"use client"

import { usePathname } from "next/navigation"
import { Card } from "@/components/ui/card"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Get the current page title based on the pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard/admin") return "Admin Dashboard"
    if (pathname === "/dashboard/admin/courses") return "Course Management"
    if (pathname === "/dashboard/admin/faculty") return "Faculty Management"
    if (pathname === "/dashboard/admin/create-course") return "Create Course"
    if (pathname === "/dashboard/admin/student-approvals") return "Student Approvals"
    
    // For dynamic routes
    if (pathname.startsWith("/dashboard/admin/courses/")) {
      if (pathname.includes("/edit/")) return "Edit Course"
      return "Course Details"
    }
    
    if (pathname.startsWith("/dashboard/admin/faculty/")) {
      if (pathname.includes("/edit/")) return "Edit Faculty"
      if (pathname.includes("/add")) return "Add Faculty"
      return "Faculty Details"
    }
    
    return "Admin Portal"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-white">{getPageTitle()}</h1>
        <p className="text-blue-100 mt-1">
          Manage your institution's courses, faculty, and students
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        {children}
      </div>
    </div>
  )
}
