"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, User, BookOpen, Calendar, CheckCircle, XCircle } from "lucide-react"

export default function EnrollmentRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)

  // Mock data for enrollment requests
  const pendingRequests = [
    {
      id: 1,
      student: {
        id: "ST12345",
        name: "John Smith",
        email: "john.smith@university.edu",
        major: "Computer Science",
        year: "Sophomore",
        gpa: 3.7,
      },
      course: {
        id: "CS101",
        title: "Introduction to Computer Science",
        schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
        credits: 3,
      },
      requestDate: "2023-08-15",
      status: "pending",
    },
    {
      id: 2,
      student: {
        id: "ST12346",
        name: "Emily Johnson",
        email: "emily.johnson@university.edu",
        major: "Computer Science",
        year: "Freshman",
        gpa: 3.9,
      },
      course: {
        id: "CS101",
        title: "Introduction to Computer Science",
        schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
        credits: 3,
      },
      requestDate: "2023-08-14",
      status: "pending",
    },
    {
      id: 3,
      student: {
        id: "ST12347",
        name: "Michael Brown",
        email: "michael.brown@university.edu",
        major: "Mathematics",
        year: "Junior",
        gpa: 3.5,
      },
      course: {
        id: "CS201",
        title: "Advanced Programming",
        schedule: "Tue, Thu 1:00 PM - 2:30 PM",
        credits: 4,
      },
      requestDate: "2023-08-16",
      status: "pending",
    },
  ]

  const processedRequests = [
    {
      id: 4,
      student: {
        id: "ST12348",
        name: "Sarah Davis",
        email: "sarah.davis@university.edu",
        major: "Computer Science",
        year: "Sophomore",
        gpa: 3.6,
      },
      course: {
        id: "CS101",
        title: "Introduction to Computer Science",
        schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
        credits: 3,
      },
      requestDate: "2023-08-10",
      processedDate: "2023-08-12",
      status: "approved",
      processedBy: "Dr. Alan Turing",
    },
    {
      id: 5,
      student: {
        id: "ST12349",
        name: "David Wilson",
        email: "david.wilson@university.edu",
        major: "Physics",
        year: "Freshman",
        gpa: 3.2,
      },
      course: {
        id: "CS101",
        title: "Introduction to Computer Science",
        schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
        credits: 3,
      },
      requestDate: "2023-08-09",
      processedDate: "2023-08-12",
      status: "rejected",
      processedBy: "Dr. Alan Turing",
      rejectionReason: "Prerequisite requirements not met.",
    },
    {
      id: 6,
      student: {
        id: "ST12350",
        name: "Jennifer Martinez",
        email: "jennifer.martinez@university.edu",
        major: "Computer Engineering",
        year: "Junior",
        gpa: 3.8,
      },
      course: {
        id: "CS201",
        title: "Advanced Programming",
        schedule: "Tue, Thu 1:00 PM - 2:30 PM",
        credits: 4,
      },
      requestDate: "2023-08-08",
      processedDate: "2023-08-10",
      status: "approved",
      processedBy: "Dr. Alan Turing",
    },
  ]

  // Get unique courses for filter dropdown
  const courses = [
    "all",
    ...new Set([...pendingRequests.map((req) => req.course.id), ...processedRequests.map((req) => req.course.id)]),
  ]

  // Filter requests based on search term and course
  const filterRequests = (requests: any[]) => {
    return requests.filter((request) => {
      const matchesSearch =
        request.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.course.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCourse = selectedCourse === "all" || request.course.id === selectedCourse

      return matchesSearch && matchesCourse
    })
  }

  const filteredPendingRequests = filterRequests(pendingRequests)
  const filteredProcessedRequests = filterRequests(processedRequests)

  const handleApprove = (request: any) => {
    // In a real app, this would send a request to your backend
    console.log(`Approving enrollment request for ${request.student.name} in ${request.course.title}`)
    // In a real app, you would update the database here
  }

  const handleReject = (request: any) => {
    setSelectedStudent(request)
    setShowRejectionDialog(true)
  }

  const confirmReject = () => {
    // In a real app, this would send a request to your backend
    console.log(`Rejecting enrollment request for ${selectedStudent.student.name} in ${selectedStudent.course.title}`)
    console.log(`Reason: ${rejectionReason}`)
    // In a real app, you would update the database here

    setShowRejectionDialog(false)
    setRejectionReason("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by student name, ID, or course..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course} value={course}>
                  {course === "all" ? "All Courses" : course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="processed">Processed Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-6">
            {filteredPendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{request.student.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Student ID: {request.student.id} | {request.student.major}, {request.student.year}
                      </CardDescription>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {request.course.id}: {request.course.title}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{request.course.schedule}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">GPA: {request.student.gpa}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Requested on: {request.requestDate}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Email: {request.student.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                      onClick={() => handleReject(request)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(request)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPendingRequests.length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No pending enrollment requests</h3>
                <p className="text-muted-foreground mt-1">All enrollment requests have been processed</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="processed" className="mt-6">
          <div className="grid gap-6">
            {filteredProcessedRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{request.student.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Student ID: {request.student.id} | {request.student.major}, {request.student.year}
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        request.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {request.course.id}: {request.course.title}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Requested on: {request.requestDate}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Processed on: {request.processedDate}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Processed by: {request.processedBy}</span>
                      </div>
                      {request.status === "rejected" && request.rejectionReason && (
                        <div className="flex items-start">
                          <XCircle className="h-4 w-4 mr-2 mt-0.5 text-red-500" />
                          <span className="text-sm">Reason: {request.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredProcessedRequests.length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No processed enrollment requests</h3>
                <p className="text-muted-foreground mt-1">No enrollment requests have been processed yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Enrollment Request</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this enrollment request.</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Student</p>
                <p className="text-sm">
                  {selectedStudent.student.name} ({selectedStudent.student.id})
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Course</p>
                <p className="text-sm">
                  {selectedStudent.course.id}: {selectedStudent.course.title}
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Reason for Rejection
                </label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for rejecting this enrollment request..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectionReason.trim()}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
