"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DocumentType, VerificationStatus } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Filter,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  FileCheck,
  Loader2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Document {
  id: string;
  type: DocumentType;
  fileUrl: string;
  status: VerificationStatus;
  verificationMessage?: string;
  createdAt: string;
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

interface StudentWithDocuments {
  profileId: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  email: string;
  isVerified: boolean;
  documents: Document[];
  status: "PENDING" | "VERIFIED" | "REJECTED" | "MIXED";
}

export default function FacultyDocuments() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [students, setStudents] = useState<StudentWithDocuments[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<
    StudentWithDocuments[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDocumentType, setSelectedDocumentType] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("VERIFIED");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Function to fetch student documents
  const fetchStudentDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/faculty/student-documents");
      if (!response.ok) {
        throw new Error("Failed to fetch student documents");
      }
      const data = await response.json();
      setDocuments(data);
      const groupedStudents = groupDocumentsByStudent(data);
      setStudents(groupedStudents);
      setFilteredStudents(groupedStudents);
    } catch (error) {
      console.error("Error fetching student documents:", error);
      toast({
        title: "Error",
        description: "Failed to load student documents. Please try again.",
        variant: "destructive",
      });
      setDocuments([]);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Group documents by student
  const groupDocumentsByStudent = (
    docs: Document[]
  ): StudentWithDocuments[] => {
    const studentMap = new Map<string, StudentWithDocuments>();

    docs.forEach((doc) => {
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

      // Update student status based on documents
      const allVerified = student.documents.every(
        (d) => d.status === "VERIFIED"
      );
      const allRejected = student.documents.every(
        (d) => d.status === "REJECTED"
      );
      const hasPending = student.documents.some((d) => d.status === "PENDING");

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

    return Array.from(studentMap.values());
  };

  useEffect(() => {
    fetchStudentDocuments();
  }, []);

  useEffect(() => {
    // Filter students based on search term, status, and document type
    const filtered = students.filter((student) => {
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.studentId &&
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || student.status === selectedStatus;

      const matchesType =
        selectedDocumentType === "all" ||
        student.documents.some((doc) => doc.type === selectedDocumentType);

      return matchesSearch && matchesStatus && matchesType;
    });

    setFilteredStudents(filtered);
  }, [searchTerm, selectedStatus, selectedDocumentType, students]);

  const handleVerify = (document: Document) => {
    setSelectedDocument(document);
    setVerificationStatus("VERIFIED");
    setVerificationMessage("");
    setShowVerificationDialog(true);
  };

  const handleReject = (document: Document) => {
    setSelectedDocument(document);
    setVerificationStatus("REJECTED");
    setVerificationMessage("");
    setShowVerificationDialog(true);
  };

  const submitVerification = async () => {
    if (!selectedDocument) return;

    setIsSubmitting(true);

    try {
      // Call the API to verify the document
      const response = await fetch("/api/documents/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          status: verificationStatus,
          message: verificationMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify document");
      }

      const updatedDocument = await response.json();

      // Update the document in our local state
      const updatedDocuments = documents.map((doc) => {
        if (doc.id === selectedDocument.id) {
          return {
            ...doc,
            status: verificationStatus,
            verificationMessage: verificationMessage || undefined,
          };
        }
        return doc;
      });

      setDocuments(updatedDocuments);

      // Update the students state
      const updatedStudents = groupDocumentsByStudent(updatedDocuments);
      setStudents(updatedStudents);

      setShowVerificationDialog(false);

      // Show success message
      toast({
        title: "Document verification updated",
        description: `The document has been ${verificationStatus.toLowerCase()}.`,
        variant: verificationStatus === "VERIFIED" ? "default" : "destructive",
      });

      // If all documents for this student are now verified, show a special message
      const student = updatedStudents.find(
        (s) => s.profileId === selectedDocument?.profile.id
      );
      if (student && student.status === "VERIFIED" && !student.isVerified) {
        toast({
          title: "Student verification status updated",
          description:
            "All required documents are now verified. The student can now enroll in courses.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error verifying document:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update document verification status.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentTypeLabels: Record<DocumentType, string> = {
    TOR: "Transcript of Records",
    BIRTH_CERTIFICATE: "Birth Certificate",
    GRADES: "Grade Report",
    CLEARANCE: "Clearance Form",
  };

  const statusConfig: Record<
    string,
    { color: string; icon: any; text: string }
  > = {
    PENDING: {
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
      text: "Pending",
    },
    VERIFIED: {
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      text: "Verified",
    },
    REJECTED: {
      color: "bg-red-100 text-red-800",
      icon: XCircle,
      text: "Rejected",
    },
    MIXED: {
      color: "bg-purple-100 text-purple-800",
      icon: AlertCircle,
      text: "Mixed",
    },
  };

  const documentTypes = ["all", ...Object.keys(documentTypeLabels)];
  const statusOptions = ["all", "PENDING", "VERIFIED", "REJECTED", "MIXED"];

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Student Document Verification</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by student name, ID, or email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedDocumentType}
            onValueChange={setSelectedDocumentType}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-gray-400" />
                <span>Document Type</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all"
                    ? "All Document Types"
                    : documentTypeLabels[type as DocumentType]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-gray-400" />
                <span>Status</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "all"
                    ? "All Statuses"
                    : statusConfig[status].text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="mixed">Mixed</TabsTrigger>
        </TabsList>

        {["pending", "verified", "rejected", "mixed"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    Loading student documents...
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredStudents
                  .filter(
                    (student) =>
                      student.status.toLowerCase() === tabValue.toLowerCase()
                  )
                  .map((student) => (
                    <Card key={student.profileId}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>
                              {student.firstName} {student.lastName}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Student ID: {student.studentId} | {student.email}
                            </CardDescription>
                          </div>
                          <Badge className={statusConfig[student.status].color}>
                            {React.createElement(
                              statusConfig[student.status].icon,
                              { className: "h-3 w-3 mr-1" }
                            )}
                            {statusConfig[student.status].text}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="documents">
                            <AccordionTrigger>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                <span>
                                  Documents ({student.documents.length})
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 mt-2">
                                {student.documents.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="border rounded-md p-4"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <h4 className="font-medium">
                                          {documentTypeLabels[doc.type]}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                          Submitted:{" "}
                                          {new Date(
                                            doc.createdAt
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <Badge
                                        className={
                                          statusConfig[doc.status].color
                                        }
                                      >
                                        {React.createElement(
                                          statusConfig[doc.status].icon,
                                          { className: "h-3 w-3 mr-1" }
                                        )}
                                        {statusConfig[doc.status].text}
                                      </Badge>
                                    </div>

                                    {doc.verificationMessage && (
                                      <div className="bg-muted p-3 rounded-md text-sm mb-3">
                                        <p className="font-medium mb-1">
                                          Verification Notes:
                                        </p>
                                        <p>{doc.verificationMessage}</p>
                                      </div>
                                    )}

                                    <div className="flex gap-2">
                                      <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2`}
                                      >
                                        <FileCheck className="h-4 w-4 mr-2" />
                                        View Document
                                      </a>

                                      {doc.status === "PENDING" && (
                                        <>
                                          <Button
                                            variant="outline"
                                            className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                            onClick={() => handleReject(doc)}
                                          >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                          </Button>
                                          <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            onClick={() => handleVerify(doc)}
                                          >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Verify
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                      <CardFooter>
                        <div className="w-full flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            {
                              student.documents.filter(
                                (d) => d.status === "VERIFIED"
                              ).length
                            }{" "}
                            of {student.documents.length} documents verified
                          </div>
                          <div>
                            {student.isVerified ? (
                              <Badge className="bg-green-100 text-green-800">
                                Account Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Verification Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}

                {filteredStudents.filter(
                  (student) =>
                    student.status.toLowerCase() === tabValue.toLowerCase()
                ).length === 0 && (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium">
                      No {tabValue} students
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {tabValue === "pending"
                        ? "All student documents have been processed"
                        : `No students with ${tabValue} documents match your filters`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Verification Dialog */}
      <Dialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verificationStatus === "VERIFIED"
                ? "Verify Document"
                : "Reject Document"}
            </DialogTitle>
            <DialogDescription>
              {verificationStatus === "VERIFIED"
                ? "Confirm that this document meets all requirements."
                : "Provide a reason for rejecting this document."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedDocument && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Student: {selectedDocument.profile.firstName}{" "}
                  {selectedDocument.profile.lastName}
                </p>
                <p className="text-sm">
                  Document: {documentTypeLabels[selectedDocument.type]}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                {verificationStatus === "VERIFIED"
                  ? "Verification Notes (Optional)"
                  : "Rejection Reason"}
              </label>
              <Textarea
                id="message"
                placeholder={
                  verificationStatus === "VERIFIED"
                    ? "Add any notes about this document..."
                    : "Explain why this document is being rejected..."
                }
                value={verificationMessage}
                onChange={(e) => setVerificationMessage(e.target.value)}
                required={verificationStatus === "REJECTED"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVerificationDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitVerification}
              disabled={
                isSubmitting ||
                (verificationStatus === "REJECTED" && !verificationMessage)
              }
              className={
                verificationStatus === "VERIFIED"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : verificationStatus === "VERIFIED" ? (
                "Verify Document"
              ) : (
                "Reject Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
