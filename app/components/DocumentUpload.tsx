import { useState } from "react";
import { Upload, X, FileCheck, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentType, VerificationStatus } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

interface DocumentUploadProps {
  documentType: DocumentType;
  documentLabel: string;
  currentDocument?: {
    id: string;
    fileUrl: string;
    status: VerificationStatus;
    verificationMessage?: string;
  };
  onUpload: (file: File) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
}

export function DocumentUpload({
  documentType,
  documentLabel,
  currentDocument,
  onUpload,
  onDelete,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const statusConfig = {
    PENDING: {
      color: "bg-yellow-500",
      icon: Clock,
      text: "Pending Review",
    },
    VERIFIED: {
      color: "bg-green-500",
      icon: FileCheck,
      text: "Verified",
    },
    REJECTED: {
      color: "bg-red-500",
      icon: AlertCircle,
      text: "Rejected",
    },
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "File size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Error",
        description: "File type should be PDF, JPEG, or PNG",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentDocument || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(currentDocument.id);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{documentLabel}</CardTitle>
        <CardDescription>
          Upload your {documentLabel.toLowerCase()} (PDF, JPEG, or PNG, max 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentDocument ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Document uploaded</span>
              </div>
              {currentDocument.status && (
                <Badge
                  variant="secondary"
                  className={statusConfig[currentDocument.status].color}
                >
                  {(() => {
                    const StatusIcon =
                      statusConfig[currentDocument.status].icon;
                    return <StatusIcon className="mr-1 h-3 w-3" />;
                  })()}
                  {statusConfig[currentDocument.status].text}
                </Badge>
              )}
            </div>

            {currentDocument.verificationMessage && (
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {currentDocument.verificationMessage}
              </div>
            )}

            {onDelete && currentDocument.status !== "VERIFIED" && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  "Deleting..."
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Remove Document
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">No document uploaded</span>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Input
                id={`document-${documentType}`}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {isUploading && (
                <Button disabled className="w-full">
                  <Upload className="mr-2 h-4 w-4 animate-bounce" />
                  Uploading...
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
