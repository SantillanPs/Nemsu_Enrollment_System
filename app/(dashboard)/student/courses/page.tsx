"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  capacity: number;
  semester: string;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  faculty: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function AvailableCourses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [paginationState, setPaginationState] = useState<
    Record<string, number>
  >({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const coursesPerPage = 3;
  const [selectedCourses, setSelectedCourses] = useState<
    Record<string, string[]>
  >({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search term, year, and semester
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${course.faculty.profile.firstName} ${course.faculty.profile.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const [year] = course.semester.split(" - ");
    const matchesYear = selectedYear === "all" || year === selectedYear;
    const matchesSemester =
      selectedSemester === "all" || course.semester.includes(selectedSemester);

    return matchesSearch && matchesYear && matchesSemester;
  });

  // Get unique years and semesters for filter dropdowns
  const years = [
    "all",
    ...new Set(courses.map((course) => course.semester.split(" - ")[0])),
  ];
  const semesters = ["all", "First Semester", "Second Semester", "Summer"];

  // Group courses by semester
  const groupedCourses = filteredCourses.reduce((acc, course) => {
    const key = course.semester;
    if (!acc[key]) {
      acc[key] = {
        semester: course.semester,
        title: course.semester,
        courses: [],
      };
    }
    acc[key].courses.push(course);
    return acc;
  }, {} as Record<string, { semester: string; title: string; courses: Course[] }>);

  // Sort by year and semester
  const sortedGroups = Object.values(groupedCourses).sort((a, b) => {
    const yearOrder = {
      "Freshman Year": 1,
      "Sophomore Year": 2,
      "Junior Year": 3,
      "Senior Year": 4,
    };
    const semesterOrder = {
      "First Semester": 1,
      "Second Semester": 2,
      Summer: 3,
    };

    const [aYear, aSem] = a.semester.split(" - ");
    const [bYear, bSem] = b.semester.split(" - ");

    if (aYear !== bYear) {
      return (
        yearOrder[aYear as keyof typeof yearOrder] -
        yearOrder[bYear as keyof typeof yearOrder]
      );
    }
    return (
      semesterOrder[aSem as keyof typeof semesterOrder] -
      semesterOrder[bSem as keyof typeof semesterOrder]
    );
  });

  const handleEnrollment = async (courseId: string) => {
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          // In a real app, this would come from the authenticated user
          studentId: "demo-student-id",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enroll");
      }

      toast({
        title: "Success",
        description: "Enrollment request submitted successfully",
      });
      setEnrollmentSuccess(true);
      setTimeout(() => setEnrollmentSuccess(false), 3000);
    } catch (error) {
      console.error("Error enrolling:", error);
      toast({
        title: "Error",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkEnrollment = async (groupKey: string) => {
    const coursesToEnroll = selectedCourses[groupKey] || [];

    try {
      await Promise.all(
        coursesToEnroll.map((courseId) => handleEnrollment(courseId))
      );

      setSelectedCourses((prev) => ({
        ...prev,
        [groupKey]: [],
      }));
    } catch (error) {
      console.error("Error in bulk enrollment:", error);
      toast({
        title: "Error",
        description: "Failed to enroll in some courses. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleCourseSelection = (groupKey: string, courseId: string) => {
    setSelectedCourses((prev) => {
      const currentSelections = prev[groupKey] || [];
      if (currentSelections.includes(courseId)) {
        return {
          ...prev,
          [groupKey]: currentSelections.filter((id) => id !== courseId),
        };
      } else {
        return {
          ...prev,
          [groupKey]: [...currentSelections, courseId],
        };
      }
    });
  };

  const toggleSelectAll = (groupKey: string, courseIds: string[]) => {
    setSelectedCourses((prev) => {
      const currentSelections = prev[groupKey] || [];
      if (currentSelections.length === courseIds.length) {
        return {
          ...prev,
          [groupKey]: [],
        };
      } else {
        return {
          ...prev,
          [groupKey]: [...courseIds],
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses by title, code, or instructor..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Year Level" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year === "all" ? "All Years" : year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Semester" />
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

      {enrollmentSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">
            Your enrollment request has been submitted.
          </span>
        </div>
      )}

      <div className="space-y-8">
        {sortedGroups.map((group) => {
          const groupKey = group.semester;
          const currentPage = paginationState[groupKey] || 1;
          const totalPages = Math.ceil(group.courses.length / coursesPerPage);
          const startIndex = (currentPage - 1) * coursesPerPage;
          const paginatedCourses = group.courses.slice(
            startIndex,
            startIndex + coursesPerPage
          );

          return (
            <div key={groupKey} className="rounded-md">
              <h3 className="text-lg pl-14 font-semibold mb-1">
                {group.title}
              </h3>
              <div className="overflow-x-auto rounded border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-blue-50 text-blue-800">
                      <th className="text-left font-medium p-3 w-10">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded cursor-pointer border-gray-300"
                            checked={
                              (selectedCourses[groupKey] || []).length ===
                                paginatedCourses.length &&
                              paginatedCourses.length > 0
                            }
                            onChange={() =>
                              toggleSelectAll(
                                groupKey,
                                paginatedCourses.map((c) => c.id)
                              )
                            }
                          />
                        </div>
                      </th>
                      <th className="text-left font-medium p-3">Course Code</th>
                      <th className="text-left font-medium p-3">
                        Course Details
                      </th>
                      <th className="text-left font-medium p-3">Units</th>
                      <th className="text-left font-medium p-3">Description</th>
                      <th className="text-right font-medium p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCourses.map((course) => (
                      <tr key={course.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            className="rounded cursor-pointer border-gray-300"
                            checked={(selectedCourses[groupKey] || []).includes(
                              course.id
                            )}
                            onChange={() =>
                              toggleCourseSelection(groupKey, course.id)
                            }
                          />
                        </td>
                        <td className="p-3 font-medium">{course.code}</td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{course.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {course.faculty.profile.firstName}{" "}
                              {course.faculty.profile.lastName}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">{course.credits}</td>
                        <td className="p-3 max-w-xs truncate">
                          {course.description}
                        </td>
                        <td className="p-3 text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>
                                  {course.code}: {course.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Course details and enrollment information
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <h4 className="font-medium">Description</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {course.description}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium">Credits</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {course.credits}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Instructor</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {course.faculty.profile.firstName}{" "}
                                      {course.faculty.profile.lastName}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Status</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {course.status}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Capacity</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {course.capacity}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(selectedCourses[groupKey] || []).length > 0 && (
                <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">
                      {(selectedCourses[groupKey] || []).length} course(s)
                      selected
                    </span>
                  </div>
                  <Button
                    onClick={() => handleBulkEnrollment(groupKey)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Confirm Enrollment
                  </Button>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPaginationState({
                        ...paginationState,
                        [groupKey]: Math.max(1, currentPage - 1),
                      })
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="mx-4 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPaginationState({
                        ...paginationState,
                        [groupKey]: Math.min(totalPages, currentPage + 1),
                      })
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No courses found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
