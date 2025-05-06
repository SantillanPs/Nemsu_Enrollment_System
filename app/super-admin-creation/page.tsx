"use client";

import { useState } from "react";
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
import { ShieldAlert, CheckCircle, AlertTriangle, Key } from "lucide-react";
import Link from "next/link";

export default function SuperAdminCreationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);
    setUserData(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const secretKey = formData.get("secretKey") as string;

    try {
      const response = await fetch("/api/super-admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          secretKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create super admin");
        return;
      }

      setSuccess(true);
      setUserData(data.data);
    } catch (err) {
      setError("An error occurred while creating the super admin");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900">
          Create Super Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          This page is for creating a super administrator with full system
          access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            This page creates a user with full system access. Use with caution.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Super Admin Creation</CardTitle>
            <CardDescription>
              Enter the details for the new super admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="super.admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Strong password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="First name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Last name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input
                  id="secretKey"
                  name="secretKey"
                  type="password"
                  required
                  placeholder="Enter the secret key"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Super admin created successfully!
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Super Admin"}
              </Button>
            </form>
          </CardContent>
          {userData && (
            <CardFooter className="flex flex-col items-start">
              <h3 className="font-semibold mb-2">Super Admin Created:</h3>
              <p className="text-sm">Email: {userData.email}</p>
              <p className="text-sm">
                Name: {userData.profile?.firstName} {userData.profile?.lastName}
              </p>
              <p className="text-sm">Role: {userData.role}</p>
              <p className="mt-2 text-xs text-red-600">
                Please save these credentials securely.
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
