"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BookOpen,
  Save,
  X,
  AlertCircle,
  Loader2,
  ChevronLeft,
  GraduationCap,
  Users,
  Info,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MultiSelect } from "@/components/ui/multi-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
}

export default function CreateCourse() {
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

  // Fetch faculty and courses data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch faculty members
        const facultyResponse = await fetch("/api/users?role=FACULTY");
        if (!facultyResponse.ok) {
          throw new Error("Failed to fetch faculty members");
        }
        const facultyData = await facultyResponse.json();

        // Ensure faculty data is an array
        setFaculty(
          Array.isArray(facultyData)
            ? facultyData
            : facultyData.data
            ? facultyData.data
            : []
        );

        // Fetch courses for prerequisites
        const coursesResponse = await fetch("/api/courses");
        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses");
        }
        const coursesData = await coursesResponse.json();

        // Ensure courses data is an array
        setCourses(
          Array.isArray(coursesData)
            ? coursesData
            : coursesData.data
            ? coursesData.data
            : []
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load form data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
  const handlePrerequisitesChange = (selectedValues: string[]) => {
    setFormData((prev) => ({ ...prev, prerequisites: selectedValues }));
  };

  // Handle checkbox change
  const handleStatusChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, status: checked ? "OPEN" : "CLOSED" }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create course");
      }

      toast({
        title: "Success",
        description: "Course created successfully",
      });

      // Redirect to courses page after successful creation
      router.push("/admin/courses");
    } catch (error) {
      console.error("Error creating course:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create course"
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

  // Credits options
  const creditsOptions = [
    { id: "1", name: "1 Credit" },
    { id: "2", name: "2 Credits" },
    { id: "3", name: "3 Credits" },
    { id: "4", name: "4 Credits" },
    { id: "5", name: "5 Credits" },
  ];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-8 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <Link href="/admin/courses">
              <Button variant="ghost" size="sm" className="mr-2">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Courses
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Create New Course</h1>
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
            Add a new course to the university catalog
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

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">Basic Info</span>
                  <span className="sm:hidden">Basic</span>
                </TabsTrigger>
                <TabsTrigger
                  value="academic"
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Academic Details</span>
                  <span className="sm:hidden">Academic</span>
                </TabsTrigger>
                <TabsTrigger
                  value="enrollment"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Enrollment Options</span>
                  <span className="sm:hidden">Enrollment</span>
                </TabsTrigger>
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
              </TabsContent>

              <TabsContent value="academic" className="space-y-6">
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
                      required
                    >
                      <SelectTrigger className="w-full">
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
                      Academic Year <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) =>
                        handleSelectChange("year", value)
                      }
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select year" />
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
                    <Label
                      htmlFor="credits"
                      className="flex items-center gap-1"
                    >
                      Credits <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.credits}
                      onValueChange={(value) =>
                        handleSelectChange("credits", value)
                      }
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select credits" />
                      </SelectTrigger>
                      <SelectContent>
                        {creditsOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prerequisites">Prerequisites</Label>
                    <MultiSelect
                      options={courses.map((course) => ({
                        label:
                          course.code && course.name
                            ? `${course.code}: ${course.name}`
                            : course.code ||
                              course.name ||
                              `Course ID: ${course.id}`,
                        value: course.id,
                      }))}
                      selected={formData.prerequisites}
                      onChange={handlePrerequisitesChange}
                      placeholder="Select prerequisites (if any)"
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="enrollment" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="capacity"
                      className="flex items-center gap-1"
                    >
                      Maximum Capacity <span className="text-red-500">*</span>
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
                  <div className="space-y-2">
                    <Label htmlFor="facultyId">Primary Instructor</Label>
                    <Select
                      value={formData.facultyId || undefined}
                      onValueChange={(value) =>
                        handleSelectChange("facultyId", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select instructor (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculty.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.profile
                              ? `${instructor.profile.firstName} ${instructor.profile.lastName}`
                              : instructor.email ||
                                `Faculty ID: ${instructor.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Faculty members can choose which courses they want to
                      teach later
                    </p>
                  </div>
                </div>

                <div className="space-y-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="active"
                      checked={formData.status === "OPEN"}
                      onCheckedChange={handleStatusChange}
                      defaultChecked
                    />
                    <div>
                      <Label htmlFor="active" className="font-medium">
                        Make course active and available for enrollment
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Inactive courses will not be visible to students for
                        enrollment
                      </p>
                    </div>
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
                  onClick={() => router.push("/admin/courses")}
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
                      Creating Course...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Course
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
