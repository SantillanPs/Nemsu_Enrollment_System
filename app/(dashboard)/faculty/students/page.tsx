"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/components/ui/use-toast";
import { VerifyStudentButton } from "@/components/shared/VerifyStudentButton";
import { Search, AlertCircle, Loader2, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { hasRoleAccess } from "@/lib/utils/role-check";

interface Document {
  id: string;
  type: string;
  fileUrl: string;
  status: string;
  profileId: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    studentId?: string;
    isVerified: boolean;
    user: {
      email: string;
    };
  };
}

interface Student {
  profileId: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  email: string;
  isVerified: boolean;
  documents: Document[];
  status: "PENDING" | "VERIFIED" | "REJECTED" | "MIXED";
}

export default function FacultyStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch students data
  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching student documents...");
      const response = await fetch("/api/faculty/student-documents");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", response.status, errorData);
        throw new Error(
          errorData.error ||
            `Failed to fetch student documents (${response.status})`
        );
      }

      const data = await response.json();
      console.log("Student documents fetched successfully:", data.length);

      // Process the documents to group by student
      const studentMap = new Map<string, Student>();

      // If there are no documents, we'll still have an empty array
      if (data.length === 0) {
        console.log("No student documents found");
        setStudents([]);
        setFilteredStudents([]);
        return;
      }

      data.forEach((doc: Document) => {
        const profileId = doc.profile.id;

        if (!studentMap.has(profileId)) {
          studentMap.set(profileId, {
            profileId,
            firstName: doc.profile.firstName,
            lastName: doc.profile.lastName,
            studentId: doc.profile.studentId,
            email: doc.profile.user.email,
            isVerified: doc.profile.isVerified,
            documents: [],
            status: "PENDING", // Default, will be updated
          });
        }

        const student = studentMap.get(profileId)!;
        student.documents.push(doc);
      });

      // Update student status based on documents
      studentMap.forEach((student) => {
        if (student.documents.length === 0) {
          student.status = "PENDING";
          return;
        }

        const allVerified = student.documents.every(
          (d) => d.status === "VERIFIED"
        );
        const allRejected = student.documents.every(
          (d) => d.status === "REJECTED"
        );
        const hasPending = student.documents.some(
          (d) => d.status === "PENDING"
        );

        if (allVerified) {
          student.status = "VERIFIED";
        } else if (allRejected) {
          student.status = "REJECTED";
        } else if (hasPending) {
          student.status = "PENDING";
        } else {
          student.status = "MIXED";
        }
      });

      const studentList = Array.from(studentMap.values());
      console.log(`Processed ${studentList.length} students from documents`);
      setStudents(studentList);
      setFilteredStudents(studentList);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not a faculty member
  useEffect(() => {
    if (
      status === "authenticated" &&
      !hasRoleAccess(session?.user?.role || "", "FACULTY")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  // Fetch data on component mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchStudents();
    }
  }, [status]);

  // Filter students based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        (student.studentId &&
          student.studentId.toLowerCase().includes(searchLower))
      );
    });

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // Handle verification status change
  const handleVerificationChange = async (
    userId: string,
    isVerified: boolean
  ) => {
    // Update local state
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.email === userId) {
          return {
            ...student,
            isVerified,
          };
        }
        return student;
      })
    );

    // Refresh data to get updated document statuses
    await fetchStudents();
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (
    status === "authenticated" &&
    !hasRoleAccess(session?.user?.role || "", "FACULTY")
  ) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Verification</h1>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>
            Verify student accounts to allow them to enroll in courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading students...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.profileId}>
                      <TableCell>
                        <div className="font-medium">
                          {`${student.firstName} ${student.lastName}`}
                        </div>
                      </TableCell>
                      <TableCell>{student.studentId || "N/A"}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={student.isVerified ? "success" : "warning"}
                          className={
                            student.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {student.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{student.documents.length} document(s)</span>
                          <Badge
                            variant={
                              student.status === "VERIFIED"
                                ? "success"
                                : student.status === "REJECTED"
                                ? "destructive"
                                : "outline"
                            }
                            className="ml-2 text-xs"
                          >
                            {student.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <VerifyStudentButton
                            userId={student.email}
                            isVerified={student.isVerified}
                            onVerificationChange={(isVerified) =>
                              handleVerificationChange(
                                student.email,
                                isVerified
                              )
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/faculty/documents?student=${student.profileId}`
                              )
                            }
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Documents
                          </Button>
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
