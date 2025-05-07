import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, UserPlus, ArrowUpRight } from "lucide-react";

export default function AdminDashboard() {
  // Mock data for admin dashboard

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
  ];

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-md">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,248</div>
            <div className="flex items-center pt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>12% from last semester</span>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-none shadow-md">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-1"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">86</div>
            <div className="flex items-center pt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>4% from last semester</span>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-none shadow-md">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-1"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">142</div>
            <div className="flex items-center pt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>8% from last semester</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <CardTitle>Enrollment Statistics</CardTitle>
            <CardDescription className="text-blue-100">
              Current enrollment statistics by department
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <p className="text-sm font-medium">Computer Science</p>
                  </div>
                  <p className="text-sm font-medium text-blue-600">78%</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: "78%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                    <p className="text-sm font-medium">Business</p>
                  </div>
                  <p className="text-sm font-medium text-indigo-600">92%</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-indigo-500 h-2.5 rounded-full"
                    style={{ width: "92%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <p className="text-sm font-medium">Engineering</p>
                  </div>
                  <p className="text-sm font-medium text-purple-600">64%</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-purple-500 h-2.5 rounded-full"
                    style={{ width: "64%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                    <p className="text-sm font-medium">Arts & Humanities</p>
                  </div>
                  <p className="text-sm font-medium text-pink-600">45%</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-pink-500 h-2.5 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
                    <p className="text-sm font-medium">Sciences</p>
                  </div>
                  <p className="text-sm font-medium text-teal-600">71%</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-teal-500 h-2.5 rounded-full"
                    style={{ width: "71%" }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-center pt-6">
              <Link href="/admin/reports">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">
                  View Detailed Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-700 text-white">
          <CardTitle>Recently Created Courses</CardTitle>
          <CardDescription className="text-purple-100">
            Courses created in the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left font-medium p-2 pl-0 text-gray-600">
                    Course Code
                  </th>
                  <th className="text-left font-medium p-2 text-gray-600">
                    Course Title
                  </th>
                  <th className="text-left font-medium p-2 text-gray-600">
                    Department
                  </th>
                  <th className="text-left font-medium p-2 text-gray-600">
                    Instructor
                  </th>
                  <th className="text-left font-medium p-2 text-gray-600">
                    Enrollment
                  </th>
                  <th className="text-right font-medium p-2 pr-0 text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentCourses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 pl-0">
                      <span className="font-medium text-purple-700">
                        {course.code}
                      </span>
                    </td>
                    <td className="p-3">{course.title}</td>
                    <td className="p-3">{course.department}</td>
                    <td className="p-3">{course.instructor}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <span className="mr-2 font-medium">
                          {course.enrollments}/{course.capacity}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            course.enrollments / course.capacity > 0.9
                              ? "bg-red-100 text-red-700"
                              : course.enrollments / course.capacity > 0.7
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {Math.round(
                            (course.enrollments / course.capacity) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            course.enrollments / course.capacity > 0.9
                              ? "bg-red-500"
                              : course.enrollments / course.capacity > 0.7
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${
                              (course.enrollments / course.capacity) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-3 pr-0 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-1 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center pt-6">
            <Link href="/admin/courses">
              <Button className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800">
                Manage All Courses
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Link href="/admin/create-course" className="w-full sm:w-auto">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 px-6 py-6 rounded-xl shadow-md w-full">
            <BookOpen className="mr-3 h-5 w-5" />
            <div>
              <div className="font-semibold">Create New Course</div>
              <div className="text-xs text-blue-100">
                Add a course to the catalog
              </div>
            </div>
          </Button>
        </Link>
        <Link href="/admin/students" className="w-full sm:w-auto">
          <Button className="bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 px-6 py-6 rounded-xl shadow-md w-full">
            <Users className="mr-3 h-5 w-5" />
            <div>
              <div className="font-semibold">Manage Students</div>
              <div className="text-xs text-green-100">
                Verify student accounts
              </div>
            </div>
          </Button>
        </Link>
        <Link href="/admin/faculty" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="px-6 py-6 rounded-xl border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-md w-full"
          >
            <UserPlus className="mr-3 h-5 w-5" />
            <div>
              <div className="font-semibold">Manage Faculty</div>
              <div className="text-xs text-indigo-500">
                View and edit faculty members
              </div>
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
}
