"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { InviteFacultyDialog } from "@/app/(dashboard)/admin/faculty/components/InviteFacultyDialog";
import { hasRoleAccess } from "@/lib/utils/role-check";

interface FacultyInvitation {
  id: string;
  email: string;
  expiresAt: string;
  status: string;
  createdAt: string;
  invitationUrl: string;
}

export default function SuperAdminFacultyInvitationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<FacultyInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Redirect if not a super admin
  useEffect(() => {
    if (
      status === "authenticated" &&
      !hasRoleAccess(session?.user?.role || "", "SUPER_ADMIN")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  // Fetch invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/faculty-invitations");
        
        if (!response.ok) {
          throw new Error("Failed to fetch invitations");
        }
        
        const data = await response.json();
        setInvitations(data);
      } catch (error) {
        console.error("Error fetching invitations:", error);
        setError("Failed to load invitations. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchInvitations();
    }
  }, [status]);

  // Copy invitation URL to clipboard
  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    
    toast({
      title: "Copied to Clipboard",
      description: "Invitation link has been copied to clipboard.",
    });
    
    // Reset copied state after 3 seconds
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (
    status === "authenticated" &&
    !hasRoleAccess(session?.user?.role || "", "SUPER_ADMIN")
  ) {
    return null; // Will redirect in useEffect
  }

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
          <CardDescription>
            Manage faculty invitation links
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Loading invitations...
                </p>
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
                  {invitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No invitations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>{invitation.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invitation.status === "PENDING"
                                ? "outline"
                                : invitation.status === "ACCEPTED"
                                ? "success"
                                : "destructive"
                            }
                          >
                            {invitation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(invitation.createdAt)}
                        </TableCell>
                        <TableCell>
                          {formatDate(invitation.expiresAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                invitation.invitationUrl,
                                invitation.id
                              )
                            }
                            disabled={invitation.status !== "PENDING"}
                          >
                            {copiedId === invitation.id ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Link
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
