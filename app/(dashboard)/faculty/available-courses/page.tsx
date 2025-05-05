"use client";

import { useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, BookOpen, AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  prerequisites: {
    id: string;
    code: string;
    name: string;
  }[];
}

export default function AvailableCourses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/faculty/available-courses");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch available courses");
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid courses data received");
      }
      setCourses(data);
    } catch (error) {
      console.error("Error fetching available courses:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch available courses. Please try again.",
        variant: "destructive",
      });
      setCourses([]); // Ensure courses is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowConfirmDialog(true);
  };

  const confirmAssignment = async () => {
    if (!selectedCourse) return;
    
    try {
      setIsAssigning(true);
      const response = await fetch("/api/faculty/assign-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: selectedCourse.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign to course");
      }

      toast({
        title: "Success",
        description: `You have been assigned to ${selectedCourse.code}: ${selectedCourse.name}`,
      });

      // Remove the assigned course from the list
      setCourses(courses.filter(course => course.id !== selectedCourse.id));
      setShowConfirmDialog(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Error assigning to course:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to assign to course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter courses based on search term, year, and semester
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear =
      selectedYear === "all" || course.year.toString() === selectedYear;
    const matchesSemester =
      selectedSemester === "all" || course.semester === selectedSemester;

    return matchesSearch && matchesYear && matchesSemester;
  });

  // Get unique years and semesters for filter dropdowns
  const years = ["all", ...new Set(courses.map((course) => course.year.toString()))].sort();
  const semesters = ["all", "FIRST", "SECOND", "SUMMER"];

  // Group courses by year and semester
  const groupedCourses = filteredCourses.reduce((acc, course) => {
    const year = course.year ?? 0;
    const key = `Year ${year} - ${course.semester}`;
    if (!acc[key]) {
      acc[key] = {
        year: year,
        semester: course.semester,
        title: key,
        courses: [],
      };
    }
    acc[key].courses.push(course);
    return acc;
  }, {} as Record<string, { year: number; semester: string; title: string; courses: Course[] }>);

  // Sort groups by year and semester
  const sortedGroups = Object.values(groupedCourses).sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    
    const semesterOrder = { FIRST: 1, SECOND: 2, SUMMER: 3 };
    return semesterOrder[a.semester as keyof typeof semesterOrder] - 
           semesterOrder[b.semester as keyof typeof semesterOrder];
  });

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Available Courses</h1>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses by title or code..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year === "all" ? "All Years" : `Year ${year}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Semester" />
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
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {sortedGroups.length > 0 ? (
            <div className="space-y-8">
              {sortedGroups.map((group) => (
                <Card key={group.title} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-3">
                    <CardTitle>{group.title}</CardTitle>
                    <CardDescription>
                      {group.courses.length} course{group.courses.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course Code</TableHead>
                          <TableHead>Course Name</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.courses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">
                              {course.code}
                            </TableCell>
                            <TableCell>{course.name}</TableCell>
                            <TableCell>{course.credits}</TableCell>
                            <TableCell>{course.capacity}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(course.status)}>
                                {course.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      View Details
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                      <DialogTitle>
                                        {course.code}: {course.name}
                                      </DialogTitle>
                                      <DialogDescription>
                                        {course.description}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4 py-4">
                                      <div className="space-y-2">
                                        <h4 className="font-medium">Course Details</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div className="text-muted-foreground">Credits:</div>
                                          <div>{course.credits}</div>
                                          <div className="text-muted-foreground">Year:</div>
                                          <div>{course.year}</div>
                                          <div className="text-muted-foreground">Semester:</div>
                                          <div>{course.semester}</div>
                                          <div className="text-muted-foreground">Status:</div>
                                          <div>
                                            <Badge className={getStatusColor(course.status)}>
                                              {course.status}
                                            </Badge>
                                          </div>
                                          <div className="text-muted-foreground">Capacity:</div>
                                          <div>{course.capacity}</div>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <h4 className="font-medium">Prerequisites</h4>
                                        {course.prerequisites && course.prerequisites.length > 0 ? (
                                          <ul className="list-disc pl-5 text-sm space-y-1">
                                            {course.prerequisites.map((prereq) => (
                                              <li key={prereq.id}>
                                                {prereq.code}: {prereq.name}
                                              </li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <p className="text-sm text-muted-foreground">
                                            No prerequisites required
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex justify-end">
                                      <Button 
                                        onClick={() => handleAssignCourse(course)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Assign Myself to This Course
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button 
                                  onClick={() => handleAssignCourse(course)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                  size="sm"
                                >
                                  Assign
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No available courses found</h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm || selectedYear !== "all" || selectedSemester !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "There are no courses available for assignment at this time"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Course Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to assign yourself to {selectedCourse?.code}: {selectedCourse?.name}?
              <br /><br />
              Once assigned, you will be responsible for teaching this course and managing student enrollments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAssigning}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAssignment} 
              disabled={isAssigning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAssigning ? (
                <>
                  <Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
                  Assigning...
                </>
              ) : (
                "Confirm Assignment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
