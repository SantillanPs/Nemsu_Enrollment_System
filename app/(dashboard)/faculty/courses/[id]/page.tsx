"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Clock,
  MapPin,
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  ChevronRight,
} from "lucide-react";

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

export default function CourseDetails() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/faculty/courses`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch course");
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid course data received");
        }

        const foundCourse = data.find((c: Course) => c.id === params.id);
        if (!foundCourse) {
          throw new Error("Course not found");
        }

        setCourse(foundCourse);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch course. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCourse();
    }
  }, [params.id, toast]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300";
      case "CLOSED":
        return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The course you are looking for does not exist or you do not have
          permission to view it.
        </p>
        <Button onClick={() => router.push("/faculty/courses")}>
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/faculty/courses")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {course.code}: {course.name}
              </h1>
              <Badge className={getStatusColor(course.status)}>
                {course.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {course.semester.charAt(0) +
                course.semester.slice(1).toLowerCase()}{" "}
              Semester, Year {course.year}
            </p>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.credits}</div>
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
            <div className="text-2xl font-bold">
              {course.stats.approvedEnrollments}/{course.capacity}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.sections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Seats
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course.stats.availableSeats}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sections</h2>
        {course.sections.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {course.sections.map((section) => (
              <Link
                key={section.id}
                href={`/faculty/courses/${course.id}/sections/${section.id}`}
                className="block h-full"
              >
                <Card className="flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Section {section.sectionCode}
                        </CardTitle>
                      </div>
                      <Badge variant="outline">
                        {section.enrollments.length}/{section.maxStudents}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{section.schedule}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{section.room}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {section.stats.approvedEnrollments} enrolled,{" "}
                            {section.stats.availableSeats} seats available
                          </span>
                        </div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Enrollment Status</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                          <span className="text-muted-foreground">
                            Pending: {section.stats.pendingEnrollments}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-muted-foreground">
                            Approved: {section.stats.approvedEnrollments}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span className="text-muted-foreground">
                            Completed: {section.stats.completedEnrollments}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-slate-500"></div>
                          <span className="text-muted-foreground">
                            Total: {section.stats.totalEnrollments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center justify-center w-full text-sm text-primary gap-1">
                      <span>View student details</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Clock className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No sections available</p>
              <p className="text-sm text-muted-foreground mt-1">
                This course does not have any sections yet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
