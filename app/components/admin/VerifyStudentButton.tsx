"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VerifyStudentButtonProps {
  userId: string;
  isVerified: boolean;
  onVerificationChange?: (isVerified: boolean) => void;
}

export function VerifyStudentButton({
  userId,
  isVerified,
  onVerificationChange,
}: VerifyStudentButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [verifyAction, setVerifyAction] = useState<boolean>(false);

  const handleVerify = async (verify: boolean) => {
    setVerifyAction(verify);
    setShowConfirmDialog(true);
  };

  const confirmVerification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/verify-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          isVerified: verifyAction,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update verification status");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description:
          data.message ||
          `Student ${verifyAction ? "verified" : "unverified"} successfully`,
        variant: verifyAction ? "default" : "destructive",
      });

      // Call the callback if provided
      if (onVerificationChange) {
        onVerificationChange(verifyAction);
      }
    } catch (error) {
      console.error("Error verifying student:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      {isVerified ? (
        <Button
          variant="outline"
          size="sm"
          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          onClick={() => handleVerify(false)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          Unverify
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
          onClick={() => handleVerify(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Verify
        </Button>
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {verifyAction ? "Verify Student" : "Unverify Student"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {verifyAction
                ? "This will verify the student account, allowing them to enroll in courses. All their documents will be automatically verified. Are you sure?"
                : "This will unverify the student account, preventing them from enrolling in courses until they are verified again. Are you sure?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmVerification();
              }}
              className={
                verifyAction
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {verifyAction ? "Verify" : "Unverify"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
