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
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  capacity: number;
  semester: string;
  year: number;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  faculty: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
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
  // const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCourses, setEnrollingCourses] = useState<string[]>([]);
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch courses");
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid courses data received");
      }
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch courses. Please try again.",
        variant: "destructive",
      });
      setCourses([]); // Ensure courses is always an array
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

    const matchesYear =
      selectedYear === "all" || course.year.toString() === selectedYear;
    const matchesSemester =
      selectedSemester === "all" || course.semester === selectedSemester;

    return matchesSearch && matchesYear && matchesSemester;
  });

  // Get unique years and semesters for filter dropdowns
  const years = ["all", "1", "2", "3", "4"];
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

  // Sort by year and semester
  const sortedGroups = Object.values(groupedCourses).sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    const semesterOrder = {
      FIRST: 1,
      SECOND: 2,
      SUMMER: 3,
    };
    return (
      semesterOrder[a.semester as keyof typeof semesterOrder] -
      semesterOrder[b.semester as keyof typeof semesterOrder]
    );
  });

  const handleEnrollment = async (courseId: string) => {
    try {
      setEnrollingCourses((prev) => [...prev, courseId]);

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll");
      }

      toast({
        title: "Success",
        description: "Enrollment request submitted successfully",
      });

      // Refresh courses to update UI
      fetchCourses();
    } catch (error) {
      console.error("Error enrolling:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrollingCourses((prev) => prev.filter((id) => id !== courseId));
    }
  };

  const handleBulkEnrollment = async (groupKey: string) => {
    const coursesToEnroll = selectedCourses[groupKey] || [];

    if (coursesToEnroll.length === 0) {
      toast({
        title: "No courses selected",
        description: "Please select at least one course to enroll.",
      });
      return;
    }

    try {
      setEnrollingCourses(coursesToEnroll);

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseIds: coursesToEnroll }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll in courses");
      }

      // Show success/error message
      if (data.success) {
        toast({
          title: "Enrollment Successful",
          description:
            data.message ||
            `Successfully enrolled in ${data.enrollments.length} courses.`,
        });

        // If there were partial errors, show them too
        if (data.errors && data.errors.length > 0) {
          toast({
            title: "Some enrollments failed",
            description: `${data.errors.length} course enrollments failed. Check course prerequisites.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Enrollment Failed",
          description: data.message || "Failed to enroll in courses.",
          variant: "destructive",
        });
      }

      // Clear selections for this group
      setSelectedCourses((prev) => ({
        ...prev,
        [groupKey]: [],
      }));

      // Refresh courses to update UI
      fetchCourses();
    } catch (error) {
      console.error("Error in bulk enrollment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to enroll in courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrollingCourses([]);
    }
  };

  const handleEnrollAll = async () => {
    // Get all available course IDs
    const allCourseIds = courses.map((course) => course.id);

    if (allCourseIds.length === 0) {
      toast({
        title: "No courses available",
        description: "There are no available courses to enroll in.",
      });
      return;
    }

    try {
      setEnrollingCourses(allCourseIds);

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseIds: allCourseIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll in all courses");
      }

      // Show success/error message
      if (data.success) {
        toast({
          title: "Bulk Enrollment Successful",
          description:
            data.message ||
            `Successfully enrolled in ${data.enrollments.length} courses.`,
        });

        // If there were partial errors, show them too
        if (data.errors && data.errors.length > 0) {
          toast({
            title: "Some enrollments failed",
            description: `${data.errors.length} course enrollments failed. Check course prerequisites.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Enrollment Failed",
          description: data.message || "Failed to enroll in courses.",
          variant: "destructive",
        });
      }

      // Clear all selections
      setSelectedCourses({});

      // Refresh courses to update UI
      fetchCourses();
    } catch (error) {
      console.error("Error in enrolling all courses:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to enroll in all courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrollingCourses([]);
    }
  };

  const toggleCourseSelection = (groupKey: string, courseId: string) => {
    setSelectedCourses((prev) => {
      const currentSelected = prev[groupKey] || [];
      const newSelected = currentSelected.includes(courseId)
        ? currentSelected.filter((id) => id !== courseId)
        : [...currentSelected, courseId];

      return {
        ...prev,
        [groupKey]: newSelected,
      };
    });
  };

  const toggleSelectAll = (groupKey: string, courseIds: string[]) => {
    setSelectedCourses((prev) => {
      const currentSelected = prev[groupKey] || [];
      const allSelected = courseIds.every((id) => currentSelected.includes(id));

      return {
        ...prev,
        [groupKey]: allSelected ? [] : courseIds,
      };
    });
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Available Courses</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex flex-1 gap-4 flex-wrap">
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select year" />
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select semester" />
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

        <Button
          onClick={handleEnrollAll}
          disabled={enrollingCourses.length > 0 || courses.length === 0}
          className="whitespace-nowrap"
        >
          {enrollingCourses.length > 0 ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enrolling...
            </>
          ) : (
            "Enroll in All Courses"
          )}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {sortedGroups.map((group) => {
            const groupKey = group.title;
            const selectedInGroup = selectedCourses[groupKey] || [];
            const allCoursesInGroup = group.courses.map((course) => course.id);
            const allSelected =
              allCoursesInGroup.length > 0 &&
              allCoursesInGroup.every((id) => selectedInGroup.includes(id));

            return (
              <div key={group.title} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{group.title}</h2>
                  <div className="flex gap-2">
                    <div className="flex items-center">
                      <Checkbox
                        id={`select-all-${groupKey}`}
                        checked={allSelected}
                        onCheckedChange={() =>
                          toggleSelectAll(groupKey, allCoursesInGroup)
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor={`select-all-${groupKey}`}
                        className="text-sm cursor-pointer"
                      >
                        Select All
                      </label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleBulkEnrollment(groupKey)}
                      disabled={
                        selectedInGroup.length === 0 ||
                        enrollingCourses.length > 0
                      }
                    >
                      {enrollingCourses.length > 0 &&
                      selectedInGroup.some((id) =>
                        enrollingCourses.includes(id)
                      ) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        `Enroll Selected (${selectedInGroup.length})`
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.courses.map((course) => {
                    const isSelected = selectedInGroup.includes(course.id);
                    const isEnrolling = enrollingCourses.includes(course.id);

                    return (
                      <Card
                        key={course.id}
                        className={cn(
                          "flex flex-col",
                          isSelected && "border-primary"
                        )}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start gap-2">
                            <Checkbox
                              id={`course-${course.id}`}
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleCourseSelection(groupKey, course.id)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <CardTitle className="flex justify-between items-start">
                                <div>
                                  <label
                                    htmlFor={`course-${course.id}`}
                                    className="text-lg cursor-pointer hover:underline"
                                  >
                                    {course.name}
                                  </label>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    ({course.code})
                                  </span>
                                </div>
                                <Badge>{course.credits} credits</Badge>
                              </CardTitle>
                              <CardDescription>
                                <p className="line-clamp-2">
                                  {course.description}
                                </p>
                                <p className="mt-2">
                                  Instructor: {course.faculty.profile.firstName}{" "}
                                  {course.faculty.profile.lastName}
                                </p>
                                {course.prerequisites.length > 0 && (
                                  <div className="mt-2">
                                    <p className="font-medium">
                                      Prerequisites:
                                    </p>
                                    <ul className="list-disc list-inside">
                                      {course.prerequisites.map(
                                        (prerequisite) => (
                                          <li key={prerequisite.id}>
                                            {prerequisite.code} -{" "}
                                            {prerequisite.name}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardFooter className="mt-auto pt-2">
                          <Button
                            className="w-full"
                            onClick={() => handleEnrollment(course.id)}
                            disabled={isEnrolling}
                          >
                            {isEnrolling ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enrolling...
                              </>
                            ) : (
                              "Enroll"
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
