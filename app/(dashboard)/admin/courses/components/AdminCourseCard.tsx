"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Users,
  Clock,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  User,
  Plus,
  Power,
  Loader2,
} from "lucide-react";

// Define types
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

interface Section {
  id: string;
  sectionCode: string;
  schedule: string;
  room: string;
  maxStudents: number;
  enrollments: any[];
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
  facultyId: string | null;
  faculty?: Faculty;
  sections: Section[];
  enrollments: any[];
  prerequisites: Prerequisite[];
  createdAt: string;
  updatedAt: string;
}

interface AdminCourseCardProps {
  course: Course;
  onDeleteCourse: (course: Course) => void;
  onAddSection: (course: Course) => void;
  onAssignInstructor: (course: Course) => void;
  getTotalEnrollments: (course: Course) => number;
  getTotalCapacity: (course: Course) => number;
  onCourseUpdated: (updatedCourse: Course) => void;
}

const AdminCourseCard = ({
  course,
  onDeleteCourse,
  onAddSection,
  onAssignInstructor,
  getTotalEnrollments,
  getTotalCapacity,
  onCourseUpdated,
}: AdminCourseCardProps) => {
  const { toast } = useToast();
  const [isToggling, setIsToggling] = useState(false);

  // Map the database status to the UI status
  const getUiStatus = (status: string) => {
    return status === "OPEN"
      ? "active"
      : status === "CLOSED"
      ? "inactive"
      : status.toLowerCase();
  };

  const uiStatus = getUiStatus(course.status);

  // Handle toggle course status
  const handleToggleStatus = async () => {
    try {
      setIsToggling(true);

      const response = await fetch(`/api/courses/${course.id}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to toggle course status");
      }

      const { data, message } = await response.json();

      // Update the course in the parent component
      onCourseUpdated(data);

      toast({
        title: "Status Updated",
        description: message,
        variant: data.status === "OPEN" ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error toggling course status:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to toggle course status",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get instructor name if available
  const instructorName = course.faculty?.profile
    ? `${course.faculty.profile.firstName} ${course.faculty.profile.lastName}`
    : "No instructor assigned";

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 relative">
        <div className="absolute right-4 top-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Course Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="flex w-full"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/admin/courses/edit/${course.id}`}
                  className="flex w-full"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDeleteCourse(course)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex justify-between items-start pr-8">
          <div>
            <Badge className="mb-2 bg-blue-100 text-blue-800">
              {course.code}
            </Badge>
            <CardTitle className="text-lg">{course.name}</CardTitle>
          </div>
          <Badge className={getStatusColor(uiStatus)}>
            {uiStatus.charAt(0).toUpperCase() + uiStatus.slice(1)}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 mt-1">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow pb-0">
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{course.credits} credits</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>
              {getTotalEnrollments(course)}/{getTotalCapacity(course)} students
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Year {course.year}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {course.semester.charAt(0) +
                course.semester.slice(1).toLowerCase()}{" "}
              Semester
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">
            Sections ({course.sections?.length || 0})
          </h4>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddSection(course)}
            className="h-7 px-2"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          {course.prerequisites && course.prerequisites.length > 0 ? (
            <div className="flex items-start gap-1">
              <span className="font-medium">Prerequisites:</span>
              <span>{course.prerequisites.map((p) => p.code).join(", ")}</span>
            </div>
          ) : null}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-1">
              <span className="font-medium">Instructor:</span>
              <span>{instructorName}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAssignInstructor(course)}
              className="h-7 px-2"
            >
              <User className="h-3.5 w-3.5 mr-1" />
              Change
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 mt-auto flex flex-col gap-3">
        <div className="flex items-center justify-between w-full border rounded-md p-2">
          <div className="flex items-center gap-2">
            <Power
              className={`h-4 w-4 ${
                course.status === "OPEN" ? "text-green-600" : "text-red-600"
              }`}
            />
            <span className="text-sm font-medium">
              {course.status === "OPEN" ? "Active" : "Inactive"}
            </span>
          </div>
          {isToggling ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              <span className="text-xs">Updating...</span>
            </div>
          ) : (
            <Switch
              checked={course.status === "OPEN"}
              onCheckedChange={handleToggleStatus}
              aria-label="Toggle course status"
            />
          )}
        </div>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/admin/courses/${course.id}`}>View Full Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminCourseCard;
