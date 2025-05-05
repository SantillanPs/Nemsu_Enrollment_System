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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Users,
  Clock,
  Calendar,
  MapPin,
  ChevronRight,
  User,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  stats: {
    totalEnrollments: number;
    pendingEnrollments: number;
    approvedEnrollments: number;
    completedEnrollments: number;
    availableSeats: number;
    totalSections: number;
  };
}

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

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

  // Get enrollment status color
  const getEnrollmentStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300";
      case "APPROVED":
        return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300";
      case "DROPPED":
        return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
              {course.code}
            </Badge>
            <CardTitle className="text-lg">{course.name}</CardTitle>
          </div>
          <Badge className={getStatusColor(course.status)}>
            {course.status}
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
              {course.stats.approvedEnrollments}/{course.capacity} students
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Year {course.year}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {course.semester.charAt(0) + course.semester.slice(1).toLowerCase()}{" "}
              Semester
            </span>
          </div>
        </div>

        {course.sections.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sections">
              <AccordionTrigger className="text-sm font-medium py-2">
                Sections ({course.sections.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {course.sections.map((section) => (
                    <div
                      key={section.id}
                      className="border rounded-md overflow-hidden"
                    >
                      <div
                        className="flex justify-between items-center p-3 bg-muted/50 cursor-pointer"
                        onClick={() => toggleSection(section.id)}
                      >
                        <div>
                          <h4 className="font-medium text-sm">
                            Section {section.sectionCode}
                          </h4>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{section.schedule}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{section.room}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {section.enrollments.length}/{section.maxStudents}
                          </Badge>
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${
                              expandedSection === section.id ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {expandedSection === section.id && (
                        <div className="p-3 border-t">
                          <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Enrolled Students
                          </h5>
                          {section.enrollments.length > 0 ? (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[180px]">
                                      Student Name
                                    </TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">
                                      Status
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {section.enrollments.map((enrollment) => (
                                    <TableRow key={enrollment.id}>
                                      <TableCell className="font-medium">
                                        {enrollment.student.profile.firstName}{" "}
                                        {enrollment.student.profile.lastName}
                                      </TableCell>
                                      <TableCell>
                                        {enrollment.student.email}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Badge
                                          className={getEnrollmentStatusColor(
                                            enrollment.status
                                          )}
                                        >
                                          {enrollment.status}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              No students enrolled in this section yet.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>

      <CardFooter className="pt-4 mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          asChild
        >
          <Link href={`/faculty/courses/${course.id}`}>
            View Full Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
