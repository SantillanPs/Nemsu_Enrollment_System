"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, ChevronLeft, User, Users, Plus, Trash2 } from "lucide-react"

export default function CourseDetails() {
  const params = useParams()
  const courseId = Number(params.id)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showDeleteSectionDialog, setShowDeleteSectionDialog] = useState(false)

  // Mock data for courses with multiple sections
  const courses = [
    {
      id: 1,
      code: "CS101",
      title: "Introduction to Computer Science",
      department: "Computer Science",
      credits: 3,
      description:
        "An introductory course to the fundamental principles of computing and programming. Topics include algorithm design, problem-solving techniques, data types, control structures, functions, arrays, and an introduction to object-oriented programming.",
      prerequisites: "None",
      status: "active",
      year: 2023,
      semester: "Fall 2023",
      lastUpdated: "2023-06-15",
      sections: [
        {
          id: 101,
          sectionCode: "A",
          instructor: "Dr. Alan Turing",
          schedule: "Tue, Fri 10:30 AM - 12:00 PM",
          location: "Science Building, Room 301",
          enrollments: 28,
          capacity: 30,
          status: "active",
          students: [
            { id: 1, name: "John Smith", studentId: "ST12345" },
            { id: 2, name: "Emily Johnson", studentId: "ST12346" },
            // More students would be listed here
          ],
        },
        {
          id: 102,
          sectionCode: "B",
          instructor: "Dr. Grace Hopper",
          schedule: "Tue, Fri 1:00 PM - 2:30 PM",
          location: "Science Building, Room 302",
          enrollments: 25,
          capacity: 30,
          status: "active",
          students: [
            { id: 3, name: "Michael Brown", studentId: "ST12347" },
            { id: 4, name: "Sarah Davis", studentId: "ST12348" },
            // More students would be listed here
          ],
        },
        {
          id: 103,
          sectionCode: "C",
          instructor: "Dr. John McCarthy",
          schedule: "Mon, Wed 3:00 PM - 4:30 PM",
          location: "Science Building, Room 303",
          enrollments: 22,
          capacity: 30,
          status: "active",
          students: [
            { id: 5, name: "David Wilson", studentId: "ST12349" },
            { id: 6, name: "Jennifer Martinez", studentId: "ST12350" },
            // More students would be listed here
          ],
        },
      ],
    },
    // Other courses would be here
  ]

  // Mock data for faculty members (for assigning to sections)
  const facultyMembers = [
    { id: 1, name: "Dr. Alan Turing", department: "Computer Science" },
    { id: 2, name: "Dr. Grace Hopper", department: "Computer Science" },
    { id: 3, name: "Dr. John McCarthy", department: "Computer Science" },
    { id: 4, name: "Dr. Katherine Johnson", department: "Mathematics" },
    { id: 5, name: "Dr. Isaac Newton", department: "Mathematics" },
    { id: 6, name: "Prof. Jane Austen", department: "English" },
    { id: 7, name: "Prof. William Shakespeare", department: "English" },
    { id: 8, name: "Dr. Richard Feynman", department: "Physics" },
    { id: 9, name: "Dr. Albert Einstein", department: "Physics" },
    { id: 10, name: "Dr. Marie Curie", department: "Chemistry" },
  ]

  // Find the course by ID
  const course = courses.find((c) => c.id === courseId) || courses[0]

  const handleEditSection = (section: any) => {
    setSelectedSection(section)
    setShowSectionDialog(true)
  }

  const handleAddSection = () => {
    setSelectedSection(null) // No section selected means we're adding a new one
    setShowSectionDialog(true)
  }

  const handleAssignInstructor = (section: any) => {
    setSelectedSection(section)
    setShowAssignDialog(true)
  }

  const handleDeleteSection = (section: any) => {
    setSelectedSection(section)
    setShowDeleteSectionDialog(true)
  }

  // Calculate total enrollments for a course across all sections
  const getTotalEnrollments = () => {
    return course.sections.reduce((total, section) => total + section.enrollments, 0)
  }

  // Calculate total capacity for a course across all sections
  const getTotalCapacity = () => {
    return course.sections.reduce((total, section) => total + section.capacity, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard/admin/courses">
            <Button variant="ghost" size="sm" className="mr-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Courses
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {course.code}: {course.title}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/admin/courses/edit/${course.id}`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Course
            </Button>
          </Link>
          <Button onClick={handleAddSection}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Details about this course and its sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p>{course.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Credits</p>
                  <p>{course.credits}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Semester</p>
                  <p>{course.semester}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge
                    className={
                      course.status === "active"
                        ? "bg-green-100 text-green-800"
                        : course.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Prerequisites</p>
                  <p>{course.prerequisites}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p>{course.lastUpdated}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{course.description}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Sections ({course.sections.length})</p>
                  <p className="text-sm">
                    Total Enrollment: {getTotalEnrollments()}/{getTotalCapacity()}
                  </p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (getTotalEnrollments() / getTotalCapacity()) > 0.9
                        ? "bg-red-500"
                        : getTotalEnrollments() / getTotalCapacity() > 0.7
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${(getTotalEnrollments() / getTotalCapacity()) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Section Summary</CardTitle>
              <CardDescription>Quick overview of all sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">Section {section.sectionCode}</p>
                      <p className="text-sm text-muted-foreground">{section.instructor}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Users className="h-3 w-3 mr-1" />
                        <span>
                          {section.enrollments}/{section.capacity}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={
                        section.status === "active"
                          ? "bg-green-100 text-green-800"
                          : section.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {section.status.charAt(0).toUpperCase() + section.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        <TabsContent value="sections" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Sections</CardTitle>
              <CardDescription>Manage sections, schedules, and instructor assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {course.sections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">{section.sectionCode}</TableCell>
                      <TableCell>{section.instructor}</TableCell>
                      <TableCell>{section.schedule}</TableCell>
                      <TableCell>{section.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-2">
                            {section.enrollments}/{section.capacity}
                          </span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                (section.enrollments / section.capacity) > 0.9
                                  ? "bg-red-500"
                                  : section.enrollments / section.capacity > 0.7
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                              style={{ width: `${(section.enrollments / section.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            section.status === "active"
                              ? "bg-green-100 text-green-800"
                              : section.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {section.status.charAt(0).toUpperCase() + section.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleAssignInstructor(section)}>
                            <User className="h-4 w-4" />
                            <span className="sr-only">Assign Instructor</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditSection(section)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Section</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeleteSection(section)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete Section</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>Students enrolled across all sections</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={`section-${course.sections[0]?.id}`}>
                <TabsList className="mb-4">
                  {course.sections.map((section) => (
                    <TabsTrigger key={section.id} value={`section-${section.id}`}>
                      Section {section.sectionCode}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {course.sections.map((section) => (
                  <TabsContent key={section.id} value={`section-${section.id}`}>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {section.students.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>{student.studentId}</TableCell>
                              <TableCell>{student.name}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  View Profile
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {section.students.length === 0 && (
                      <div className="text-center py-10">
                        <h3 className="text-lg font-medium">No students enrolled</h3>
                        <p className="text-muted-foreground mt-1">This section has no enrolled students</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit/Add Section Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedSection ? "Edit Section" : "Add New Section"}</DialogTitle>
            <DialogDescription>
              {selectedSection
                ? `Edit details for Section ${selectedSection.sectionCode}`
                : "Add a new section to this course"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm font-medium">Course</p>
              <p className="text-sm">
                {course.code}: {course.title}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-code">Section Code</Label>
              <Input id="section-code" placeholder="e.g., A, B, C" defaultValue={selectedSection?.sectionCode || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Select defaultValue={selectedSection?.instructor || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  {facultyMembers
                    .filter((faculty) => faculty.department === course.department)
                    .map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.name}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days">Days</Label>
                <Select defaultValue={selectedSection?.schedule.split(" ")[0] || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mon, Wed">Monday, Wednesday</SelectItem>
                    <SelectItem value="Tue, Thu">Tuesday, Thursday</SelectItem>
                    <SelectItem value="Mon, Wed, Fri">Monday, Wednesday, Friday</SelectItem>
                    <SelectItem value="Tue, Fri">Tuesday, Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select defaultValue={selectedSection?.schedule.split(" ").slice(2).join(" ") || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:00 AM - 10:30 AM">9:00 AM - 10:30 AM</SelectItem>
                    <SelectItem value="10:30 AM - 12:00 PM">10:30 AM - 12:00 PM</SelectItem>
                    <SelectItem value="1:00 PM - 2:30 PM">1:00 PM - 2:30 PM</SelectItem>
                    <SelectItem value="3:00 PM - 4:30 PM">3:00 PM - 4:30 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Science Building, Room 301"
                defaultValue={selectedSection?.location || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                placeholder="e.g., 30"
                defaultValue={selectedSection?.capacity || "30"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue={selectedSection?.status || "active"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSectionDialog(false)}>
              {selectedSection ? "Save Changes" : "Add Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Instructor Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Instructor</DialogTitle>
            <DialogDescription>
              {selectedSection && `Assign an instructor to Section ${selectedSection.sectionCode}`}
            </DialogDescription>
          </DialogHeader>
          {selectedSection && (
            <div className="py-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Course</p>
                <p className="text-sm">
                  {course.code}: {course.title}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Section</p>
                <p className="text-sm">
                  Section {selectedSection.sectionCode} • {selectedSection.schedule} • {selectedSection.location}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-instructor">Current Instructor</Label>
                <Input id="current-instructor" value={selectedSection.instructor} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-instructor">New Instructor</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyMembers
                      .filter((faculty) => faculty.department === course.department)
                      .map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.name}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAssignDialog(false)}>Assign Instructor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Section Dialog */}
      <Dialog open={showDeleteSectionDialog} onOpenChange={setShowDeleteSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSection && (
            <div className="py-4">
              <div>
                <p className="font-medium">Section {selectedSection.sectionCode}</p>
                <p className="text-sm text-muted-foreground">Instructor: {selectedSection.instructor}</p>
                <p className="text-sm text-muted-foreground">Schedule: {selectedSection.schedule}</p>
                <p className="text-sm text-muted-foreground">Location: {selectedSection.location}</p>
              </div>
              {selectedSection.enrollments > 0 && (
                <div className="mt-4 bg-red-50 p-3 rounded-md">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This section has {selectedSection.enrollments} enrolled students. Deleting
                    it will remove all student enrollments.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteSectionDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteSectionDialog(false)}>
              Delete Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
