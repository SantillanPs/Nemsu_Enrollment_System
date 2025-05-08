"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  Save,
  X,
  Loader2,
  Info,
  AlertCircle,
  BookOpen,
} from "lucide-react";

interface Faculty {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
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
  facultyId: string | null;
  faculty?: Faculty;
  prerequisites: {
    id: string;
    code: string;
    name: string;
  }[];
}

export default function EditCourse() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    credits: "",
    capacity: "",
    facultyId: "",
    semester: "",
    year: "",
    prerequisites: [] as string[],
    status: "OPEN",
  });

  // Fetch course data and populate form
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch course data
        const courseResponse = await fetch(`/api/courses/${courseId}`);
        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course data");
        }
        const courseData = await courseResponse.json();

        // Fetch faculty list
        const facultyResponse = await fetch("/api/faculty");
        if (!facultyResponse.ok) {
          throw new Error("Failed to fetch faculty data");
        }
        const facultyData = await facultyResponse.json();
        setFaculty(facultyData);

        // Fetch all courses for prerequisites
        const coursesResponse = await fetch("/api/courses");
        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses data");
        }
        const coursesData = await coursesResponse.json();

        // Filter out the current course from the prerequisites list
        const filteredCourses = Array.isArray(coursesData)
          ? coursesData.filter((c: Course) => c.id !== courseId)
          : [];
        setCourses(filteredCourses);

        // Populate form data
        setFormData({
          code: courseData.code || "",
          name: courseData.name || "",
          description: courseData.description || "",
          credits: courseData.credits?.toString() || "",
          capacity: courseData.capacity?.toString() || "",
          facultyId: courseData.facultyId || "none", // Use "none" for null facultyId
          semester: courseData.semester || "",
          year: courseData.year?.toString() || "",
          prerequisites: courseData.prerequisites?.map((p: any) => p.id) || [],
          status: courseData.status || "OPEN",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load course data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle prerequisites selection
  const handlePrerequisiteChange = (courseId: string) => {
    setFormData((prev) => {
      const prerequisites = [...prev.prerequisites];
      const index = prerequisites.indexOf(courseId);

      if (index === -1) {
        prerequisites.push(courseId);
      } else {
        prerequisites.splice(index, 1);
      }

      return { ...prev, prerequisites };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (
        !formData.code ||
        !formData.name ||
        !formData.description ||
        !formData.credits ||
        !formData.capacity ||
        !formData.semester ||
        !formData.year
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare the data for submission
      const submissionData = {
        ...formData,
        // Convert "none" to null for facultyId
        facultyId: formData.facultyId === "none" ? null : formData.facultyId,
      };

      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update course");
      }

      toast({
        title: "Success",
        description: "Course updated successfully",
      });

      // Redirect to course details page after successful update
      router.push(`/admin/courses/${courseId}`);
    } catch (error) {
      console.error("Error updating course:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update course"
      );
      setIsSubmitting(false);
    }
  };

  // Semester options
  const semesters = [
    { id: "FIRST", name: "First Semester" },
    { id: "SECOND", name: "Second Semester" },
    { id: "SUMMER", name: "Summer" },
  ];

  // Academic year options
  const years = [
    { id: "1", name: "First Year" },
    { id: "2", name: "Second Year" },
    { id: "3", name: "Third Year" },
    { id: "4", name: "Fourth Year" },
  ];

  // Status options
  const statuses = [
    { id: "OPEN", name: "Open" },
    { id: "CLOSED", name: "Closed" },
    { id: "CANCELLED", name: "Cancelled" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <Link href={`/admin/courses/${courseId}`}>
              <Button variant="ghost" size="sm" className="mr-2">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Course Details
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Edit Course</h1>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden shadow-md border-t-4 border-t-blue-600">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle>Course Information</CardTitle>
          </div>
          <CardDescription>
            Update course details in the university catalog
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="px-6 pt-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="flex items-center gap-1">
                      Course Code <span className="text-red-500">*</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground ml-1 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px]">
                              Enter a unique course code (department prefix +
                              number)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="code"
                      placeholder="e.g., CS101"
                      value={formData.code}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-1">
                      Course Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Introduction to Computer Science"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="flex items-center gap-1"
                  >
                    Course Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter a detailed description of the course..."
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full resize-y min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="credits"
                      className="flex items-center gap-1"
                    >
                      Credits <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      max="6"
                      placeholder="e.g., 3"
                      value={formData.credits}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="capacity"
                      className="flex items-center gap-1"
                    >
                      Capacity <span className="text-red-500">*</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground ml-1 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px]">
                              Maximum number of students that can enroll in this
                              course
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      placeholder="e.g., 30"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="semester"
                      className="flex items-center gap-1"
                    >
                      Semester <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) =>
                        handleSelectChange("semester", value)
                      }
                    >
                      <SelectTrigger id="semester" className="w-full">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((semester) => (
                          <SelectItem key={semester.id} value={semester.id}>
                            {semester.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year" className="flex items-center gap-1">
                      Year Level <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) =>
                        handleSelectChange("year", value)
                      }
                    >
                      <SelectTrigger id="year" className="w-full">
                        <SelectValue placeholder="Select year level" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="flex items-center gap-1">
                      Status <span className="text-red-500">*</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground ml-1 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px]">
                              Open: Available for enrollment
                              <br />
                              Closed: Not available for enrollment
                              <br />
                              Cancelled: Course is cancelled
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="facultyId"
                      className="flex items-center gap-1"
                    >
                      Instructor
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground ml-1 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px]">
                              Optional: Assign an instructor to this course
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Select
                      value={formData.facultyId}
                      onValueChange={(value) =>
                        handleSelectChange("facultyId", value)
                      }
                    >
                      <SelectTrigger id="facultyId" className="w-full">
                        <SelectValue placeholder="Select instructor (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Unassigned)</SelectItem>
                        {faculty.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.profile.firstName} {f.profile.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Prerequisites
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground ml-1 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px]">
                            Optional: Select courses that must be completed
                            before taking this course
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                    {courses.length > 0 ? (
                      <div className="space-y-2">
                        {courses.map((course) => (
                          <div
                            key={course.id}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={`prereq-${course.id}`}
                              checked={formData.prerequisites.includes(
                                course.id
                              )}
                              onChange={() =>
                                handlePrerequisiteChange(course.id)
                              }
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`prereq-${course.id}`}
                              className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              {course.code}: {course.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No other courses available to select as prerequisites
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                <span className="text-red-500">*</span> Required fields
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/courses/${courseId}`)}
                  className="w-full sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Course...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Course
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
