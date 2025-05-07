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
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
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
      // Determine which API endpoint to use based on user role
      const userRole = session?.user?.role || "";
      const endpoint =
        userRole === "FACULTY"
          ? "/api/faculty/verify-student"
          : "/api/admin/verify-student";

      const response = await fetch(endpoint, {
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

      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error updating verification status:", error);
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {verifyAction ? "Verifying..." : "Unverifying..."}
                </>
              ) : (
                <>{verifyAction ? "Verify" : "Unverify"}</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
