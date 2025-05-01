import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Clock, CheckSquare } from "lucide-react"

export default function FacultyDashboard() {
  // Mock data for faculty dashboard
  const pendingRequests = [
    {
      id: 1,
      course: "Introduction to Computer Science",
      student: "John Smith",
      studentId: "ST12345",
      date: "2023-08-15",
    },
    {
      id: 2,
      course: "Introduction to Computer Science",
      student: "Emily Johnson",
      studentId: "ST12346",
      date: "2023-08-14",
    },
  ]

  const upcomingClasses = [
    {
      id: 1,
      course: "Introduction to Computer Science",
      time: "10:00 AM - 11:30 AM",
      location: "Science Building, Room 301",
      day: "Monday, August 21, 2023",
    },
    {
      id: 2,
      course: "Advanced Programming",
      time: "1:00 PM - 2:30 PM",
      location: "Science Building, Room 305",
      day: "Monday, August 21, 2023",
    },
    {
      id: 3,
      course: "Introduction to Computer Science",
      time: "10:00 AM - 11:30 AM",
      location: "Science Building, Room 301",
      day: "Wednesday, August 23, 2023",
    },
  ]

  const announcements = [
    {
      id: 1,
      title: "Faculty Meeting",
      content: "Reminder: Faculty meeting this Friday at 3:00 PM in the Conference Room.",
      date: "2023-08-16",
    },
    {
      id: 2,
      title: "Grade Submission Deadline",
      content: "The deadline for submitting final grades for the Summer semester is August 25.",
      date: "2023-08-10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Teaching</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">For Fall 2023 Semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Awaiting your approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Office Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Hours per week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pending Enrollment Requests</CardTitle>
            <CardDescription>Student enrollment requests awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">
                      {request.student} ({request.studentId})
                    </p>
                    <p className="text-sm text-muted-foreground">{request.course}</p>
                    <p className="text-sm text-muted-foreground">Requested on {request.date}</p>
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
              {pendingRequests.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No pending enrollment requests</p>
                </div>
              )}
              <div className="text-center pt-2">
                <Link href="/dashboard/faculty/requests">
                  <Button variant="outline">View All Requests</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Latest updates for faculty</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
          <CardDescription>Your teaching schedule for the next few days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(
              upcomingClasses.reduce(
                (acc, cls) => {
                  if (!acc[cls.day]) acc[cls.day] = []
                  acc[cls.day].push(cls)
                  return acc
                },
                {} as Record<string, typeof upcomingClasses>,
              ),
            ).map(([day, classes]) => (
              <div key={day}>
                <h3 className="font-medium mb-3">{day}</h3>
                <div className="space-y-3">
                  {classes.map((cls) => (
                    <div key={cls.id} className="flex items-start p-3 bg-gray-50 rounded-md">
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{cls.course}</p>
                        <p className="text-sm text-muted-foreground">{cls.time}</p>
                        <p className="text-sm text-muted-foreground">{cls.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
