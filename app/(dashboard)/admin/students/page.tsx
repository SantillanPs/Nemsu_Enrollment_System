"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, AlertCircle, Loader2, UserCog } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { hasRoleAccess } from "@/lib/utils/role-check";

interface Student {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    studentId?: string;
    isVerified: boolean;
    documents: any[];
  } | null;
}

export default function StudentsPage() {
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
      const response = await fetch("/api/admin/students");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not an admin
  useEffect(() => {
    if (
      status === "authenticated" &&
      !hasRoleAccess(session?.user?.role || "", "ADMIN")
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
      const fullName = `${student.profile?.firstName} ${student.profile?.lastName}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.profile?.studentId?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // Handle verification status change
  const handleVerificationChange = async (userId: string, isVerified: boolean) => {
    // Update local state
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.id === userId && student.profile) {
          return {
            ...student,
            profile: {
              ...student.profile,
              isVerified,
            },
          };
        }
        return student;
      })
    );
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
    !hasRoleAccess(session?.user?.role || "", "ADMIN")
  ) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Management</h1>
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
            Manage student accounts and verification status
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
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="font-medium">
                          {student.profile
                            ? `${student.profile.firstName} ${student.profile.lastName}`
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{student.profile?.studentId || "N/A"}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.profile?.isVerified ? "success" : "warning"
                          }
                          className={
                            student.profile?.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {student.profile?.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.profile?.documents.length || 0} document(s)
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {student.profile && (
                            <VerifyStudentButton
                              userId={student.id}
                              isVerified={student.profile.isVerified}
                              onVerificationChange={(isVerified) => 
                                handleVerificationChange(student.id, isVerified)
                              }
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/students/${student.id}`)}
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Details
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
