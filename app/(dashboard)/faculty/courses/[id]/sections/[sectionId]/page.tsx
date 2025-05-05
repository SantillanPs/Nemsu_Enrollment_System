"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Clock,
  MapPin,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  MessageSquare,
  Download,
  Upload,
  PlusCircle,
  Pencil,
  Save,
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

interface Attendance {
  date: string;
  present: boolean;
  notes?: string;
}

interface Grade {
  assignmentId: string;
  score: number;
  maxScore: number;
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  weight: number;
  type: "quiz" | "homework" | "exam" | "project" | "participation";
}

interface Enrollment {
  id: string;
  status: string;
  student: Student;
  attendance?: Attendance[];
  grades?: Grade[];
}

interface Section {
  id: string;
  sectionCode: string;
  schedule: string;
  room: string;
  maxStudents: number;
  enrollments: Enrollment[];
  assignments: Assignment[];
  syllabus?: string;
  announcements?: {
    id: string;
    title: string;
    content: string;
    date: string;
  }[];
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

export default function SectionDetails() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Mock data for classroom activities
  const [mockAssignments] = useState<Assignment[]>([
    {
      id: "1",
      title: "Midterm Exam",
      description: "Comprehensive exam covering chapters 1-5",
      dueDate: "2023-10-15",
      maxScore: 100,
      weight: 30,
      type: "exam",
    },
    {
      id: "2",
      title: "Research Paper",
      description: "5-page research paper on a topic of your choice",
      dueDate: "2023-11-20",
      maxScore: 50,
      weight: 20,
      type: "project",
    },
    {
      id: "3",
      title: "Weekly Quiz 1",
      description: "Short quiz on chapter 1 material",
      dueDate: "2023-09-10",
      maxScore: 10,
      weight: 5,
      type: "quiz",
    },
  ]);

  const [mockAnnouncements] = useState([
    {
      id: "1",
      title: "Class Canceled Next Monday",
      content:
        "Due to the holiday, our class will not meet next Monday. Please complete the assigned reading.",
      date: "2023-09-05",
    },
    {
      id: "2",
      title: "Office Hours Change",
      content:
        "My office hours will be moved to Thursday 2-4pm starting next week.",
      date: "2023-09-10",
    },
  ]);

  // Fetch course and section data
  useEffect(() => {
    const fetchData = async () => {
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

        const foundSection = foundCourse.sections.find(
          (s: Section) => s.id === params.sectionId
        );
        if (!foundSection) {
          throw new Error("Section not found");
        }

        setSection(foundSection);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id && params.sectionId) {
      fetchData();
    }
  }, [params.id, params.sectionId, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading section details...</p>
        </div>
      </div>
    );
  }

  if (!course || !section) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Section Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The section you are looking for does not exist or you do not have
          permission to view it.
        </p>
        <Button onClick={() => router.push(`/faculty/courses/${params.id}`)}>
          Back to Course
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
            onClick={() => router.push(`/faculty/courses/${course.id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {course.code}: Section {section.sectionCode}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {course.name} •{" "}
              {course.semester.charAt(0) +
                course.semester.slice(1).toLowerCase()}{" "}
              Semester, Year {course.year}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Roster
          </Button>
          <Button size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message Class
          </Button>
        </div>
      </div>

      {/* Section Info */}
      <Card>
        <CardHeader>
          <CardTitle>Section Information</CardTitle>
          <CardDescription>
            Details about this section and its schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Schedule
              </span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{section.schedule}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Location
              </span>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{section.room}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Capacity
              </span>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {section.enrollments.length}/{section.maxStudents} students
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="roster" className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-auto md:grid-cols-5">
          <TabsTrigger value="roster">Class Roster</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        {/* Class Roster Tab */}
        <TabsContent value="roster" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Class Roster</CardTitle>
                  <CardDescription>
                    Students currently enrolled in this section
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search students..."
                    className="w-full md:w-[250px]"
                  />
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {section.enrollments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Student</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {section.enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span>
                                {enrollment.student.profile.firstName}{" "}
                                {enrollment.student.profile.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{enrollment.student.email}</TableCell>
                          <TableCell>{enrollment.student.id}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <Users className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No students enrolled</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    There are no students enrolled in this section yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Attendance Tracker</CardTitle>
                  <CardDescription>
                    Track student attendance for each class session
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full md:w-[200px]"
                  />
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {section.enrollments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Student</TableHead>
                        <TableHead className="w-[100px] text-center">
                          Present
                        </TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {section.enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.student.profile.firstName}{" "}
                            {enrollment.student.profile.lastName}
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                          <TableCell>
                            <Input placeholder="Add notes (optional)" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <Users className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No students enrolled</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    There are no students enrolled in this section yet
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Attendance</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Assignments</CardTitle>
                  <CardDescription>
                    Manage course assignments and track student progress
                  </CardDescription>
                </div>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAssignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {assignment.title}
                          </CardTitle>
                          <CardDescription>
                            {assignment.description}
                          </CardDescription>
                        </div>
                        <Badge>
                          {assignment.type.charAt(0).toUpperCase() +
                            assignment.type.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Due Date:
                          </span>
                          <p className="font-medium">{assignment.dueDate}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Max Score:
                          </span>
                          <p className="font-medium">
                            {assignment.maxScore} points
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Weight:</span>
                          <p className="font-medium">{assignment.weight}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Submissions:
                          </span>
                          <p className="font-medium">
                            0/{section.enrollments.length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Submissions
                      </Button>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Grade Book</CardTitle>
                  <CardDescription>
                    Manage and track student grades for all assignments
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Student</TableHead>
                      {mockAssignments.map((assignment) => (
                        <TableHead key={assignment.id} className="text-center">
                          {assignment.title}
                          <div className="text-xs text-muted-foreground">
                            ({assignment.maxScore} pts)
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Overall</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.student.profile.firstName}{" "}
                          {enrollment.student.profile.lastName}
                        </TableCell>
                        {mockAssignments.map((assignment) => (
                          <TableCell
                            key={assignment.id}
                            className="text-center"
                          >
                            <Input
                              type="number"
                              placeholder="-"
                              className="w-16 h-8 text-center mx-auto"
                              min={0}
                              max={assignment.maxScore}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-medium">
                          -
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Grades
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>
                    Post important information for your students
                  </CardDescription>
                </div>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnnouncements.map((announcement) => (
                  <Card key={announcement.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">
                          {announcement.title}
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {announcement.date}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>{announcement.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
