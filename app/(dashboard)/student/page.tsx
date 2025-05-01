import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function StudentDashboard() {
  // Mock data for student dashboard
  const enrollmentRequests = [
    { id: 1, course: "Introduction to Computer Science", status: "pending", date: "2023-08-15" },
    { id: 2, course: "Calculus I", status: "approved", date: "2023-08-10" },
    { id: 3, course: "English Composition", status: "rejected", date: "2023-08-05" },
  ]

  const upcomingDeadlines = [
    { id: 1, title: "Fall Semester Enrollment", date: "2023-09-01" },
    { id: 2, title: "Tuition Payment Deadline", date: "2023-08-25" },
    { id: 3, title: "Course Add/Drop Period Ends", date: "2023-09-15" },
  ]

  const announcements = [
    {
      id: 1,
      title: "New Course Offerings",
      content: "Check out the new courses available for the Fall semester!",
      date: "2023-08-10",
    },
    {
      id: 2,
      title: "Library Hours Extended",
      content: "The university library will now be open until midnight on weekdays.",
      date: "2023-08-08",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">For Fall 2023 Semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Credits</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Out of 120 required</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPA</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.7</div>
            <p className="text-xs text-muted-foreground">Current cumulative</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Enrollment Requests</CardTitle>
            <CardDescription>Track the status of your course enrollment requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollmentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{request.course}</p>
                    <p className="text-sm text-muted-foreground">Requested on {request.date}</p>
                  </div>
                  <Badge
                    className={
                      request.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : request.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              ))}
              <div className="text-center pt-2">
                <Link href="/dashboard/student/enrollments">
                  <Button variant="outline">View All Enrollments</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Important dates to remember</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center border-b pb-4">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{deadline.title}</p>
                    <p className="text-sm text-muted-foreground">{deadline.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Latest updates from the university</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground">{announcement.date}</p>
                </div>
                <p className="mt-2 text-sm">{announcement.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
