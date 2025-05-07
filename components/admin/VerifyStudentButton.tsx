"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface VerifyStudentButtonProps {
  userId: string;
  isVerified: boolean;
  onVerificationChange: (isVerified: boolean) => void;
}

export function VerifyStudentButton({
  userId,
  isVerified,
  onVerificationChange,
}: VerifyStudentButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleVerificationChange = async () => {
    setIsSubmitting(true);
    try {
      // Call the parent component's handler
      await onVerificationChange(!isVerified);
      setShowDialog(false);
    } catch (error) {
      console.error("Error changing verification status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogTrigger asChild>
        <Button
          variant={isVerified ? "destructive" : "default"}
          size="sm"
          className={isVerified ? "bg-red-600 hover:bg-red-700" : ""}
        >
          {isVerified ? (
            <>
              <XCircle className="h-4 w-4 mr-2" />
              Unverify
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isVerified ? "Unverify Student" : "Verify Student"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isVerified
              ? "This will unverify the student account, preventing them from enrolling in courses until they are verified again."
              : "This will verify the student account, allowing them to enroll in courses regardless of document verification status."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleVerificationChange}
            disabled={isSubmitting}
            className={isVerified ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isVerified ? (
              "Unverify Student"
            ) : (
              "Verify Student"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
