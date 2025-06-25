import { useState } from "react";
import {
  Upload,
  X,
  FileCheck,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
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
import {
  DocumentType,
  VerificationStatus,
  statusConfig,
} from "@/app/constants/documents";
import { useToast } from "@/components/ui/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/x-pdf",
  "pdf",
  "jpeg",
  "jpg",
  "png",
];

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Document uploads are suspended - force disable all upload/delete functionality
  const isUploadSuspended = true;

  // Using statusConfig from constants, but adding icons
  const statusIcons = {
    [VerificationStatus.PENDING]: Clock,
    [VerificationStatus.VERIFIED]: FileCheck,
    [VerificationStatus.REJECTED]: AlertCircle,
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "File size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type - be more permissive with MIME types
    const isAcceptedType = ACCEPTED_FILE_TYPES.some(
      (type) => file.type.includes(type.split("/")[1]) || file.type === type
    );

    if (!isAcceptedType) {
      toast({
        title: "Error",
        description: `File type '${file.type}' is not supported. Please use PDF, JPEG, or PNG files.`,
        variant: "destructive",
      });
      return;
    }

    // Just store the file for now, don't upload yet
    setSelectedFile(file);
    toast({
      title: "File Selected",
      description: "Click 'Submit' to upload the document",
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      // Clear the selected file after successful upload
      setSelectedFile(null);
    } catch (error) {
      console.error("Document upload error:", error);
      let errorMessage = "Failed to upload document";

      if (error instanceof Error) {
        errorMessage = `Upload failed: ${error.message}`;
      }

      toast({
        title: "Error",
        description: errorMessage,
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

  // Check if this is an auto-verified document without a file
  const isAutoVerifiedWithoutFile =
    currentDocument?.status === "VERIFIED" &&
    (!currentDocument.fileUrl || currentDocument.fileUrl === "");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{documentLabel}</CardTitle>
        <CardDescription>
          {!onUpload
            ? `${documentLabel} verification status`
            : `Upload your ${documentLabel.toLowerCase()} (PDF, JPEG, or PNG, max 5MB)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentDocument ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isAutoVerifiedWithoutFile ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <FileCheck className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm">
                  {isAutoVerifiedWithoutFile
                    ? "Automatically verified"
                    : "Document uploaded"}
                </span>
              </div>
              {currentDocument.status && (
                <Badge
                  variant="secondary"
                  className={statusConfig[currentDocument.status].color}
                >
                  {(() => {
                    const StatusIcon = statusIcons[currentDocument.status];
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

            {!isAutoVerifiedWithoutFile && currentDocument.fileUrl && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(currentDocument.fileUrl, "_blank")}
              >
                <FileCheck className="mr-2 h-4 w-4" />
                View Document
              </Button>
            )}

            {onUpload &&
              currentDocument.status !== "VERIFIED" &&
              !isUploadSuspended && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    Replace document:
                  </p>
                  <Input
                    id={`document-replace-${documentType}`}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    disabled={isUploading || isUploadSuspended}
                    size="sm"
                  />
                  {selectedFile && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <FileCheck className="mr-1 h-3 w-3 text-green-500" />
                        <span>Selected: {selectedFile.name}</span>
                      </div>
                      <Button
                        onClick={handleSubmit}
                        className="w-full mt-2"
                        size="sm"
                        disabled={isUploading || isUploadSuspended}
                      >
                        {isUploading ? (
                          <>
                            <Upload className="mr-1 h-3 w-3 animate-bounce" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-1 h-3 w-3" />
                            Submit Replacement
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  {isUploading && !selectedFile && (
                    <div className="mt-1 text-xs text-muted-foreground flex items-center">
                      <Upload className="mr-1 h-3 w-3 animate-bounce" />
                      Uploading...
                    </div>
                  )}
                </div>
              )}

            {onUpload &&
              currentDocument.status !== "VERIFIED" &&
              isUploadSuspended && (
                <div className="mt-2">
                  <p className="text-xs text-red-500 mb-1">
                    Document uploads are currently suspended.
                  </p>
                </div>
              )}

            {onDelete &&
              currentDocument.status !== "VERIFIED" &&
              !isUploadSuspended && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-2"
                  onClick={handleDelete}
                  disabled={isDeleting || isUploadSuspended}
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
            {onUpload && !isUploadSuspended && (
              <div className="grid w-full items-center gap-1.5">
                <Input
                  id={`document-${documentType}`}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={isUploading || isUploadSuspended}
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <FileCheck className="mr-1 h-4 w-4 text-green-500" />
                      <span>Selected: {selectedFile.name}</span>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      className="w-full mt-2"
                      disabled={isUploading || isUploadSuspended}
                    >
                      {isUploading ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-bounce" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Document
                        </>
                      )}
                    </Button>
                  </div>
                )}
                {isUploading && !selectedFile && (
                  <Button disabled className="w-full">
                    <Upload className="mr-2 h-4 w-4 animate-bounce" />
                    Uploading...
                  </Button>
                )}
              </div>
            )}
            {onUpload && isUploadSuspended && (
              <div className="mt-2">
                <p className="text-xs text-red-500 mb-1">
                  Document uploads are currently suspended.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
