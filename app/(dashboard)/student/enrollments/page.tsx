import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, User, MapPin, Calendar } from "lucide-react"

export default function StudentEnrollments() {
  // Mock data for student enrollments
  const enrolledCourses = [
    {
      id: 1,
      code: "MATH201",
      title: "Calculus I",
      instructor: "Dr. Katherine Johnson",
      schedule: "Tue, Thu 9:00 AM - 11:00 AM",
      location: "Math Building, Room 105",
      status: "active",
      grade: "A-",
      credits: 4,
      semester: "Fall 2023",
    },
    {
      id: 2,
      code: "ENG102",
      title: "English Composition",
      instructor: "Prof. Jane Austen",
      schedule: "Mon, Wed 1:00 PM - 2:30 PM",
      location: "Humanities Building, Room 210",
      status: "active",
      grade: "B+",
      credits: 3,
      semester: "Fall 2023",
    },
  ]

  const pendingEnrollments = [
    {
      id: 1,
      code: "CS101",
      title: "Introduction to Computer Science",
      instructor: "Dr. Alan Turing",
      schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
      location: "Science Building, Room 301",
      status: "pending",
      requestDate: "2023-08-15",
      credits: 3,
      semester: "Fall 2023",
    },
  ]

  const enrollmentHistory = [
    {
      id: 1,
      code: "BIO110",
      title: "General Biology",
      instructor: "Dr. Rosalind Franklin",
      schedule: "Mon, Wed, Fri 9:00 AM - 10:30 AM",
      location: "Life Sciences Building, Room 105",
      status: "completed",
      grade: "A",
      credits: 4,
      semester: "Spring 2023",
    },
    {
      id: 2,
      code: "HIST101",
      title: "World History",
      instructor: "Prof. Howard Zinn",
      schedule: "Tue, Thu 11:00 AM - 12:30 PM",
      location: "Humanities Building, Room 310",
      status: "completed",
      grade: "B",
      credits: 3,
      semester: "Spring 2023",
    },
    {
      id: 3,
      code: "CHEM101",
      title: "Introduction to Chemistry",
      instructor: "Dr. Marie Curie",
      schedule: "Mon, Wed, Fri 2:00 PM - 3:30 PM",
      location: "Science Building, Room 105",
      status: "completed",
      grade: "A-",
      credits: 4,
      semester: "Fall 2022",
    },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Enrollments</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="history">Enrollment History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          <div className="grid gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription className="mt-1">{course.code}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <Badge>{course.credits} Credits</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{course.instructor}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{course.schedule}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{course.location}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Current Grade: {course.grade}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Semester: {course.semester}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline">View Course Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {enrolledCourses.length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No active enrollments</h3>
                <p className="text-muted-foreground mt-1">Browse available courses to enroll</p>
                <Button className="mt-4">Browse Courses</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-6">
            {pendingEnrollments.map((course) => (
              <Card key={course.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription className="mt-1">{course.code}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      <Badge>{course.credits} Credits</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{course.instructor}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{course.schedule}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{course.location}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Requested on: {course.requestDate}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Semester: {course.semester}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" className="mr-2">
                      Cancel Request
                    </Button>
                    <Button variant="outline">View Course Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {pendingEnrollments.length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No pending enrollment requests</h3>
                <p className="text-muted-foreground mt-1">All your enrollment requests have been processed</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="grid gap-6">
            {enrollmentHistory.map((course) => (
              <Card key={course.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription className="mt-1">{course.code}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
                      <Badge>{course.credits} Credits</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{course.instructor}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{course.schedule}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{course.location}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Final Grade: {course.grade}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Semester: {course.semester}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {enrollmentHistory.length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No enrollment history</h3>
                <p className="text-muted-foreground mt-1">You haven't completed any courses yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
