"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DocumentType, VerificationStatus } from "@prisma/client";
import { DocumentUpload } from "../../../../components/DocumentUpload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Document {
  id: string;
  type: DocumentType;
  fileUrl: string;
  status: VerificationStatus;
  verificationMessage?: string;
}

interface Profile {
  isVerified: boolean;
  documents: Document[];
}

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requiredDocuments: DocumentType[] = [
    "TOR",
    "BIRTH_CERTIFICATE",
    "GRADES",
    "CLEARANCE",
  ];

  const documentLabels: Record<DocumentType, string> = {
    TOR: "Transcript of Records",
    BIRTH_CERTIFICATE: "Birth Certificate",
    GRADES: "Previous School Grades",
    CLEARANCE: "School Clearance",
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      setError("Failed to load profile");
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (documentType: DocumentType, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const newDocument = await response.json();
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              documents: [
                ...prev.documents.filter((d) => d.type !== documentType),
                newDocument,
              ],
            }
          : null
      );
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              documents: prev.documents.filter((doc) => doc.id !== documentId),
            }
          : null
      );
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const documents = profile?.documents || [];
  const uploadedCount = documents.length;
  const verifiedCount = documents.filter(
    (doc) => doc.status === "VERIFIED"
  ).length;
  const progress = (uploadedCount / requiredDocuments.length) * 100;

  const allDocumentsVerified = documents.every(
    (doc) => doc.status === "VERIFIED"
  );

  const allDocumentsSubmitted = requiredDocuments.every((type) =>
    documents.some((doc) => doc.type === type)
  );

  // Check if all required documents are submitted and verified
  const hasAllRequiredAndVerified = requiredDocuments.every((type) =>
    documents.some((doc) => doc.type === type && doc.status === "VERIFIED")
  );

  return (
    <div className="container py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Verification Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Upload Progress</span>
              <span>
                {uploadedCount} of {requiredDocuments.length} Documents
              </span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">
              {verifiedCount} of {requiredDocuments.length} documents verified
            </span>
          </div>

          {profile?.isVerified ? (
            <Alert className="bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Account Verified</AlertTitle>
              <AlertDescription>
                Your account has been verified. You can now enroll in courses.
              </AlertDescription>
            </Alert>
          ) : hasAllRequiredAndVerified ? (
            <Alert className="bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Verification Pending</AlertTitle>
              <AlertDescription>
                All required documents have been submitted and verified. Your
                account will be automatically verified soon, or an administrator
                may verify it manually.
              </AlertDescription>
            </Alert>
          ) : allDocumentsSubmitted ? (
            <Alert className="bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Document Verification Pending</AlertTitle>
              <AlertDescription>
                All required documents have been submitted but some are still
                awaiting verification. You will be able to enroll once all
                documents are verified or an administrator verifies your
                account.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Documents Required</AlertTitle>
              <AlertDescription>
                Please upload all required documents ({requiredDocuments.length}
                ) to complete your enrollment verification. You must submit:{" "}
                {requiredDocuments
                  .map((type) => documentLabels[type])
                  .join(", ")}
                .
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {requiredDocuments.map((type) => {
          const currentDocument = documents.find((doc) => doc.type === type);
          return (
            <DocumentUpload
              key={type}
              documentType={type}
              documentLabel={documentLabels[type]}
              currentDocument={currentDocument}
              onUpload={(file) => handleUpload(type, file)}
              onDelete={handleDelete}
            />
          );
        })}
      </div>
    </div>
  );
}
