"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import CourseCard from "./components/CourseCard";

// Define types
interface Student {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface Enrollment {
  id: string;
  status: string;
  student: Student;
}

interface Section {
  id: string;
  sectionCode: string;
  schedule: string;
  room: string;
  maxStudents: number;
  enrollments: Enrollment[];
  stats: {
    totalEnrollments: number;
    pendingEnrollments: number;
    approvedEnrollments: number;
    completedEnrollments: number;
    availableSeats: number;
  };
}

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  capacity: number;
  semester: string;
  year: number;
  status: string;
  sections: Section[];
  prerequisites: {
    id: string;
    code: string;
    name: string;
  }[];
  stats: {
    totalEnrollments: number;
    pendingEnrollments: number;
    approvedEnrollments: number;
    completedEnrollments: number;
    availableSeats: number;
    totalSections: number;
  };
}

export default function FacultyCourses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/faculty/courses");

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
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  // Filter courses based on search query, semester, and year
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSemester =
      selectedSemester === "all" || course.semester === selectedSemester;

    const matchesYear =
      selectedYear === "all" || course.year.toString() === selectedYear;

    return matchesSearch && matchesSemester && matchesYear;
  });

  // Get unique years and semesters for filter dropdowns
  const years = [
    "all",
    ...new Set(courses.map((course) => course.year.toString())),
  ].sort();
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

  // Calculate total stats
  const totalStats = courses.reduce(
    (acc, course) => {
      acc.totalCourses += 1;
      acc.totalSections += course.stats.totalSections;
      acc.totalStudents += course.stats.approvedEnrollments;
      return acc;
    },
    { totalCourses: 0, totalSections: 0, totalStudents: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">
            Manage your courses, sections, and students
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sections
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalSections}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalStudents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All Years</option>
            {years
              .filter((year) => year !== "all")
              .map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
          </select>
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="all">All Semesters</option>
            {semesters
              .filter((semester) => semester !== "all")
              .map((semester) => (
                <option key={semester} value={semester}>
                  {semester.charAt(0) + semester.slice(1).toLowerCase()}{" "}
                  Semester
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No courses found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ||
              selectedSemester !== "all" ||
              selectedYear !== "all"
                ? "Try adjusting your filters"
                : "You are not assigned to any courses yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.values(groupedCourses)
            .sort((a, b) => {
              // Sort by year first, then by semester
              if (a.year !== b.year) return a.year - b.year;

              const semesterOrder = { FIRST: 1, SECOND: 2, SUMMER: 3 };
              return (
                semesterOrder[a.semester as keyof typeof semesterOrder] -
                semesterOrder[b.semester as keyof typeof semesterOrder]
              );
            })
            .map((group) => (
              <div key={group.title} className="space-y-4">
                <h2 className="text-xl font-semibold">{group.title}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
