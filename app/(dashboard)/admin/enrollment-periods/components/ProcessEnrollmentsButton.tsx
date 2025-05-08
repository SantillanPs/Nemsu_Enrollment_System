"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
import { Loader2, CheckCircle } from "lucide-react";

interface ProcessEnrollmentsButtonProps {
  enrollmentPeriodId: string;
  enrollmentPeriodName: string;
  onSuccess?: () => void;
}

export function ProcessEnrollmentsButton({
  enrollmentPeriodId,
  enrollmentPeriodName,
  onSuccess,
}: ProcessEnrollmentsButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const handleProcessEnrollments = async () => {
    try {
      setIsProcessing(true);

      const response = await fetch("/api/enrollment-periods/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enrollmentPeriodId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process enrollments");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: data.message,
      });

      // Close the dialog
      setShowDialog(false);

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error processing enrollments:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process enrollments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Process Enrollments
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Process Enrollments</AlertDialogTitle>
          <AlertDialogDescription>
            This will close the enrollment period &quot;{enrollmentPeriodName}&quot; if
            it&apos;s still active, and process all pending enrollments by assigning
            students to sections. New sections will be created automatically if
            needed.
            <br />
            <br />
            Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleProcessEnrollments();
            }}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Enrollments"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
