"use client";

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
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
import {
  Search,
  PlusSquare,
  BookOpen,
  AlertCircle,
  Loader2,
} from "lucide-react";
import AdminCourseCard from "./components/OptimizedAdminCourseCard";
import { AssignInstructorDialog } from "./components/AssignInstructorDialog";

import { Course, Faculty } from "./types";

export default function ManageCourses() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [isSavingInstructor, setIsSavingInstructor] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [courseIdToResetLoading, setCourseIdToResetLoading] = useState<
    string | null
  >(null);

  // Memoize event handlers to prevent recreation on each render
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handleSemesterChange = useCallback((value: string) => {
    setSelectedSemester(value);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setSelectedStatus(value);
  }, []);

  const handleActiveOnlyChange = useCallback((checked: boolean) => {
    setShowActiveOnly(checked);
  }, []);

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

  // Get unique semesters for filter dropdowns - memoized to prevent recalculation on each render
  const semesters = useMemo(() => {
    return ["all", ...new Set(courses.map((course) => course.semester))];
  }, [courses]);

  // Get unique years for filter dropdowns (commented out for now as it's not used)
  // const years = useMemo(() => {
  //   return [
  //     "all",
  //     ...new Set(courses.map((course) => course.year?.toString())),
  //   ].filter(Boolean);
  // }, [courses]);

  // Map database status to UI status - utility function
  const getUiStatus = useCallback((status: string) => {
    return status === "OPEN"
      ? "active"
      : status === "CLOSED"
      ? "inactive"
      : status.toLowerCase();
  }, []);

  // Filter courses based on search term, semester, and status - memoized to prevent recalculation on each render
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
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
      const uiStatus = getUiStatus(course.status);

      const matchesStatus =
        selectedStatus === "all" || uiStatus === selectedStatus;

      const matchesActiveOnly = !showActiveOnly || uiStatus === "active";

      return (
        matchesSearch && matchesSemester && matchesStatus && matchesActiveOnly
      );
    });
  }, [
    courses,
    searchTerm,
    selectedSemester,
    selectedStatus,
    showActiveOnly,
    getUiStatus,
  ]);

  const handleDeleteCourse = useCallback((course: Course) => {
    setSelectedCourse(course);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = async () => {
    if (!selectedCourse) return;

    try {
      setIsDeleting(true);

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
    } finally {
      setIsDeleting(false);
    }
  };

  // Commented out as it's not used currently
  // const handleEditSection = (course: Course, section: Section) => {
  //   setSelectedCourse(course);
  //   // setSelectedSection(section);
  //   // setShowSectionDialog(true);
  // };

  const handleAssignInstructor = useCallback(
    async (course: Course) => {
      try {
        // Fetch faculty members if not already loaded
        if (facultyMembers.length === 0) {
          const response = await fetch("/api/faculty");

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Failed to fetch faculty members"
            );
          }

          const data = await response.json();
          setFacultyMembers(data);
        }

        setSelectedCourse(course);
        setSelectedFacultyId(course.facultyId || "none");
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
    },
    [facultyMembers.length, toast]
  );

  const handleSaveInstructorAssignment = useCallback(async () => {
    if (!selectedCourse) return;

    try {
      setIsSavingInstructor(true);

      const response = await fetch(
        `/api/courses/${selectedCourse.id}/assign-instructor`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            facultyId: selectedFacultyId === "none" ? null : selectedFacultyId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign instructor");
      }

      const { data, message } = await response.json();

      // Update the course in the local state
      setCourses(
        courses.map((course) => (course.id === data.id ? data : course))
      );

      toast({
        title: "Success",
        description: message,
      });

      setShowAssignDialog(false);

      // Reset the loading state for the course card
      if (selectedCourse) {
        setCourseIdToResetLoading(selectedCourse.id);
      }
    } catch (error) {
      console.error("Error assigning instructor:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to assign instructor",
        variant: "destructive",
      });

      // Reset the loading state for the course card on error too
      if (selectedCourse) {
        setCourseIdToResetLoading(selectedCourse.id);
      }
    } finally {
      setIsSavingInstructor(false);
    }
  }, [selectedCourse, selectedFacultyId, courses, toast]);

  const handleAddSection = useCallback(
    (course: Course) => {
      setSelectedCourse(course);
      // For now, just show a toast message since section dialog is not implemented yet
      toast({
        title: "Add Section",
        description: `This feature is not fully implemented yet. You would add a section to ${course.code}: ${course.name}`,
      });
    },
    [toast]
  );

  // Handle course update (used by the toggle status feature)
  const handleCourseUpdated = useCallback(
    (updatedCourse: Course) => {
      setCourses(
        courses.map((course) =>
          course.id === updatedCourse.id ? updatedCourse : course
        )
      );
    },
    [courses]
  );

  // Calculate total enrollments for a course across all sections
  const getTotalEnrollments = useCallback((course: Course) => {
    if (!course.sections || course.sections.length === 0) {
      return course.enrollments?.length || 0;
    }

    return course.sections.reduce(
      (total, section) => total + (section.enrollments?.length || 0),
      0
    );
  }, []);

  // Calculate total capacity for a course across all sections
  const getTotalCapacity = useCallback((course: Course) => {
    if (!course.sections || course.sections.length === 0) {
      return course.capacity || 0;
    }

    return course.sections.reduce(
      (total, section) => total + (section.maxStudents || 0),
      0
    );
  }, []);

  // Map to store reset handlers for each course card
  const resetHandlersRef = useRef<Map<string, (courseId: string) => void>>(
    new Map()
  );

  // Function to register a reset handler for a course card
  const resetInstructorLoading = useCallback(
    (resetHandler: (courseId: string) => void) => {
      // Store the reset handler
      resetHandlersRef.current.set(String(Math.random()), resetHandler);
    },
    []
  );

  // Effect to trigger reset handlers when courseIdToResetLoading changes
  useEffect(() => {
    if (courseIdToResetLoading) {
      // Call all reset handlers with the course ID
      resetHandlersRef.current.forEach(
        (handler: (courseId: string) => void) => {
          handler(courseIdToResetLoading);
        }
      );

      // Reset the state
      setCourseIdToResetLoading(null);
    }
  }, [courseIdToResetLoading]);

  // Memoized CourseGrid component to prevent unnecessary re-renders
  interface CourseGridProps {
    courses: Course[];
    onDeleteCourse: (course: Course) => void;
    onAddSection: (course: Course) => void;
    onAssignInstructor: (course: Course) => void;
    getTotalEnrollments: (course: Course) => number;
    getTotalCapacity: (course: Course) => number;
    onCourseUpdated: (updatedCourse: Course) => void;
    resetInstructorLoading: (resetHandler: (courseId: string) => void) => void;
  }

  const CourseGrid = memo(
    ({
      courses,
      onDeleteCourse,
      onAddSection,
      onAssignInstructor,
      getTotalEnrollments,
      getTotalCapacity,
      onCourseUpdated,
      resetInstructorLoading,
    }: CourseGridProps) => {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <AdminCourseCard
              key={course.id}
              course={course}
              onDeleteCourse={onDeleteCourse}
              onAddSection={onAddSection}
              onAssignInstructor={onAssignInstructor}
              getTotalEnrollments={getTotalEnrollments}
              getTotalCapacity={getTotalCapacity}
              onCourseUpdated={onCourseUpdated}
              resetInstructorLoading={resetInstructorLoading}
            />
          ))}
        </div>
      );
    }
  );

  CourseGrid.displayName = "CourseGrid";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
        <h1 className="text-2xl font-bold">Manage Courses</h1>
        <div className="flex w-full sm:w-auto">
          <Link href="/admin/create-course" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto group">
              <PlusSquare className="mr-2 h-4 w-4 group-hover:animate-pulse" />
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
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={selectedSemester}
              onValueChange={handleSemesterChange}
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
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
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
              onCheckedChange={handleActiveOnlyChange}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin hidden group-disabled:inline-flex" />
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
                <Button className="mt-4 group">
                  <PlusSquare className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                  Create New Course
                </Button>
              </Link>
            </div>
          ) : (
            <CourseGrid
              courses={filteredCourses}
              onDeleteCourse={handleDeleteCourse}
              onAddSection={handleAddSection}
              onAssignInstructor={handleAssignInstructor}
              getTotalEnrollments={getTotalEnrollments}
              getTotalCapacity={getTotalCapacity}
              onCourseUpdated={handleCourseUpdated}
              resetInstructorLoading={resetInstructorLoading}
            />
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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 group"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Instructor Dialog */}
      <AssignInstructorDialog
        open={showAssignDialog}
        onOpenChange={(open) => {
          setShowAssignDialog(open);
          // Clear loading state in AdminCourseCard when dialog is closed
          if (!open && selectedCourse) {
            // Reset the loading state for the course card
            setCourseIdToResetLoading(selectedCourse.id);
          }
        }}
        course={selectedCourse}
        facultyList={facultyMembers}
        selectedFacultyId={selectedFacultyId}
        onFacultyChange={setSelectedFacultyId}
        onSave={handleSaveInstructorAssignment}
        isSaving={isSavingInstructor}
      />
    </div>
  );
}
