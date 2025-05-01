import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, UserPlus, CheckSquare, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function AdminDashboard() {
  // Mock data for admin dashboard
  const pendingApprovals = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      program: "Computer Science",
      date: "2023-08-15",
    },
    {
      id: 2,
      name: "Emily Johnson",
      email: "emily.johnson@example.com",
      program: "Business Administration",
      date: "2023-08-14",
    },
  ]

  const recentCourses = [
    {
      id: 1,
      code: "CS101",
      title: "Introduction to Computer Science",
      department: "Computer Science",
      instructor: "Dr. Alan Turing",
      enrollments: 28,
      capacity: 30,
    },
    {
      id: 2,
      code: "BUS201",
      title: "Principles of Marketing",
      department: "Business",
      instructor: "Prof. Philip Kotler",
      enrollments: 35,
      capacity: 40,
    },
    {
      id: 3,
      code: "ENG102",
      title: "English Composition",
      department: "English",
      instructor: "Dr. Jane Austen",
      enrollments: 22,
      capacity: 30,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <div className="flex items-center pt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>12% from last semester</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86</div>
            <div className="flex items-center pt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>4% from last semester</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <div className="flex items-center pt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>8% from last semester</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <div className="flex items-center pt-1 text-xs text-red-600">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              <span>3 new today</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Student Approvals</CardTitle>
            <CardDescription>New student accounts awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((student) => (
                <div key={student.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                    <p className="text-sm text-muted-foreground">Program: {student.program}</p>
                    <p className="text-sm text-muted-foreground">Applied on: {student.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    >
                      Reject
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
              {pendingApprovals.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No pending student approvals</p>
                </div>
              )}
              <div className="text-center pt-2">
                <Link href="/dashboard/admin/student-approvals">
                  <Button variant="outline">View All Approvals</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment Statistics</CardTitle>
            <CardDescription>Current enrollment statistics by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Computer Science</p>
                  <p className="text-sm font-medium">78%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "78%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Business</p>
                  <p className="text-sm font-medium">92%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "92%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Engineering</p>
                  <p className="text-sm font-medium">64%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "64%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Arts & Humanities</p>
                  <p className="text-sm font-medium">45%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Sciences</p>
                  <p className="text-sm font-medium">71%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "71%" }}></div>
                </div>
              </div>
            </div>
            <div className="text-center pt-4">
              <Link href="/dashboard/admin/reports">
                <Button variant="outline">View Detailed Reports</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recently Created Courses</CardTitle>
          <CardDescription>Courses created in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium p-2 pl-0">Course Code</th>
                  <th className="text-left font-medium p-2">Course Title</th>
                  <th className="text-left font-medium p-2">Department</th>
                  <th className="text-left font-medium p-2">Instructor</th>
                  <th className="text-left font-medium p-2">Enrollment</th>
                  <th className="text-right font-medium p-2 pr-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentCourses.map((course) => (
                  <tr key={course.id} className="border-b">
                    <td className="p-2 pl-0">{course.code}</td>
                    <td className="p-2">{course.title}</td>
                    <td className="p-2">{course.department}</td>
                    <td className="p-2">{course.instructor}</td>
                    <td className="p-2">
                      {course.enrollments}/{course.capacity}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${(course.enrollments / course.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-2 pr-0 text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center pt-4">
            <Link href="/dashboard/admin/courses">
              <Button variant="outline">Manage All Courses</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Link href="/dashboard/admin/create-course">
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            Create New Course
          </Button>
        </Link>
        <Link href="/dashboard/admin/faculty">
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Manage Faculty
          </Button>
        </Link>
      </div>
    </div>
  )
}
