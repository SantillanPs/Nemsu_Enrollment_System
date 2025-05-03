"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { BookOpen, Save, X, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MultiSelect } from "@/components/ui/multi-select";

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
        console.log("Faculty data:", facultyData);
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
        console.log("Courses data:", coursesData);
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
        !formData.facultyId ||
        !formData.semester ||
        !formData.year
      ) {
        throw new Error("Please fill in all required fields");
      }

      console.log("Submitting form data:", formData);

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create course");
      }

      toast({
        title: "Success",
        description: "Course created successfully",
      });

      // Redirect to courses page after successful creation
      router.push("/dashboard/admin/courses");
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
      <div className="max-w-4xl mx-auto p-8 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle>Create New Course</CardTitle>
          </div>
          <CardDescription>
            Add a new course to the university catalog
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="px-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="code">Course Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., CS101"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter a unique course code (department prefix + number)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Course Title *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Introduction to Computer Science"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter a detailed description of the course..."
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) =>
                    handleSelectChange("semester", value)
                  }
                  required
                >
                  <SelectTrigger>
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
                <Label htmlFor="year">Academic Year *</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => handleSelectChange("year", value)}
                  required
                >
                  <SelectTrigger>
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
                <Label htmlFor="credits">Credits *</Label>
                <Select
                  value={formData.credits}
                  onValueChange={(value) =>
                    handleSelectChange("credits", value)
                  }
                  required
                >
                  <SelectTrigger>
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
                <Label htmlFor="capacity">Maximum Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  placeholder="e.g., 30"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facultyId">Primary Instructor *</Label>
              <Select
                value={formData.facultyId}
                onValueChange={(value) =>
                  handleSelectChange("facultyId", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {faculty.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.profile
                        ? `${instructor.profile.firstName} ${instructor.profile.lastName}`
                        : instructor.email || `Faculty ID: ${instructor.id}`}
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
                      : course.code || course.name || `Course ID: ${course.id}`,
                  value: course.id,
                }))}
                selected={formData.prerequisites}
                onChange={handlePrerequisitesChange}
                placeholder="Select prerequisites (if any)"
              />
              <p className="text-xs text-muted-foreground">
                Select any prerequisite courses required for enrollment
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.status === "OPEN"}
                  onCheckedChange={handleStatusChange}
                  defaultChecked
                />
                <Label htmlFor="active">
                  Make course active and available for enrollment
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/admin/courses")}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating Course..." : "Create Course"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
