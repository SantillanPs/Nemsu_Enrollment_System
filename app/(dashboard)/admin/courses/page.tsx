"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Search,
  Filter,
  MoreHorizontal,
  BookOpen,
  User,
  Calendar,
  Clock,
  PlusSquare,
  Copy,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
} from "lucide-react"

export default function ManageCourses() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)

  // Mock data for courses with multiple sections
  const courses = [
    {
      id: 1,
      code: "CS101",
      title: "Introduction to Computer Science",
      department: "Computer Science",
      credits: 3,
      description: "An introductory course to the fundamental principles of computing and programming.",
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
        },
      ],
    },
    {
      id: 2,
      code: "MATH201",
      title: "Calculus I",
      department: "Mathematics",
      credits: 4,
      description: "Introduction to differential and integral calculus of functions of one variable.",
      prerequisites: "MATH101",
      status: "active",
      year: 2023,
      semester: "Fall 2023",
      lastUpdated: "2023-06-10",
      sections: [
        {
          id: 201,
          sectionCode: "A",
          instructor: "Dr. Katherine Johnson",
          schedule: "Tue, Thu 9:00 AM - 11:00 AM",
          location: "Math Building, Room 105",
          enrollments: 25,
          capacity: 30,
          status: "active",
        },
        {
          id: 202,
          sectionCode: "B",
          instructor: "Dr. Isaac Newton",
          schedule: "Mon, Wed 1:00 PM - 3:00 PM",
          location: "Math Building, Room 106",
          enrollments: 28,
          capacity: 30,
          status: "active",
        },
      ],
    },
    {
      id: 3,
      code: "ENG102",
      title: "English Composition",
      department: "English",
      credits: 3,
      description: "Development of writing skills through the study and practice of academic writing.",
      prerequisites: "ENG101",
      status: "active",
      year: 2023,
      semester: "Fall 2023",
      lastUpdated: "2023-06-12",
      sections: [
        {
          id: 301,
          sectionCode: "A",
          instructor: "Prof. Jane Austen",
          schedule: "Mon, Wed 1:00 PM - 2:30 PM",
          location: "Humanities Building, Room 210",
          enrollments: 22,
          capacity: 30,
          status: "active",
        },
        {
          id: 302,
          sectionCode: "B",
          instructor: "Prof. William Shakespeare",
          schedule: "Tue, Thu 10:00 AM - 11:30 AM",
          location: "Humanities Building, Room 211",
          enrollments: 20,
          capacity: 30,
          status: "active",
        },
      ],
    },
    {
      id: 4,
      code: "PHYS101",
      title: "Introduction to Physics",
      department: "Physics",
      credits: 4,
      description: "An introduction to classical mechanics, thermodynamics, and wave phenomena.",
      prerequisites: "None",
      status: "active",
      year: 2023,
      semester: "Fall 2023",
      lastUpdated: "2023-06-14",
      sections: [
        {
          id: 401,
          sectionCode: "A",
          instructor: "Dr. Richard Feynman",
          schedule: "Tue, Thu 1:00 PM - 3:00 PM",
          location: "Science Building, Room 201",
          enrollments: 18,
          capacity: 24,
          status: "active",
        },
        {
          id: 402,
          sectionCode: "B",
          instructor: "Dr. Albert Einstein",
          schedule: "Mon, Wed 9:00 AM - 11:00 AM",
          location: "Science Building, Room 202",
          enrollments: 20,
          capacity: 24,
          status: "active",
        },
      ],
    },
    {
      id: 5,
      code: "CS201",
      title: "Data Structures and Algorithms",
      department: "Computer Science",
      credits: 4,
      description: "Study of data structures, algorithms, and their analysis.",
      prerequisites: "CS101",
      status: "pending",
      year: 2024,
      semester: "Spring 2024",
      lastUpdated: "2023-07-20",
      sections: [
        {
          id: 501,
          sectionCode: "A",
          instructor: "Dr. Alan Turing",
          schedule: "Mon, Wed 3:00 PM - 4:30 PM",
          location: "Science Building, Room 305",
          enrollments: 0,
          capacity: 25,
          status: "pending",
        },
        {
          id: 502,
          sectionCode: "B",
          instructor: "Dr. Grace Hopper",
          schedule: "Tue, Thu 1:00 PM - 2:30 PM",
          location: "Science Building, Room 306",
          enrollments: 0,
          capacity: 25,
          status: "pending",
        },
      ],
    },
    {
      id: 6,
      code: "CHEM101",
      title: "Introduction to Chemistry",
      department: "Chemistry",
      credits: 4,
      description: "Introduction to the principles of chemistry, including atomic structure and chemical reactions.",
      prerequisites: "None",
      status: "inactive",
      year: 2023,
      semester: "Spring 2023",
      lastUpdated: "2023-01-15",
      sections: [
        {
          id: 601,
          sectionCode: "A",
          instructor: "Dr. Marie Curie",
          schedule: "Mon, Wed, Fri 2:00 PM - 3:30 PM",
          location: "Science Building, Room 105",
          enrollments: 0,
          capacity: 30,
          status: "inactive",
        },
      ],
    },
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

  // Get unique departments, semesters, and years for filter dropdowns
  const departments = ["all", ...new Set(courses.map((course) => course.department))]
  const semesters = ["all", ...new Set(courses.map((course) => course.semester))]

  // Filter courses based on search term, department, semester, and status
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.sections.some((section) => section.instructor.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDepartment = selectedDepartment === "all" || course.department === selectedDepartment
    const matchesSemester = selectedSemester === "all" || course.semester === selectedSemester
    const matchesStatus = selectedStatus === "all" || course.status === selectedStatus
    const matchesActiveOnly = !showActiveOnly || course.status === "active"

    return matchesSearch && matchesDepartment && matchesSemester && matchesStatus && matchesActiveOnly
  })

  const handleDeleteCourse = (course: any) => {
    setSelectedCourse(course)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    // In a real app, this would send a request to your backend
    console.log(`Deleting course: ${selectedCourse.code} - ${selectedCourse.title}`)
    // In a real app, you would update the database here

    setShowDeleteDialog(false)
    setSelectedCourse(null)
  }

  const handleEditSection = (course: any, section: any) => {
    setSelectedCourse(course)
    setSelectedSection(section)
    setShowSectionDialog(true)
  }

  const handleAssignInstructor = (course: any, section: any) => {
    setSelectedCourse(course)
    setSelectedSection(section)
    setShowAssignDialog(true)
  }

  const handleAddSection = (course: any) => {
    setSelectedCourse(course)
    setSelectedSection(null) // No section selected means we're adding a new one
    setShowSectionDialog(true)
  }

  // Calculate total enrollments for a course across all sections
  const getTotalEnrollments = (course: any) => {
    return course.sections.reduce((total: number, section: any) => total + section.enrollments, 0)
  }

  // Calculate total capacity for a course across all sections
  const getTotalCapacity = (course: any) => {
    return course.sections.reduce((total: number, section: any) => total + section.capacity, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Courses</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/create-course">
            <Button>
              <PlusSquare className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, code, or instructor..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department === "all" ? "All Departments" : department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester === "all" ? "All Semesters" : semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Switch id="active-only" checked={showActiveOnly} onCheckedChange={setShowActiveOnly} />
            <Label htmlFor="active-only">Active Only</Label>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Catalog</CardTitle>
          <CardDescription>Manage courses, sections, and instructor assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {filteredCourses.map((course) => (
              <AccordionItem key={course.id} value={`course-${course.id}`}>
                <AccordionTrigger>
                  <div className="flex flex-1 items-center justify-between pr-4">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{course.code}:</span>
                      <span>{course.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
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
                      <span className="text-sm text-muted-foreground">
                        {course.sections.length} section{course.sections.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        
                        <p className="text-sm text-muted-foreground">
                          {course.department} • {course.credits} credits • {course.semester}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleAddSection(course)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Section
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Course Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Link href={`/dashboard/admin/courses/${course.id}`} className="flex w-full">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/dashboard/admin/courses/edit/${course.id}`} className="flex w-full">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Course
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/dashboard/admin/courses/duplicate/${course.id}`} className="flex w-full">
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCourse(course)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="rounded-md border">
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
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAssignInstructor(course, section)}
                                  >
                                    <User className="h-4 w-4" />
                                    <span className="sr-only">Assign Instructor</span>
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditSection(course, section)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit Section</span>
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete Section</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
                      <div>
                        <span>Prerequisites: {course.prerequisites}</span>
                      </div>
                      <div>
                        <span>
                          Total Enrollment: {getTotalEnrollments(course)}/{getTotalCapacity(course)}
                        </span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredCourses.length === 0 && (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Courses</TabsTrigger>
          <TabsTrigger value="pending">Pending Courses</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Courses</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter((course) => course.status === "active")
              .map((course) => (
                <Card key={course.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-base">{course.code}</CardTitle>
                        <CardDescription>{course.title}</CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Department: {course.department}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Semester: {course.semester}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Sections: {course.sections.length}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm font-medium">
                        Total Enrollment: {getTotalEnrollments(course)}/{getTotalCapacity(course)}
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            (getTotalEnrollments(course) / getTotalCapacity(course)) > 0.9
                              ? "bg-red-500"
                              : getTotalEnrollments(course) / getTotalCapacity(course) > 0.7
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${(getTotalEnrollments(course) / getTotalCapacity(course)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleAddSection(course)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Section
                    </Button>
                    <Link href={`/dashboard/admin/courses/${course.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter((course) => course.status === "pending")
              .map((course) => (
                <Card key={course.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-base">{course.code}</CardTitle>
                        <CardDescription>{course.title}</CardDescription>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Department: {course.department}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Semester: {course.semester}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Sections: {course.sections.length}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Approve
                    </Button>
                    <Link href={`/dashboard/admin/courses/${course.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            {courses.filter((course) => course.status === "pending").length === 0 && (
              <div className="col-span-full text-center py-10">
                <h3 className="text-lg font-medium">No pending courses</h3>
                <p className="text-muted-foreground mt-1">All courses are currently active or inactive</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="inactive" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter((course) => course.status === "inactive")
              .map((course) => (
                <Card key={course.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-base">{course.code}</CardTitle>
                        <CardDescription>{course.title}</CardDescription>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Department: {course.department}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Semester: {course.semester}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Last Updated: {course.lastUpdated}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                    >
                      Reactivate
                    </Button>
                    <Link href={`/dashboard/admin/courses/${course.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            {courses.filter((course) => course.status === "inactive").length === 0 && (
              <div className="col-span-full text-center py-10">
                <h3 className="text-lg font-medium">No inactive courses</h3>
                <p className="text-muted-foreground mt-1">All courses are currently active or pending</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="py-4">
              <div>
                <p className="font-medium">
                  {selectedCourse.code}: {selectedCourse.title}
                </p>
                <p className="text-sm text-muted-foreground">Department: {selectedCourse.department}</p>
                <p className="text-sm text-muted-foreground">Semester: {selectedCourse.semester}</p>
                <p className="text-sm text-muted-foreground">
                  Sections: {selectedCourse.sections.length} ({getTotalEnrollments(selectedCourse)} students enrolled)
                </p>
              </div>
              {getTotalEnrollments(selectedCourse) > 0 && (
                <div className="mt-4 bg-red-50 p-3 rounded-md">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This course has {getTotalEnrollments(selectedCourse)} active enrollments
                    across {selectedCourse.sections.length} sections. Deleting it will remove all student enrollments.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          {selectedCourse && (
            <div className="py-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Course</p>
                <p className="text-sm">
                  {selectedCourse.code}: {selectedCourse.title}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-code">Section Code</Label>
                <Input
                  id="section-code"
                  placeholder="e.g., A, B, C"
                  defaultValue={selectedSection?.sectionCode || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Select defaultValue={selectedSection?.instructor || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyMembers
                      .filter((faculty) => faculty.department === selectedCourse.department)
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
          )}
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
          {selectedCourse && selectedSection && (
            <div className="py-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Course</p>
                <p className="text-sm">
                  {selectedCourse.code}: {selectedCourse.title}
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
                      .filter((faculty) => faculty.department === selectedCourse.department)
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
    </div>
  )
}
