"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Search, Filter, MoreHorizontal, UserPlus, Mail, Phone, BookOpen, Calendar, Award, Clock } from "lucide-react"

export default function FacultyManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null)

  // Mock data for faculty members
  const facultyMembers = [
    {
      id: 1,
      name: "Dr. Alan Turing",
      email: "alan.turing@university.edu",
      phone: "(555) 123-4567",
      department: "Computer Science",
      position: "Professor",
      status: "active",
      joinDate: "2018-09-01",
      courses: 3,
      students: 87,
      education: "Ph.D. in Mathematics, Cambridge University",
      specialization: "Artificial Intelligence, Computational Theory",
      officeHours: "Monday, Wednesday: 10:00 AM - 12:00 PM",
      officeLocation: "Science Building, Room 305",
      bio: "Dr. Turing is a renowned expert in computational theory and artificial intelligence. He has published numerous papers on machine learning algorithms and their applications.",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      name: "Dr. Katherine Johnson",
      email: "katherine.johnson@university.edu",
      phone: "(555) 234-5678",
      department: "Mathematics",
      position: "Associate Professor",
      status: "active",
      joinDate: "2019-01-15",
      courses: 2,
      students: 65,
      education: "Ph.D. in Mathematics, West Virginia University",
      specialization: "Analytical Geometry, Orbital Mechanics",
      officeHours: "Tuesday, Thursday: 1:00 PM - 3:00 PM",
      officeLocation: "Math Building, Room 210",
      bio: "Dr. Johnson is an expert in analytical geometry and has contributed significantly to the field of orbital mechanics. Her work has been recognized with numerous awards.",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 3,
      name: "Prof. Jane Austen",
      email: "jane.austen@university.edu",
      phone: "(555) 345-6789",
      department: "English",
      position: "Assistant Professor",
      status: "active",
      joinDate: "2020-08-15",
      courses: 4,
      students: 112,
      education: "M.A. in English Literature, Oxford University",
      specialization: "19th Century Literature, Creative Writing",
      officeHours: "Monday, Wednesday, Friday: 2:00 PM - 3:00 PM",
      officeLocation: "Humanities Building, Room 115",
      bio: "Professor Austen specializes in 19th century literature and creative writing. She has published several novels and is a recipient of the National Book Award.",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 4,
      name: "Dr. Richard Feynman",
      email: "richard.feynman@university.edu",
      phone: "(555) 456-7890",
      department: "Physics",
      position: "Professor",
      status: "active",
      joinDate: "2017-06-01",
      courses: 2,
      students: 58,
      education: "Ph.D. in Physics, Princeton University",
      specialization: "Quantum Mechanics, Particle Physics",
      officeHours: "Tuesday, Thursday: 10:00 AM - 12:00 PM",
      officeLocation: "Science Building, Room 401",
      bio: "Dr. Feynman is a Nobel laureate in Physics for his work on quantum electrodynamics. He is known for his ability to explain complex concepts in simple terms.",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 5,
      name: "Dr. Marie Curie",
      email: "marie.curie@university.edu",
      phone: "(555) 567-8901",
      department: "Chemistry",
      position: "Professor",
      status: "on leave",
      joinDate: "2016-09-01",
      courses: 0,
      students: 0,
      education: "Ph.D. in Physics and Chemistry, University of Paris",
      specialization: "Radioactivity, Nuclear Physics",
      officeHours: "Currently on sabbatical",
      officeLocation: "Science Building, Room 210",
      bio: "Dr. Curie is a two-time Nobel laureate in Physics and Chemistry. Her research on radioactivity has revolutionized the field of nuclear physics.",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 6,
      name: "Prof. Howard Zinn",
      email: "howard.zinn@university.edu",
      phone: "(555) 678-9012",
      department: "History",
      position: "Associate Professor",
      status: "active",
      joinDate: "2019-09-01",
      courses: 3,
      students: 95,
      education: "Ph.D. in History, Columbia University",
      specialization: "American History, Social Movements",
      officeHours: "Monday, Wednesday: 1:00 PM - 3:00 PM",
      officeLocation: "Humanities Building, Room 310",
      bio: "Professor Zinn specializes in American history with a focus on social movements. His work has influenced how history is taught in universities across the country.",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 7,
      name: "Dr. Rosalind Franklin",
      email: "rosalind.franklin@university.edu",
      phone: "(555) 789-0123",
      department: "Biology",
      position: "Assistant Professor",
      status: "active",
      joinDate: "2021-01-15",
      courses: 2,
      students: 72,
      education: "Ph.D. in Chemistry, Cambridge University",
      specialization: "Molecular Biology, X-ray Crystallography",
      officeHours: "Tuesday, Thursday: 9:00 AM - 11:00 AM",
      officeLocation: "Life Sciences Building, Room 205",
      bio: "Dr. Franklin is a pioneer in the field of molecular biology. Her work on X-ray crystallography has been instrumental in understanding the structure of DNA.",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 8,
      name: "Prof. Philip Kotler",
      email: "philip.kotler@university.edu",
      phone: "(555) 890-1234",
      department: "Business",
      position: "Professor",
      status: "inactive",
      joinDate: "2015-09-01",
      courses: 0,
      students: 0,
      education: "Ph.D. in Economics, MIT",
      specialization: "Marketing, Business Strategy",
      officeHours: "Not currently teaching",
      officeLocation: "Business Building, Room 405",
      bio: "Professor Kotler is considered the father of modern marketing. His textbooks on marketing principles are used in business schools worldwide.",
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  // Get unique departments for filter dropdown
  const departments = ["all", ...new Set(facultyMembers.map((faculty) => faculty.department))]

  // Filter faculty members based on search term, department, and status
  const filteredFaculty = facultyMembers.filter((faculty) => {
    const matchesSearch =
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = selectedDepartment === "all" || faculty.department === selectedDepartment
    const matchesStatus = selectedStatus === "all" || faculty.status === selectedStatus

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleDeleteFaculty = (faculty: any) => {
    setSelectedFaculty(faculty)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    // In a real app, this would send a request to your backend
    console.log(`Deleting faculty: ${selectedFaculty.name}`)
    // In a real app, you would update the database here

    setShowDeleteDialog(false)
    setSelectedFaculty(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Faculty Management</h1>
        <Link href="/dashboard/admin/faculty/add">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Faculty
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, or department..."
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
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty Members</CardTitle>
          <CardDescription>Manage faculty members, their courses, and information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculty.map((faculty) => (
                <TableRow key={faculty.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <img
                        src={faculty.image || "/placeholder.svg"}
                        alt={faculty.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <div>{faculty.name}</div>
                        <div className="text-xs text-muted-foreground">{faculty.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{faculty.department}</TableCell>
                  <TableCell>{faculty.position}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        faculty.status === "active"
                          ? "bg-green-100 text-green-800"
                          : faculty.status === "on leave"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {faculty.status.charAt(0).toUpperCase() + faculty.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{faculty.courses}</TableCell>
                  <TableCell>{faculty.students}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Link href={`/dashboard/admin/faculty/${faculty.id}`} className="flex w-full">
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/dashboard/admin/faculty/edit/${faculty.id}`} className="flex w-full">
                            Edit Faculty
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteFaculty(faculty)}>
                          Delete Faculty
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredFaculty.length === 0 && (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No faculty members found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Faculty</TabsTrigger>
          <TabsTrigger value="on-leave">On Leave</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {facultyMembers
              .filter((faculty) => faculty.status === "active")
              .map((faculty) => (
                <Card key={faculty.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={faculty.image || "/placeholder.svg"}
                          alt={faculty.name}
                          className="h-12 w-12 rounded-full"
                        />
                        <div>
                          <CardTitle className="text-base">{faculty.name}</CardTitle>
                          <CardDescription>{faculty.position}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Department: {faculty.department}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{faculty.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{faculty.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Joined: {faculty.joinDate}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Teaching {faculty.courses} courses</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link href={`/dashboard/admin/faculty/${faculty.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="on-leave" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {facultyMembers
              .filter((faculty) => faculty.status === "on leave")
              .map((faculty) => (
                <Card key={faculty.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={faculty.image || "/placeholder.svg"}
                          alt={faculty.name}
                          className="h-12 w-12 rounded-full"
                        />
                        <div>
                          <CardTitle className="text-base">{faculty.name}</CardTitle>
                          <CardDescription>{faculty.position}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Department: {faculty.department}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{faculty.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{faculty.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Joined: {faculty.joinDate}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>On leave until further notice</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link href={`/dashboard/admin/faculty/${faculty.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {facultyMembers.filter((faculty) => faculty.status === "on leave").length === 0 && (
              <div className="col-span-full text-center py-10">
                <h3 className="text-lg font-medium">No faculty members on leave</h3>
                <p className="text-muted-foreground mt-1">All faculty members are currently active or inactive</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="inactive" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {facultyMembers
              .filter((faculty) => faculty.status === "inactive")
              .map((faculty) => (
                <Card key={faculty.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={faculty.image || "/placeholder.svg"}
                          alt={faculty.name}
                          className="h-12 w-12 rounded-full"
                        />
                        <div>
                          <CardTitle className="text-base">{faculty.name}</CardTitle>
                          <CardDescription>{faculty.position}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Department: {faculty.department}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{faculty.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{faculty.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Joined: {faculty.joinDate}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                      >
                        Reactivate
                      </Button>
                      <Link href={`/dashboard/admin/faculty/${faculty.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {facultyMembers.filter((faculty) => faculty.status === "inactive").length === 0 && (
              <div className="col-span-full text-center py-10">
                <h3 className="text-lg font-medium">No inactive faculty members</h3>
                <p className="text-muted-foreground mt-1">All faculty members are currently active or on leave</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Faculty Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this faculty member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedFaculty && (
            <div className="py-4">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedFaculty.image || "/placeholder.svg"}
                  alt={selectedFaculty.name}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <p className="font-medium">{selectedFaculty.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedFaculty.department}, {selectedFaculty.position}
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-red-50 p-3 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Deleting this faculty member will remove all their data, including course
                  assignments and student relationships.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Faculty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
