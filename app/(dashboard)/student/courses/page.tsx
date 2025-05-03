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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

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
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
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
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to enroll");
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
        description:
          error instanceof Error
            ? error.message
            : "Failed to enroll in course. Please try again.",
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

      <div className="flex gap-4 mb-6">
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xl font-semibold mb-4">{group.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.courses.map((course) => (
                  <Card key={course.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <div>
                          <span className="text-lg">{course.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({course.code})
                          </span>
                        </div>
                        <Badge>{course.credits} credits</Badge>
                      </CardTitle>
                      <CardDescription>
                        <p className="line-clamp-2">{course.description}</p>
                        <p className="mt-2">
                          Instructor: {course.faculty.profile.firstName}{" "}
                          {course.faculty.profile.lastName}
                        </p>
                        {course.prerequisites.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Prerequisites:</p>
                            <ul className="list-disc list-inside">
                              {course.prerequisites.map((prerequisite) => (
                                <li key={prerequisite.id}>
                                  {prerequisite.code} - {prerequisite.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                      <Button
                        className="w-full"
                        onClick={() => handleEnrollment(course.id)}
                      >
                        Enroll
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
