"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { InviteFacultyDialog } from "./components/InviteFacultyDialog";

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

interface FacultyWithDetails extends Faculty {
  department?: string;
  position?: string;
  status?: string;
  education?: string;
  specialization?: string;
  officeHours?: string;
  officeLocation?: string;
  bio?: string;
  image?: string;
  name?: string;
  joinDate?: string;
  courses?: number;
  students?: number;
}

export default function FacultyManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFaculty, setSelectedFaculty] =
    useState<FacultyWithDetails | null>(null);
  const [facultyMembers, setFacultyMembers] = useState<FacultyWithDetails[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch faculty members
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/users?role=FACULTY");
        if (!response.ok) {
          throw new Error("Failed to fetch faculty members");
        }

        const data = await response.json();
        console.log("Faculty data:", data);

        // Transform the data to match our interface
        const facultyData: FacultyWithDetails[] = (data.data || []).map(
          (faculty: Faculty) => {
            // Calculate the number of students
            const studentCount =
              faculty.taughtCourses?.reduce((total, course) => {
                return total + (course.students || 0);
              }, 0) || 0;

            // Extract department and position from profile if available
            // This is a placeholder - in a real app, you would have these fields in your database
            const department =
              faculty.profile?.address?.split(",")[0] || "Not specified";
            const position = "Professor"; // Default position

            return {
              ...faculty,
              department,
              position,
              status: "active", // Default status
              courses: faculty.taughtCourses?.length || 0,
              students: studentCount,
              name: faculty.profile
                ? `${faculty.profile.firstName} ${faculty.profile.lastName}`
                : faculty.email,
              joinDate: new Date(faculty.createdAt).toISOString().split("T")[0],
              image: "/placeholder.svg?height=100&width=100", // Default image
            };
          }
        );

        setFacultyMembers(facultyData);
      } catch (error) {
        console.error("Error fetching faculty:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load faculty members"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  // Departments for filtering - dynamically generated from faculty data
  const departments = [
    "all",
    ...Array.from(
      new Set(facultyMembers.map((f) => f.department || "Not specified"))
    ),
  ].filter(Boolean);

  // Statuses for filtering
  const statuses = ["all", "active", "on leave", "inactive"];

  // Filter faculty based on search term, department, and status
  const filteredFaculty = facultyMembers.filter((faculty) => {
    const facultyName = faculty.name || "";
    const facultyEmail = faculty.email || "";
    const facultyDepartment = faculty.department || "";

    const matchesSearch =
      facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facultyEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facultyDepartment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" || facultyDepartment === selectedDepartment;

    const matchesStatus =
      selectedStatus === "all" || faculty.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleDeleteFaculty = (faculty: FacultyWithDetails) => {
    setSelectedFaculty(faculty);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedFaculty) return;

    try {
      const response = await fetch(`/api/users/${selectedFaculty.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete faculty member");
      }

      toast({
        title: "Success",
        description: `${selectedFaculty.name} has been deleted successfully`,
      });

      // Remove the faculty member from the state
      setFacultyMembers(
        facultyMembers.filter((f) => f.id !== selectedFaculty.id)
      );
    } catch (error) {
      console.error("Error deleting faculty:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete faculty member",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedFaculty(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Faculty Management</h1>
        <div className="flex gap-2">
          <Link href="/admin/faculty/invitations">
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

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, or department..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department === "all" ? "All Departments" : department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty Members</CardTitle>
          <CardDescription>
            Manage faculty members, their courses, and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Loading faculty members...
                </p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaculty.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <img
                            src={faculty.image || "/placeholder.svg"}
                            alt={faculty.name || "Faculty"}
                            className="h-10 w-10 rounded-full"
                          />
                          <div>
                            <div>{faculty.name || faculty.email}</div>
                            <div className="text-xs text-muted-foreground">
                              {faculty.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {faculty.department || "Not specified"}
                      </TableCell>
                      <TableCell>
                        {faculty.position || "Not specified"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            faculty.status === "active"
                              ? "bg-green-100 text-green-800"
                              : faculty.status === "on leave"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {faculty.status
                            ? faculty.status.charAt(0).toUpperCase() +
                              faculty.status.slice(1)
                            : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{faculty.courses || 0}</TableCell>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteFaculty(faculty)}
                            >
                              Delete Faculty
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredFaculty.length === 0 && !isLoading && (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium">
                    No faculty members found
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Faculty</TabsTrigger>
          <TabsTrigger value="on-leave">On Leave</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center py-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    Loading faculty members...
                  </p>
                </div>
              </div>
            ) : (
              facultyMembers
                .filter((faculty) => faculty.status === "active")
                .map((faculty) => (
                  <Card key={faculty.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={faculty.image || "/placeholder.svg"}
                            alt={faculty.name || "Faculty"}
                            className="h-12 w-12 rounded-full"
                          />
                          <div>
                            <CardTitle className="text-base">
                              {faculty.name || faculty.email}
                            </CardTitle>
                            <CardDescription>
                              {faculty.position || "Faculty"}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            Department: {faculty.department || "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{faculty.email}</span>
                        </div>
                        {faculty.profile?.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{faculty.profile.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Joined: {faculty.joinDate || "Unknown"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Teaching {faculty.courses || 0} courses</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Link href={`/admin/faculty/${faculty.id}`}>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
            {!isLoading &&
              facultyMembers.filter((faculty) => faculty.status === "active")
                .length === 0 && (
                <div className="col-span-full text-center py-10">
                  <h3 className="text-lg font-medium">
                    No active faculty members
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    All faculty members are currently on leave or inactive
                  </p>
                </div>
              )}
          </div>
        </TabsContent>
        <TabsContent value="on-leave" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center py-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    Loading faculty members...
                  </p>
                </div>
              </div>
            ) : (
              facultyMembers
                .filter((faculty) => faculty.status === "on leave")
                .map((faculty) => (
                  <Card key={faculty.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={faculty.image || "/placeholder.svg"}
                            alt={faculty.name || "Faculty"}
                            className="h-12 w-12 rounded-full"
                          />
                          <div>
                            <CardTitle className="text-base">
                              {faculty.name || faculty.email}
                            </CardTitle>
                            <CardDescription>
                              {faculty.position || "Faculty"}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          On Leave
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            Department: {faculty.department || "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{faculty.email}</span>
                        </div>
                        {faculty.profile?.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{faculty.profile.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Joined: {faculty.joinDate || "Unknown"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>On leave until further notice</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Link href={`/admin/faculty/${faculty.id}`}>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
            {!isLoading &&
              facultyMembers.filter((faculty) => faculty.status === "on leave")
                .length === 0 && (
                <div className="col-span-full text-center py-10">
                  <h3 className="text-lg font-medium">
                    No faculty members on leave
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    All faculty members are currently active or inactive
                  </p>
                </div>
              )}
          </div>
        </TabsContent>
        <TabsContent value="inactive" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center py-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    Loading faculty members...
                  </p>
                </div>
              </div>
            ) : (
              facultyMembers
                .filter((faculty) => faculty.status === "inactive")
                .map((faculty) => (
                  <Card key={faculty.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={faculty.image || "/placeholder.svg"}
                            alt={faculty.name || "Faculty"}
                            className="h-12 w-12 rounded-full"
                          />
                          <div>
                            <CardTitle className="text-base">
                              {faculty.name || faculty.email}
                            </CardTitle>
                            <CardDescription>
                              {faculty.position || "Faculty"}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          Inactive
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            Department: {faculty.department || "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{faculty.email}</span>
                        </div>
                        {faculty.profile?.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{faculty.profile.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Joined: {faculty.joinDate || "Unknown"}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Link href={`/admin/faculty/${faculty.id}`}>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
            {!isLoading &&
              facultyMembers.filter((faculty) => faculty.status === "inactive")
                .length === 0 && (
                <div className="col-span-full text-center py-10">
                  <h3 className="text-lg font-medium">
                    No inactive faculty members
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    All faculty members are currently active or on leave
                  </p>
                </div>
              )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Faculty Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedFaculty?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
