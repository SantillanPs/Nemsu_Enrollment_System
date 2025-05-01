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
import { Search, Filter, User, Calendar, CheckCircle, XCircle, FileText } from "lucide-react"

export default function StudentApprovals() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProgram, setSelectedProgram] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Mock data for student approvals
  const pendingApprovals = [
    {
      id: 1,
      name: "Johnreybert Evallar",
      email: "john.Evallar@example.com",
      phone: "90909090909",
      program: "Computer Science",
      degree: "Bachelor of Science",
      applicationDate: "2023-08-15",
      status: "pending",
      documents: [
        { name: "Transcript of records", status: "verified" },
        { name: "ID Proof", status: "verified" },
        { name: "Birth Cirtificate", status: "pending" },
      ],
      personalStatement: "I am passionate about computer science and have been coding since high school...",
      previousEducation: "Harvard Tech, GPA: 3.8",
    },
    {
      id: 2,
      name: "Narwin Villasper",
      email: "Villasper.Narwin@example.com",
      phone: "98080808080",
      program: "Business Administration",
      degree: "Bachelor of Business Administration",
      applicationDate: "2023-08-14",
      status: "pending",
      documents: [
        { name: "Transcript of Records", status: "verified" },
        { name: "ID Proof", status: "verified" },
        { name: "Recommendation Letter", status: "verified" },
      ],
      personalStatement: "My goal is to become a business leader who makes a positive impact...",
      previousEducation: "Stanford University, GPA: 3.6",
    },
    
  ]

  const processedApprovals = [
    {
      id: 4,
      name: "Sarah Davis",
      email: "sarah.davis@example.com",
      phone: "(555) 234-5678",
      program: "Psychology",
      degree: "Bachelor of Arts",
      applicationDate: "2023-08-10",
      processedDate: "2023-08-12",
      status: "approved",
      processedBy: "Admin User",
      documents: [
        { name: "Transcript", status: "verified" },
        { name: "ID Proof", status: "verified" },
        { name: "Recommendation Letter", status: "verified" },
      ],
      personalStatement: "I want to understand human behavior and help people overcome challenges...",
      previousEducation: "Roosevelt High School, GPA: 3.7",
    },
    {
      id: 5,
      name: "David Wilson",
      email: "david.wilson@example.com",
      phone: "(555) 876-5432",
      program: "Computer Science",
      degree: "Bachelor of Science",
      applicationDate: "2023-08-09",
      processedDate: "2023-08-12",
      status: "rejected",
      processedBy: "Admin User",
      rejectionReason: "Incomplete application materials. Missing prerequisite courses.",
      documents: [
        { name: "Transcript", status: "verified" },
        { name: "ID Proof", status: "verified" },
        { name: "Recommendation Letter", status: "missing" },
      ],
      personalStatement: "I've been interested in computers since I was young...",
      previousEducation: "Madison High School, GPA: 2.9",
    },
  ]

  // Get unique programs for filter dropdown
  const programs = [
    "all",
    ...new Set([
      ...pendingApprovals.map((student) => student.program),
      ...processedApprovals.map((student) => student.program),
    ]),
  ]

  // Filter students based on search term and program
  const filterStudents = (students: any[]) => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesProgram = selectedProgram === "all" || student.program === selectedProgram

      return matchesSearch && matchesProgram
    })
  }

  const filteredPendingApprovals = filterStudents(pendingApprovals)
  const filteredProcessedApprovals = filterStudents(processedApprovals)

  const handleApprove = (student: any) => {
    // In a real app, this would send a request to your backend
    console.log(`Approving student application for ${student.name}`)
    // In a real app, you would update the database here
  }

  const handleReject = (student: any) => {
    setSelectedStudent(student)
    setShowRejectionDialog(true)
  }

  const confirmReject = () => {
    // In a real app, this would send a request to your backend
    console.log(`Rejecting student application for ${selectedStudent.name}`)
    console.log(`Reason: ${rejectionReason}`)
    // In a real app, you would update the database here

    setShowRejectionDialog(false)
    setRejectionReason("")
  }

  const viewDetails = (student: any) => {
    setSelectedStudent(student)
    setShowDetailsDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedProgram} onValueChange={setSelectedProgram}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program} value={program}>
                  {program === "all" ? "All Programs" : program}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="processed">Processed Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-6">
            {filteredPendingApprovals.map((student) => (
              <Card key={student.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{student.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {student.email} | {student.phone}
                      </CardDescription>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Program: {student.program}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Degree: {student.degree}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Applied on: {student.applicationDate}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Documents:</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        {student.documents.map((doc, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <Badge
                              className={
                                doc.status === "verified"
                                  ? "bg-green-100 text-green-800"
                                  : doc.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {doc.status}
                            </Badge>
                            <span className="ml-2">{doc.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => viewDetails(student)}>
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                      onClick={() => handleReject(student)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(student)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPendingApprovals.length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No pending student approvals</h3>
                <p className="text-muted-foreground mt-1">All student applications have been processed</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="processed" className="mt-6">
          <div className="grid gap-6">
            {filteredProcessedApprovals.map((student) => (
              <Card key={student.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{student.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {student.email} | {student.phone}
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        student.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }
                    >
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Program: {student.program}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Applied on: {student.applicationDate}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Processed on: {student.processedDate}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Processed by: {student.processedBy}</span>
                      </div>
                      {student.status === "rejected" && student.rejectionReason && (
                        <div className="flex items-start">
                          <XCircle className="h-4 w-4 mr-2 mt-0.5 text-red-500" />
                          <span className="text-sm">Reason: {student.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={() => viewDetails(student)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredProcessedApprovals.length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No processed student approvals</h3>
                <p className="text-muted-foreground mt-1">No student applications have been processed yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Student Application</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this student application.</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Student</p>
                <p className="text-sm">
                  {selectedStudent.name} ({selectedStudent.email})
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Program</p>
                <p className="text-sm">
                  {selectedStudent.program} - {selectedStudent.degree}
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Reason for Rejection
                </label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for rejecting this student application..."
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

      {/* Student Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student Application Details</DialogTitle>
            <DialogDescription>Complete information about the student application</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm">{selectedStudent.phone}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Academic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Program</p>
                      <p className="text-sm">{selectedStudent.program}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Degree</p>
                      <p className="text-sm">{selectedStudent.degree}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Previous Education</p>
                      <p className="text-sm">{selectedStudent.previousEducation}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Application Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Badge
                      className={
                        selectedStudent.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : selectedStudent.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
                    </Badge>
                    <span className="ml-2 text-sm">
                      Applied on {selectedStudent.applicationDate}
                      {selectedStudent.processedDate && ` | Processed on ${selectedStudent.processedDate}`}
                      {selectedStudent.processedBy && ` by ${selectedStudent.processedBy}`}
                    </span>
                  </div>
                  {selectedStudent.status === "rejected" && selectedStudent.rejectionReason && (
                    <div className="bg-red-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{selectedStudent.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Documents</h3>
                <div className="space-y-2">
                  {selectedStudent.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <Badge
                        className={
                          doc.status === "verified"
                            ? "bg-green-100 text-green-800"
                            : doc.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {doc.status}
                      </Badge>
                      <span className="ml-2 text-sm">{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Personal Statement</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm">{selectedStudent.personalStatement}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
