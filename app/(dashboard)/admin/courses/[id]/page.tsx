"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Import components
import {
  CourseHeader,
  CourseInfoCard,
  SectionSummaryCard,
  SectionsTable,
  StudentsTable,
  SectionDialog,
  AssignInstructorDialog,
  DeleteSectionDialog,
  DeleteCourseDialog,
} from "./components";

// Define types
interface Faculty {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    department?: string;
  };
}

interface Prerequisite {
  id: string;
  code: string;
  name: string;
}

interface Student {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    studentId?: string;
  };
}

interface Enrollment {
  id: string;
  student: Student;
}

interface Section {
  id: string;
  sectionCode: string;
  schedule: string;
  room: string;
  maxStudents: number;
  enrollments: Enrollment[];
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
  enrollments: Enrollment[];
  prerequisites: Prerequisite[];
  createdAt: string;
  updatedAt: string;
}

interface SectionFormData {
  sectionCode: string;
  schedule: string;
  room: string;
  maxStudents: number;
}

export default function CourseDetails() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDeleteSectionDialog, setShowDeleteSectionDialog] = useState(false);
  const [showDeleteCourseDialog, setShowDeleteCourseDialog] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [sectionFormData, setSectionFormData] = useState<SectionFormData>({
    sectionCode: "",
    schedule: "",
    room: "",
    maxStudents: 30,
  });

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/courses/${courseId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch course data");
        }

        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Failed to load course data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Fetch faculty list
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await fetch("/api/faculty");

        if (!response.ok) {
          throw new Error("Failed to fetch faculty data");
        }

        const data = await response.json();
        setFacultyList(data);
      } catch (error) {
        console.error("Error fetching faculty:", error);
        // We don't set the main error state here to avoid blocking the course display
      }
    };

    fetchFaculty();
  }, []);

  // Handle section form input changes
  const handleSectionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSectionFormData({
      ...sectionFormData,
      [name]: name === "maxStudents" ? parseInt(value) : value,
    });
  };

  // Handle edit section
  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    setSectionFormData({
      sectionCode: section.sectionCode,
      schedule: section.schedule,
      room: section.room,
      maxStudents: section.maxStudents,
    });
    setShowSectionDialog(true);
  };

  // Handle add section
  const handleAddSection = () => {
    setSelectedSection(null);
    setSectionFormData({
      sectionCode: "",
      schedule: "",
      room: "",
      maxStudents: 30,
    });
    setShowSectionDialog(true);
  };

  // Handle save section (add or edit)
  const handleSaveSection = async () => {
    try {
      if (
        !sectionFormData.sectionCode ||
        !sectionFormData.schedule ||
        !sectionFormData.room
      ) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      if (selectedSection) {
        // Edit existing section
        const response = await fetch(
          `/api/courses/${courseId}/sections/${selectedSection.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sectionFormData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update section");
        }

        const data = await response.json();

        // Update the course data with the updated section
        if (course) {
          setCourse({
            ...course,
            sections: course.sections.map((s) =>
              s.id === selectedSection.id ? data.section : s
            ),
          });
        }

        toast({
          title: "Section Updated",
          description: "The section has been updated successfully.",
        });
      } else {
        // Add new section
        const response = await fetch(`/api/courses/${courseId}/sections`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sectionFormData),
        });

        if (!response.ok) {
          throw new Error("Failed to add section");
        }

        const data = await response.json();

        // Update the course data with the new section
        if (course) {
          setCourse({
            ...course,
            sections: [...course.sections, data.section],
          });
        }

        toast({
          title: "Section Added",
          description: "The section has been added successfully.",
        });
      }

      setShowSectionDialog(false);
    } catch (error) {
      console.error("Error saving section:", error);
      toast({
        title: "Error",
        description: "Failed to save section. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle assign instructor
  const handleAssignInstructor = (section: Section) => {
    setSelectedSection(section);
    setShowAssignDialog(true);
  };

  // Handle save instructor assignment
  const handleSaveInstructorAssignment = async () => {
    try {
      if (!selectedFacultyId) {
        toast({
          title: "No Instructor Selected",
          description: "Please select an instructor to assign.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `/api/courses/${courseId}/sections/${selectedSection?.id}/assign-instructor`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            facultyId: selectedFacultyId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign instructor");
      }

      const data = await response.json();

      // Refresh course data to get updated instructor information
      const courseResponse = await fetch(`/api/courses/${courseId}`);
      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        setCourse(courseData);
      }

      toast({
        title: "Instructor Assigned",
        description: "The instructor has been assigned successfully.",
      });

      setShowAssignDialog(false);
      setSelectedFacultyId("");
    } catch (error) {
      console.error("Error assigning instructor:", error);
      toast({
        title: "Error",
        description: "Failed to assign instructor. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle delete section
  const handleDeleteSection = (section: Section) => {
    setSelectedSection(section);
    setShowDeleteSectionDialog(true);
  };

  // Handle confirm delete section
  const handleConfirmDeleteSection = async () => {
    try {
      if (!selectedSection) return;

      const response = await fetch(
        `/api/courses/${courseId}/sections/${selectedSection.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete section");
      }

      // Update the course data by removing the deleted section
      if (course) {
        setCourse({
          ...course,
          sections: course.sections.filter((s) => s.id !== selectedSection.id),
        });
      }

      toast({
        title: "Section Deleted",
        description: "The section has been deleted successfully.",
      });

      setShowDeleteSectionDialog(false);
    } catch (error) {
      console.error("Error deleting section:", error);
      toast({
        title: "Error",
        description: "Failed to delete section. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle delete course
  const handleDeleteCourse = () => {
    setShowDeleteCourseDialog(true);
  };

  // Handle confirm delete course
  const handleConfirmDeleteCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to delete course";
        const errorDetails = errorData.details ? `\n${errorData.details}` : "";
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      toast({
        title: "Course Deleted",
        description: "The course has been deleted successfully.",
      });

      setShowDeleteCourseDialog(false);
      router.push("/admin/courses");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate total enrollments for a course across all sections
  const getTotalEnrollments = () => {
    if (!course) return 0;
    return course.sections.reduce(
      (total, section) => total + section.enrollments.length,
      0
    );
  };

  // Calculate total capacity for a course across all sections
  const getTotalCapacity = () => {
    if (!course) return 0;
    return course.sections.reduce(
      (total, section) => total + section.maxStudents,
      0
    );
  };

  // Get instructor name if available
  const getInstructorName = (section: Section) => {
    // This is a placeholder - in a real implementation, you would get the instructor name from the section data
    // For now, we'll use the course faculty if available
    if (course?.faculty?.profile) {
      return `${course.faculty.profile.firstName} ${course.faculty.profile.lastName}`;
    }
    return "No instructor assigned";
  };

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Loading course data...</p>
      </div>
    );
  }

  // If error, show error state
  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-lg font-medium mb-2">Failed to load course data</p>
        <p className="text-muted-foreground mb-4">
          {error || "Course not found"}
        </p>
        <Link href="/admin/courses">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <CourseHeader
        courseId={course.id}
        courseCode={course.code}
        courseName={course.name}
        onAddSection={handleAddSection}
        onDeleteCourse={handleDeleteCourse}
      />

      {/* Course Info and Section Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CourseInfoCard
            credits={course.credits}
            capacity={course.capacity}
            semester={course.semester}
            year={course.year}
            status={course.status}
            prerequisites={course.prerequisites}
            instructorName={
              course.faculty?.profile
                ? `${course.faculty.profile.firstName} ${course.faculty.profile.lastName}`
                : "No instructor assigned"
            }
            createdAt={course.createdAt}
            updatedAt={course.updatedAt}
            description={course.description}
            sectionsCount={course.sections.length}
            totalEnrollments={getTotalEnrollments()}
            totalCapacity={getTotalCapacity()}
          />
        </div>
        <div>
          <SectionSummaryCard
            sections={course.sections}
            getInstructorName={getInstructorName}
            onAddSection={handleAddSection}
          />
        </div>
      </div>

      {/* Tabs for Sections and Students */}
      <Tabs defaultValue="sections" className="w-full">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        <TabsContent value="sections" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Sections</CardTitle>
            </CardHeader>
            <CardContent>
              {course.sections.length > 0 ? (
                <SectionsTable
                  sections={course.sections}
                  getInstructorName={getInstructorName}
                  onEditSection={handleEditSection}
                  onAssignInstructor={handleAssignInstructor}
                  onDeleteSection={handleDeleteSection}
                />
              ) : (
                <div className="text-center py-6 border rounded-md">
                  <p className="text-muted-foreground">
                    No sections created yet
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={handleAddSection}
                  >
                    Add Section
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
            </CardHeader>
            <CardContent>
              {course.sections.length > 0 ? (
                <StudentsTable sections={course.sections} />
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No sections available to display students
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SectionDialog
        open={showSectionDialog}
        onOpenChange={setShowSectionDialog}
        selectedSection={selectedSection}
        courseCode={course.code}
        courseName={course.name}
        onSave={handleSaveSection}
        formData={sectionFormData}
        onFormChange={handleSectionInputChange}
      />

      <AssignInstructorDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        selectedSection={selectedSection}
        courseCode={course.code}
        courseName={course.name}
        facultyList={facultyList}
        selectedFacultyId={selectedFacultyId}
        onFacultyChange={setSelectedFacultyId}
        onSave={handleSaveInstructorAssignment}
        instructorName={
          selectedSection ? getInstructorName(selectedSection) : ""
        }
      />

      <DeleteSectionDialog
        open={showDeleteSectionDialog}
        onOpenChange={setShowDeleteSectionDialog}
        selectedSection={selectedSection}
        onConfirmDelete={handleConfirmDeleteSection}
        getInstructorName={getInstructorName}
      />

      <DeleteCourseDialog
        open={showDeleteCourseDialog}
        onOpenChange={setShowDeleteCourseDialog}
        onConfirmDelete={handleConfirmDeleteCourse}
        courseCode={course.code}
        courseName={course.name}
        sectionsCount={course.sections.length}
        enrollmentsCount={getTotalEnrollments()}
      />
    </div>
  );
}
