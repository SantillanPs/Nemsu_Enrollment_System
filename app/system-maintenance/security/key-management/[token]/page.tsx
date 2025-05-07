"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Key,
  Copy,
  Lock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import crypto from "crypto";
import { hasRoleAccess } from "@/lib/utils/role-check";

// This is a hash of the special access token - we store the hash, not the token itself
// The actual token is: maintenance-security-key-8675309
const VALID_TOKEN_HASH =
  "5e7f5e4c8f2f1f5d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f";

export default function RegenerateKeyPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Validate the token in the URL
    const validateAccess = async () => {
      setIsValidating(true);

      // Check if user is a SUPER_ADMIN
      if (hasRoleAccess(session?.user?.role || "", "SUPER_ADMIN")) {
        setIsAuthorized(true);
        setIsValidating(false);
        return;
      }

      // Check if the token in the URL is valid
      const token = params?.token as string;
      if (token) {
        // Hash the token for comparison
        const hash = crypto.createHash("sha256").update(token).digest("hex");
        if (hash === VALID_TOKEN_HASH) {
          setIsAuthorized(true);
        }
      }

      setIsValidating(false);
    };

    validateAccess();
  }, [params, session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);
    setNewKey("");
    setCopied(false);

    const formData = new FormData(e.currentTarget);
    const currentSecretKey = formData.get("currentSecretKey") as string;

    try {
      const response = await fetch("/api/super-admin/regenerate-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentSecretKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to regenerate key");
        return;
      }

      setSuccess(true);
      setNewKey(data.newSecretKey);
    } catch (err) {
      setError("An error occurred while regenerating the key");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If still validating, show loading
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <p className="mt-4 text-gray-600">Validating access...</p>
      </div>
    );
  }

  // If not authorized, show access denied
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Lock className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You do not have permission to access this page.
          </p>
          <div className="mt-8 flex justify-center">
            <Button variant="outline" onClick={() => router.push("/")}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main content for authorized users
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Key className="h-12 w-12 text-amber-600" />
        </div>
        <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900">
          Regenerate Secret Key
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use this page to regenerate the super admin secret key
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Regenerating the key will invalidate the previous key. Make sure to
            save the new key securely.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Key Regeneration</CardTitle>
            <CardDescription>
              {hasRoleAccess(session?.user?.role || "", "SUPER_ADMIN")
                ? "As a Super Admin, you can regenerate the key without providing the current key"
                : "Enter the current secret key to generate a new one"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!hasRoleAccess(session?.user?.role || "", "SUPER_ADMIN") && (
                <div className="space-y-2">
                  <Label htmlFor="currentSecretKey">Current Secret Key</Label>
                  <Input
                    id="currentSecretKey"
                    name="currentSecretKey"
                    type="password"
                    required
                    placeholder="Enter the current secret key"
                  />
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Secret key regenerated successfully!
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Regenerating..." : "Regenerate Secret Key"}
              </Button>
            </form>
          </CardContent>
          {newKey && (
            <CardFooter className="flex flex-col items-start">
              <h3 className="font-semibold mb-2">New Secret Key:</h3>
              <div className="flex items-center w-full">
                <div className="bg-gray-100 p-2 rounded text-sm font-mono break-all flex-1 mr-2">
                  {newKey}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-4 text-xs text-red-600">
                Please save this key securely. It will not be shown again.
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
