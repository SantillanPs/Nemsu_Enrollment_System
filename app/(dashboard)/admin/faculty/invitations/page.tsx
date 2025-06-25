"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InviteFacultyDialog } from "../components/InviteFacultyDialog";

interface FacultyInvitation {
  id: string;
  email: string;
  expiresAt: string;
  status: string;
  createdAt: string;
  invitationUrl: string;
}

export default function FacultyInvitationsPage() {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<FacultyInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/admin/faculty-invitations");
        if (!response.ok) {
          throw new Error("Failed to fetch faculty invitations");
        }

        const data = await response.json();
        setInvitations(data);
      } catch (error) {
        console.error("Error fetching invitations:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load faculty invitations"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  // Copy invitation URL to clipboard with fallback
  const copyToClipboard = (id: string, url: string) => {
    console.log("Attempting to copy URL:", url);

    // Fallback copy function using document.execCommand
    const fallbackCopyTextToClipboard = (text: string) => {
      try {
        // Create a temporary textarea element
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Make the textarea out of viewport
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);

        // Focus and select the text
        textArea.focus();
        textArea.select();

        // Execute the copy command
        const successful = document.execCommand("copy");

        // Remove the temporary element
        document.body.removeChild(textArea);

        if (successful) {
          console.log("Fallback: Copying text command was successful");
          return true;
        } else {
          console.error("Fallback: Could not copy text");
          return false;
        }
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
        return false;
      }
    };

    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined" || typeof document === "undefined") {
        console.warn("Not in browser environment, cannot copy");
        return;
      }

      // Try using the Clipboard API first
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        console.log("Using Clipboard API");

        navigator.clipboard
          .writeText(url)
          .then(() => {
            console.log("Clipboard API: Text successfully copied");
            setCopiedId(id);
            toast({
              title: "Copied to Clipboard",
              description: "Invitation link has been copied to clipboard.",
            });

            // Reset copied state after 3 seconds
            setTimeout(() => setCopiedId(null), 3000);
          })
          .catch((err) => {
            console.error("Clipboard API failed:", err);

            // Try fallback method
            console.log("Trying fallback method...");
            const fallbackSuccess = fallbackCopyTextToClipboard(url);

            if (fallbackSuccess) {
              setCopiedId(id);
              toast({
                title: "Copied to Clipboard",
                description: "Invitation link has been copied to clipboard.",
              });

              // Reset copied state after 3 seconds
              setTimeout(() => setCopiedId(null), 3000);
            } else {
              toast({
                variant: "destructive",
                title: "Failed to copy",
                description: "Please select and copy the link manually.",
              });
            }
          });
      } else {
        // Fallback for browsers without clipboard API
        console.log("Clipboard API not available, using fallback");
        const fallbackSuccess = fallbackCopyTextToClipboard(url);

        if (fallbackSuccess) {
          setCopiedId(id);
          toast({
            title: "Copied to Clipboard",
            description: "Invitation link has been copied to clipboard.",
          });

          // Reset copied state after 3 seconds
          setTimeout(() => setCopiedId(null), 3000);
        } else {
          toast({
            variant: "warning",
            title: "Copy Link Manually",
            description: "Please select and copy the link manually.",
          });
        }
      }
    } catch (error) {
      console.error("Error in copy process:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to copy to clipboard. Please try again or copy manually.",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Check if invitation is expired
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Faculty Invitations</h1>
        <InviteFacultyDialog />
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
          <CardTitle>Active Invitations</CardTitle>
          <CardDescription>Manage faculty invitation links</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading invitations...</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">
                        {invitation.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            invitation.status === "PENDING" &&
                            !isExpired(invitation.expiresAt)
                              ? "bg-blue-100 text-blue-800"
                              : invitation.status === "ACCEPTED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {invitation.status === "PENDING" &&
                          isExpired(invitation.expiresAt)
                            ? "EXPIRED"
                            : invitation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            isExpired(invitation.expiresAt)
                              ? "text-red-500"
                              : ""
                          }
                        >
                          {formatDate(invitation.expiresAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              invitation.id,
                              invitation.invitationUrl
                            )
                          }
                          disabled={
                            invitation.status !== "PENDING" ||
                            isExpired(invitation.expiresAt)
                          }
                        >
                          {copiedId === invitation.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="ml-2">
                            {copiedId === invitation.id
                              ? "Copied!"
                              : "Copy Link"}
                          </span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {invitations.length === 0 && !isLoading && (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium">No invitations found</h3>
                  <p className="text-muted-foreground mt-1">
                    Create a new invitation to get started
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
