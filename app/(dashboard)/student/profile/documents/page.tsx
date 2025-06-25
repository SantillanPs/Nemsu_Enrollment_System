"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DocumentUpload } from "../../../../components/DocumentUpload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DocumentType,
  VerificationStatus,
  documentLabels,
  requiredDocuments,
} from "@/app/constants/documents";

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

  // Using requiredDocuments and documentLabels from constants

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

    console.log("Uploading document:", {
      type: documentType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Document upload API error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(errorData.error || "Failed to upload document");
      }

      const newDocument = await response.json();
      console.log("Document uploaded successfully:", newDocument);

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
      {/* Document Upload Suspended Notice */}
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Document Uploads Suspended</AlertTitle>
        <AlertDescription>
          Document uploads are currently suspended. Please contact the
          administration for more information.
        </AlertDescription>
      </Alert>

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
                All your documents are automatically verified.
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

      {profile?.isVerified && (
        <Card className="border-green-200 bg-green-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">
                  Documents Automatically Verified
                </h3>
                <p className="text-sm text-green-700">
                  Since your account is verified, all your documents are
                  automatically verified. You don't need to upload any
                  additional documents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {requiredDocuments.map((type) => {
          // If student is verified but doesn't have this document, create a verified placeholder
          let currentDocument = documents.find((doc) => doc.type === type);

          // If student is verified, ensure all documents show as verified
          if (profile?.isVerified) {
            if (currentDocument) {
              // Ensure existing document shows as verified
              currentDocument = {
                ...currentDocument,
                status: "VERIFIED",
                verificationMessage:
                  "Automatically verified because student account is verified",
              };
            } else {
              // For missing documents when student is verified, we don't need to show upload option
              // Just show that it's not needed
              currentDocument = {
                id: `auto-verified-${type}`,
                type: type,
                fileUrl: "",
                status: "VERIFIED",
                verificationMessage:
                  "Document not required - student account is already verified",
              };
            }
          }

          return (
            <DocumentUpload
              key={type}
              documentType={type}
              documentLabel={documentLabels[type]}
              currentDocument={currentDocument}
              onUpload={
                profile?.isVerified
                  ? undefined
                  : (file) => handleUpload(type, file)
              }
              onDelete={
                profile?.isVerified || !currentDocument
                  ? undefined
                  : handleDelete
              }
            />
          );
        })}
      </div>
    </div>
  );
}
