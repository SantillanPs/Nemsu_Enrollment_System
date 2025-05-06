"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  Key,
  AlertTriangle,
  Lock,
  UserPlus,
  ExternalLink,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SuperAdminSecurityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not a super admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Shield className="h-6 w-6 mr-2 text-red-500" />
        <h1 className="text-2xl font-bold">Security Management</h1>
      </div>

      <Alert variant="warning" className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Security Notice</AlertTitle>
        <AlertDescription className="text-amber-700">
          This page contains sensitive security settings. Changes made here
          affect the entire system.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Super Admin Key Management */}
        <Card className="border-red-100">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Super Admin Secret Key
            </CardTitle>
            <CardDescription className="text-red-100">
              Manage the secret key used to create super admin accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                The super admin secret key is used to create new super admin
                accounts. This key should be kept secure and regenerated
                periodically.
              </p>
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="font-medium text-red-800">
                    Sensitive Operation
                  </h3>
                </div>
                <p className="text-sm text-red-700 mb-2">
                  Regenerating the key will invalidate the current key. Any
                  ongoing super admin creation processes will fail.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Link
              href="/system-maintenance/security/key-management/maintenance-security-key-8675309"
              className="w-full"
            >
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <Key className="h-4 w-4 mr-2" />
                Manage Secret Key
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Create Super Admin */}
        <Card className="border-indigo-100">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Create Super Admin
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Create a new super admin account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Super admins have full access to all system features and
                settings. Create super admin accounts only for trusted
                individuals.
              </p>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex items-center mb-2">
                  <Lock className="h-5 w-5 text-indigo-500 mr-2" />
                  <h3 className="font-medium text-indigo-800">
                    Access Control
                  </h3>
                </div>
                <p className="text-sm text-indigo-700 mb-2">
                  Super admin accounts cannot be easily revoked. Ensure you
                  trust the individual before granting super admin access.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Link href="/super-admin-creation" className="w-full">
              <Button
                variant="outline"
                className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Super Admin
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* System Documentation */}
        <Card className="border-blue-100 md:col-span-2">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center">
              <ExternalLink className="h-5 w-5 mr-2" />
              Security Documentation
            </CardTitle>
            <CardDescription className="text-blue-100">
              Access security documentation and guidelines
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Review security documentation to understand best practices and
                procedures for maintaining system security.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium mb-2">Super Admin Management</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Documentation for managing super admin accounts and secret
                    keys.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      window.open("/docs/SUPER_ADMIN_KEY_MANAGEMENT.md")
                    }
                  >
                    View Documentation
                  </Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium mb-2">Security Guidelines</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Best practices for maintaining system security.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open("/docs/SECURITY_GUIDELINES.md")}
                  >
                    View Guidelines
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
