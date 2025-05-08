"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  PlusSquare,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  User,
  BookOpen,
  Calendar,
  Users,
  AlertCircle,
} from "lucide-react";
import AdminCourseCard from "./components/AdminCourseCard";

interface Section {
  id: string;
  sectionCode: string;
  schedule: string;
  room: string;
  maxStudents: number;
  courseId: string;
  enrollments: Enrollment[];
}

interface Enrollment {
  id: string;
  status: string;
  grade: string | null;
  studentId: string;
  courseId: string;
  sectionId: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

interface Faculty {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface Prerequisite {
  id: string;
  code: string;
  name: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  capacity: number;
  year: number;
  semester: string;
  status: string;
  facultyId: string | null;
  faculty?: Faculty;
  sections: Section[];
  enrollments: Enrollment[];
  prerequisites: Prerequisite[];
  createdAt: string;
  updatedAt: string;
}

export default function ManageCourses() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/courses");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching courses"
        );
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch courses",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  // Faculty members will be fetched when needed for assigning to sections
  const [facultyMembers, setFacultyMembers] = useState<Faculty[]>([]);

  // Get unique semesters for filter dropdowns
  const semesters = [
    "all",
    ...new Set(courses.map((course) => course.semester)),
  ];

  // Get unique years for filter dropdowns
  const years = [
    "all",
    ...new Set(courses.map((course) => course.year?.toString())),
  ].filter(Boolean);

  // Filter courses based on search term, semester, and status
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.faculty?.profile &&
        `${course.faculty.profile.firstName} ${course.faculty.profile.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesSemester =
      selectedSemester === "all" || course.semester === selectedSemester;

    // Map the database status to the UI status
    const uiStatus =
      course.status === "OPEN"
        ? "active"
        : course.status === "CLOSED"
        ? "inactive"
        : course.status.toLowerCase();

    const matchesStatus =
      selectedStatus === "all" || uiStatus === selectedStatus;

    const matchesActiveOnly = !showActiveOnly || uiStatus === "active";

    return (
      matchesSearch && matchesSemester && matchesStatus && matchesActiveOnly
    );
  });

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedCourse) return;

    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to delete course";
        const errorDetails = errorData.details ? `\n${errorData.details}` : "";
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      // Remove the course from the local state
      setCourses(courses.filter((course) => course.id !== selectedCourse.id));

      toast({
        title: "Success",
        description: `Course ${selectedCourse.code}: ${selectedCourse.name} has been deleted`,
      });

      setShowDeleteDialog(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const handleEditSection = (course: Course, section: Section) => {
    setSelectedCourse(course);
    setSelectedSection(section);
    setShowSectionDialog(true);
  };

  const handleAssignInstructor = async (course: Course, section: Section) => {
    try {
      // Fetch faculty members if not already loaded
      if (facultyMembers.length === 0) {
        const response = await fetch("/api/faculty");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch faculty members");
        }

        const data = await response.json();
        setFacultyMembers(data);
      }

      setSelectedCourse(course);
      setSelectedSection(section);
      setShowAssignDialog(true);
    } catch (error) {
      console.error("Error fetching faculty members:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch faculty members",
        variant: "destructive",
      });
    }
  };

  const handleAddSection = (course: Course) => {
    setSelectedCourse(course);
    setSelectedSection(null); // No section selected means we're adding a new one
    setShowSectionDialog(true);
  };

  // Handle course update (used by the toggle status feature)
  const handleCourseUpdated = (updatedCourse: Course) => {
    setCourses(
      courses.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course
      )
    );
  };

  // Calculate total enrollments for a course across all sections
  const getTotalEnrollments = (course: Course) => {
    if (!course.sections || course.sections.length === 0) {
      return course.enrollments?.length || 0;
    }

    return course.sections.reduce(
      (total, section) => total + (section.enrollments?.length || 0),
      0
    );
  };

  // Calculate total capacity for a course across all sections
  const getTotalCapacity = (course: Course) => {
    if (!course.sections || course.sections.length === 0) {
      return course.capacity || 0;
    }

    return course.sections.reduce(
      (total, section) => total + (section.maxStudents || 0),
      0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
        <h1 className="text-2xl font-bold">Manage Courses</h1>
        <div className="flex w-full sm:w-auto">
          <Link href="/admin/create-course" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <PlusSquare className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, code, or instructor..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={selectedSemester}
              onValueChange={setSelectedSemester}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester === "all" ? "All Semesters" : semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 ml-0 sm:ml-2">
            <Switch
              id="active-only"
              checked={showActiveOnly}
              onCheckedChange={setShowActiveOnly}
            />
            <Label htmlFor="active-only">Active Only</Label>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Catalog</CardTitle>
          <CardDescription>
            Manage courses, sections, and instructor assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
              <div className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
              <div className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Error Loading Courses</h3>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Courses Found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm ||
                selectedSemester !== "all" ||
                selectedStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No courses have been created yet"}
              </p>
              <Link href="/admin/create-course">
                <Button className="mt-4">
                  <PlusSquare className="mr-2 h-4 w-4" />
                  Create New Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <AdminCourseCard
                  key={course.id}
                  course={course}
                  onDeleteCourse={handleDeleteCourse}
                  onAddSection={handleAddSection}
                  getTotalEnrollments={getTotalEnrollments}
                  getTotalCapacity={getTotalCapacity}
                  onCourseUpdated={handleCourseUpdated}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Course Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course{" "}
              <span className="font-semibold">
                {selectedCourse?.code}: {selectedCourse?.name}
              </span>{" "}
              and all associated sections and enrollments. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
