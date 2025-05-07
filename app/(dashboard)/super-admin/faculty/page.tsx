"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Award,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InviteFacultyDialog } from "@/app/(dashboard)/admin/faculty/components/InviteFacultyDialog";
import { hasRoleAccess } from "@/lib/utils/role-check";

interface Faculty {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    dateOfBirth: string;
  } | null;
  taughtCourses: {
    id: string;
    code: string;
    name: string;
    students?: number;
  }[];
}

export default function SuperAdminFacultyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Redirect if not a super admin
  useEffect(() => {
    if (
      status === "authenticated" &&
      !hasRoleAccess(session?.user?.role || "", "SUPER_ADMIN")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  // Fetch faculty data
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/faculty");
        
        if (!response.ok) {
          throw new Error("Failed to fetch faculty data");
        }
        
        const data = await response.json();
        setFaculty(data);
      } catch (error) {
        console.error("Error fetching faculty:", error);
        setError("Failed to load faculty data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchFaculty();
    }
  }, [status]);

  // Filter faculty based on search term and status
  const filteredFaculty = faculty.filter((f) => {
    const fullName = `${f.profile?.firstName} ${f.profile?.lastName}`.toLowerCase();
    const searchMatch = fullName.includes(searchTerm.toLowerCase()) || 
                        f.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") {
      return searchMatch;
    }
    
    return searchMatch && f.status === statusFilter;
  });

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
        <h1 className="text-2xl font-bold">Faculty Management</h1>
        <div className="flex gap-2">
          <Link href="/super-admin/faculty/invitations">
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              View Invitations
            </Button>
          </Link>
          <InviteFacultyDialog />
          <Link href="/admin/faculty/add">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Faculty
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
          <CardTitle>Faculty Members</CardTitle>
          <CardDescription>
            View and manage faculty members in the system
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search faculty..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading faculty data...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No faculty members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFaculty.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell>
                        <div className="font-medium">
                          {faculty.profile
                            ? `${faculty.profile.firstName} ${faculty.profile.lastName}`
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{faculty.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={faculty.status === "active" ? "outline" : "secondary"}
                        >
                          {faculty.status
                            ? faculty.status.charAt(0).toUpperCase() +
                              faculty.status.slice(1)
                            : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{faculty.taughtCourses?.length || 0}</TableCell>
                      <TableCell>{faculty.students || 0}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Link
                                href={`/admin/faculty/${faculty.id}`}
                                className="flex w-full"
                              >
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                href={`/admin/faculty/edit/${faculty.id}`}
                                className="flex w-full"
                              >
                                Edit Faculty
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
