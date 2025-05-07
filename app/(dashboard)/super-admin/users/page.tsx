"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  UserPlus,
  Shield,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { hasRoleAccess } from "@/lib/utils/role-check";

interface User {
  id: string;
  email: string;
  role: string;
  isSystemUser: boolean;
  createdAt: string;
  profile: {
    firstName: string;
    lastName: string;
    isVerified: boolean;
  } | null;
}

export default function SuperAdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Redirect if not a super admin
  useEffect(() => {
    if (
      status === "authenticated" &&
      !hasRoleAccess(session?.user?.role || "", "SUPER_ADMIN")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.data || []);
      } catch (err) {
        setError("Failed to load users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (
      status === "authenticated" &&
      hasRoleAccess(session?.user?.role || "", "SUPER_ADMIN")
    ) {
      fetchUsers();
    }
  }, [session, status]);

  // Filter users based on search term and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.profile &&
        `${user.profile.firstName} ${user.profile.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesRole =
      roleFilter === "ALL" || user.role.toUpperCase() === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Handle user deletion
  const handleDeleteUser = async (userId: string, isSystemUser: boolean) => {
    if (isSystemUser) {
      alert("System users cannot be deleted");
      return;
    }

    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Remove user from state
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      setError("Failed to delete user");
      console.error(err);
    }
  };

  if (status === "loading" || loading) {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center">
          <Users className="h-6 w-6 mr-2 text-gray-500" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="STUDENT">Students</SelectItem>
              <SelectItem value="FACULTY">Faculty</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admins</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/super-admin">
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </Link>
        </div>
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
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            Manage all users in the system. Super admins have full access to all
            features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.profile
                          ? `${user.profile.firstName} ${user.profile.lastName}`
                          : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "SUPER_ADMIN"
                            ? "destructive"
                            : user.role === "ADMIN"
                            ? "default"
                            : user.role === "FACULTY"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {user.role}
                      </Badge>
                      {user.isSystemUser && (
                        <Badge variant="outline" className="ml-2">
                          System
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.profile?.isVerified ? "success" : "warning"
                        }
                      >
                        {user.profile?.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/super-admin/users/${user.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteUser(user.id, user.isSystemUser)
                          }
                          disabled={user.isSystemUser}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
