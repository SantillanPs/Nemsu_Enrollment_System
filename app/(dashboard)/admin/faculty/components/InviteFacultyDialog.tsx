"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, Copy, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema for faculty invitation
const invitationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  expirationDays: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: "Please select a valid expiration period",
  }),
});

type InvitationFormValues = z.infer<typeof invitationSchema>;

export function InviteFacultyDialog() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize form
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      expirationDays: "7",
    },
  });

  // Handle form submission
  const onSubmit = async (data: InvitationFormValues) => {
    setIsLoading(true);
    setInvitationUrl(null);

    try {
      const response = await fetch("/api/admin/faculty-invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          expirationDays: parseInt(data.expirationDays),
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create invitation");
      }

      // Set the invitation URL
      setInvitationUrl(responseData.invitation.invitationUrl);

      // Show success toast
      toast({
        title: "Invitation Created",
        description: "Faculty invitation has been created successfully.",
      });
    } catch (error) {
      console.error("Invitation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false);
      setInvitationUrl(null);
      setCopied(false);
      form.reset();
    }
  };

  // Copy invitation URL to clipboard with fallback
  const copyToClipboard = () => {
    if (!invitationUrl) return;

    console.log("Attempting to copy URL:", invitationUrl);

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
          .writeText(invitationUrl)
          .then(() => {
            console.log("Clipboard API: Text successfully copied");
            setCopied(true);
            toast({
              title: "Copied to Clipboard",
              description: "Invitation link has been copied to clipboard.",
            });

            // Reset copied state after 3 seconds
            setTimeout(() => setCopied(false), 3000);
          })
          .catch((err) => {
            console.error("Clipboard API failed:", err);

            // Try fallback method
            console.log("Trying fallback method...");
            const fallbackSuccess = fallbackCopyTextToClipboard(invitationUrl);

            if (fallbackSuccess) {
              setCopied(true);
              toast({
                title: "Copied to Clipboard",
                description: "Invitation link has been copied to clipboard.",
              });

              // Reset copied state after 3 seconds
              setTimeout(() => setCopied(false), 3000);
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
        const fallbackSuccess = fallbackCopyTextToClipboard(invitationUrl);

        if (fallbackSuccess) {
          setCopied(true);
          toast({
            title: "Copied to Clipboard",
            description: "Invitation link has been copied to clipboard.",
          });

          // Reset copied state after 3 seconds
          setTimeout(() => setCopied(false), 3000);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Mail className="mr-2 h-4 w-4" />
          Invite Faculty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Faculty Member</DialogTitle>
          <DialogDescription>
            Send an invitation link to a new faculty member to join the system.
          </DialogDescription>
        </DialogHeader>

        {!invitationUrl ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="faculty@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDays">Invitation Expires In</Label>
              <Select
                defaultValue="7"
                onValueChange={(value) =>
                  form.setValue("expirationDays", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.expirationDays && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.expirationDays.message}
                </p>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Invitation"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Invitation Link</Label>
              <div className="flex items-center">
                <Input value={invitationUrl} readOnly className="pr-10" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-[-40px]"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link with the faculty member. The link will expire
                after the selected period.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button type="button" onClick={copyToClipboard}>
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
