"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { VerifyStudentButton } from "@/components/admin/VerifyStudentButton";
import {
  Search,
  FileCheck,
  FileX,
  Clock,
  Eye,
  Loader2,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Document {
  id: string;
  type: string;
  status: string;
}

interface Student {
  id: string;
  email: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string | null;
    isVerified: boolean;
    documents: Document[];
  };
}

export default function StudentVerificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [documentFilter, setDocumentFilter] = useState("all");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would fetch from your API
      // For now, we'll use mock data
      const mockStudents: Student[] = [
        {
          id: "s1",
          email: "john.student@university.edu",
          profile: {
            id: "p1",
            firstName: "John",
            lastName: "Student",
            studentId: "ST12345",
            isVerified: true,
            documents: [
              { id: "d1", type: "TOR", status: "VERIFIED" },
              { id: "d2", type: "BIRTH_CERTIFICATE", status: "VERIFIED" },
              { id: "d3", type: "GRADES", status: "VERIFIED" },
              { id: "d4", type: "CLEARANCE", status: "VERIFIED" },
            ],
          },
        },
        {
          id: "s2",
          email: "jane.student@university.edu",
          profile: {
            id: "p2",
            firstName: "Jane",
            lastName: "Student",
            studentId: "ST12346",
            isVerified: false,
            documents: [
              { id: "d5", type: "TOR", status: "VERIFIED" },
              { id: "d6", type: "BIRTH_CERTIFICATE", status: "VERIFIED" },
              { id: "d7", type: "GRADES", status: "VERIFIED" },
              { id: "d8", type: "CLEARANCE", status: "PENDING" },
            ],
          },
        },
        {
          id: "s3",
          email: "bob.student@university.edu",
          profile: {
            id: "p3",
            firstName: "Bob",
            lastName: "Student",
            studentId: "ST12347",
            isVerified: false,
            documents: [
              { id: "d9", type: "TOR", status: "VERIFIED" },
              { id: "d10", type: "BIRTH_CERTIFICATE", status: "REJECTED" },
            ],
          },
        },
      ];

      setStudents(mockStudents);
      setFilteredStudents(mockStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.email.toLowerCase().includes(term) ||
          student.profile.firstName.toLowerCase().includes(term) ||
          student.profile.lastName.toLowerCase().includes(term) ||
          (student.profile.studentId &&
            student.profile.studentId.toLowerCase().includes(term))
      );
    }

    // Apply verification filter
    if (verificationFilter !== "all") {
      const isVerified = verificationFilter === "verified";
      filtered = filtered.filter(
        (student) => student.profile.isVerified === isVerified
      );
    }

    // Apply document filter
    if (documentFilter !== "all") {
      if (documentFilter === "complete") {
        // All 4 required documents submitted
        filtered = filtered.filter(
          (student) => student.profile.documents.length >= 4
        );
      } else if (documentFilter === "incomplete") {
        // Missing some required documents
        filtered = filtered.filter(
          (student) => student.profile.documents.length < 4
        );
      } else if (documentFilter === "allVerified") {
        // All submitted documents are verified
        filtered = filtered.filter((student) =>
          student.profile.documents.every((doc) => doc.status === "VERIFIED")
        );
      } else if (documentFilter === "someRejected") {
        // Some documents are rejected
        filtered = filtered.filter((student) =>
          student.profile.documents.some((doc) => doc.status === "REJECTED")
        );
      }
    }

    setFilteredStudents(filtered);
  }, [searchTerm, verificationFilter, documentFilter, students]);

  const handleVerificationChange = (studentId: string, isVerified: boolean) => {
    // Update the student in the state
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId
          ? {
              ...student,
              profile: {
                ...student.profile,
                isVerified,
              },
            }
          : student
      )
    );
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <FileCheck className="h-4 w-4 text-green-500" />;
      case "REJECTED":
        return <FileX className="h-4 w-4 text-red-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={verificationFilter}
                onValueChange={setVerificationFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={documentFilter}
                onValueChange={setDocumentFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Documents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="complete">Complete (4+)</SelectItem>
                  <SelectItem value="incomplete">Incomplete (&lt;4)</SelectItem>
                  <SelectItem value="allVerified">All Verified</SelectItem>
                  <SelectItem value="someRejected">Some Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      No students found matching the filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        {student.profile.studentId || "Not assigned"}
                      </TableCell>
                      <TableCell>
                        {student.profile.firstName} {student.profile.lastName}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {student.profile.documents.map((doc) => (
                            <span
                              key={doc.id}
                              title={`${doc.type}: ${doc.status}`}
                            >
                              {getDocumentStatusIcon(doc.status)}
                            </span>
                          ))}
                          <span className="text-sm ml-1">
                            ({student.profile.documents.length}/4)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.profile.isVerified
                              ? "success"
                              : "destructive"
                          }
                        >
                          {student.profile.isVerified
                            ? "Verified"
                            : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/students/${student.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <VerifyStudentButton
                            userId={student.id}
                            isVerified={student.profile.isVerified}
                            onVerificationChange={(isVerified) =>
                              handleVerificationChange(student.id, isVerified)
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
