"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Calendar,
  Clock,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

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

interface Enrollment {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN" | "COMPLETED";
  grade: string | null;
  course: Course;
  createdAt: string;
}

export default function MyCourses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/courses");

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setEnrollments(data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch enrolled courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter enrollments based on search term, year, semester, and status
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${enrollment.course.faculty.profile.firstName} ${enrollment.course.faculty.profile.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const [year] = enrollment.course.semester.split(" - ");
    const matchesYear = selectedYear === "all" || year === selectedYear;
    const matchesSemester =
      selectedSemester === "all" ||
      enrollment.course.semester.includes(selectedSemester);
    const matchesStatus =
      selectedStatus === "all" || enrollment.status === selectedStatus;

    return matchesSearch && matchesYear && matchesSemester && matchesStatus;
  });

  // Get unique years and semesters for filter dropdowns
  const years = [
    "all",
    ...new Set(enrollments.map((e) => e.course.semester.split(" - ")[0])),
  ];
  const semesters = ["all", "First Semester", "Second Semester", "Summer"];
  const statuses = [
    "all",
    "PENDING",
    "APPROVED",
    "REJECTED",
    "WITHDRAWN",
    "COMPLETED",
  ];

  // Group enrollments by semester
  const groupedEnrollments = filteredEnrollments.reduce((acc, enrollment) => {
    const key = enrollment.course.semester;
    if (!acc[key]) {
      acc[key] = {
        semester: enrollment.course.semester,
        title: enrollment.course.semester,
        enrollments: [],
      };
    }
    acc[key].enrollments.push(enrollment);
    return acc;
  }, {} as Record<string, { semester: string; title: string; enrollments: Enrollment[] }>);

  // Sort by year and semester
  const sortedGroups = Object.values(groupedEnrollments).sort((a, b) => {
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

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      APPROVED: "bg-green-100 text-green-800 hover:bg-green-100",
      REJECTED: "bg-red-100 text-red-800 hover:bg-red-100",
      WITHDRAWN: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      COMPLETED: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 hover:bg-gray-100"
    );
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
        <div className="flex flex-wrap items-center gap-2">
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
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "all" ? "All Statuses" : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-8">
        {sortedGroups.map((group) => (
          <div key={group.semester} className="space-y-4">
            <h3 className="text-xl font-semibold pl-2">{group.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.enrollments.map((enrollment) => (
                <Card
                  key={enrollment.id}
                  className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {enrollment.course.code}
                        </Badge>
                        <CardTitle className="text-lg">
                          {enrollment.course.name}
                        </CardTitle>
                      </div>
                      <Badge className={getStatusColor(enrollment.status)}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 mt-1">
                      {enrollment.course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow pb-0">
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{enrollment.course.credits} credits</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>Instructor</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{group.semester.split(" - ")[0]}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{group.semester.split(" - ")[1]}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Instructor:</span>
                        </div>
                        <span className="text-sm">
                          {enrollment.course.faculty?.profile
                            ? `${enrollment.course.faculty.profile.firstName} ${enrollment.course.faculty.profile.lastName}`
                            : "No instructor assigned"}
                        </span>
                      </div>

                      {enrollment.grade && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-sm">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Grade:</span>
                          </div>
                          <span className="text-sm font-medium">
                            {enrollment.grade}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Enrolled On:</span>
                        </div>
                        <span className="text-sm">
                          {new Date(enrollment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 mt-auto">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center justify-center gap-1"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {enrollment.course.code}: {enrollment.course.name}
                          </DialogTitle>
                          <DialogDescription>
                            Course and enrollment details
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <h4 className="font-medium">Description</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {enrollment.course.description}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">Credits</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {enrollment.course.credits}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium">Instructor</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {enrollment.course.faculty?.profile
                                  ? `${enrollment.course.faculty.profile.firstName} ${enrollment.course.faculty.profile.lastName}`
                                  : "No instructor assigned"}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium">Enrollment Status</h4>
                              <Badge
                                className={`mt-1 ${getStatusColor(
                                  enrollment.status
                                )}`}
                              >
                                {enrollment.status}
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-medium">Grade</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {enrollment.grade || "Not graded"}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium">Enrolled On</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(
                                  enrollment.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredEnrollments.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No enrolled courses found</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm ||
            selectedYear !== "all" ||
            selectedSemester !== "all" ||
            selectedStatus !== "all"
              ? "Try adjusting your search or filter criteria"
              : "You haven't enrolled in any courses yet"}
          </p>
        </div>
      )}
    </div>
  );
}
