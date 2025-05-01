"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Filter } from "lucide-react";

export default function AvailableCourses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [paginationState, setPaginationState] = useState<
    Record<string, number>
  >({});
  const coursesPerPage = 3;
  const [selectedCourses, setSelectedCourses] = useState<
    Record<string, number[]>
  >({});

  // Mock data for available courses
  const courses = [
    {
      id: 1,
      code: "CS101",
      title: "Introduction to Computer Science",
      department: "Computer Science",
      credits: 3,
      instructor: "Dr. Alan Turing",
      schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
      location: "Science Building, Room 301",
      availableSeats: 15,
      totalSeats: 30,
      description:
        "An introductory course to the fundamental principles of computing and programming.",
      year: 1,
      semester: 1,
      prerequisites: "None",
    },
    {
      id: 2,
      code: "CS 112",
      title: "Fundamentals of programming - C++",
      department: "Computer Science",
      credits: 4,
      instructor: "Dr. Katherine Johnson",
      schedule: "Tue, Thu 9:00 AM - 11:00 AM",
      location: "Science Building, Room 301",
      availableSeats: 8,
      totalSeats: 25,
      description:
        "Introduction to differential and integral calculus of functions of one variable.",
      year: 1,
      semester: 1,
      prerequisites: "MATH101",
    },
    {
      id: 3,
      code: "GE-US",
      title: "Understanding the Self",
      department: "English",
      credits: 3,
      instructor: "Prof. Jane Austen",
      schedule: "Mon, Wed 1:00 PM - 2:30 PM",
      location: "Humanities Building, Room 210",
      availableSeats: 20,
      totalSeats: 30,
      description:
        "Development of writing skills through the study and practice of academic writing.",
      year: 1,
      semester: 1,
      prerequisites: "ENG101",
    },
    {
      id: 4,
      code: "GE-MMW",
      title: "Mathematics in the Modern World",
      department: "Mathematics",
      credits: 4,
      instructor: "Dr. Richard Feynman",
      schedule: "Tue, Thu 1:00 PM - 3:00 PM",
      location: "Science Building, Room 201",
      availableSeats: 12,
      totalSeats: 24,
      description:
        "An introduction to classical mechanics, thermodynamics, and wave phenomena.",
      year: 1,
      semester: 2,
      prerequisites: "None",
    },
    {
      id: 5,
      code: "BIO110",
      title: "General Biology",
      department: "Biology",
      credits: 4,
      instructor: "Dr. Rosalind Franklin",
      schedule: "Mon, Wed, Fri 9:00 AM - 10:30 AM",
      location: "Life Sciences Building, Room 105",
      availableSeats: 5,
      totalSeats: 30,
      description:
        "Introduction to the principles of biology, including cell structure and function.",
      year: 1,
      semester: 2,
      prerequisites: "None",
    },
    {
      id: 6,
      code: "HIST101",
      title: "World History",
      department: "History",
      credits: 3,
      instructor: "Prof. Howard Zinn",
      schedule: "Tue, Thu 11:00 AM - 12:30 PM",
      location: "Humanities Building, Room 310",
      availableSeats: 18,
      totalSeats: 35,
      description:
        "Survey of world history from ancient civilizations to the modern era.",
      year: 1,
      semester: 2,
      prerequisites: "None",
    },
    {
      id: 7,
      code: "HIST101",
      title: "World History",
      department: "History",
      credits: 3,
      instructor: "Prof. Howard Zinn",
      schedule: "Tue, Thu 11:00 AM - 12:30 PM",
      location: "Humanities Building, Room 310",
      availableSeats: 18,
      totalSeats: 35,
      description:
        "Survey of world history from ancient civilizations to the modern era.",
      year: 2,
      semester: 1,
      prerequisites: "None",
    },
    {
      id: 8,
      code: "HIST101",
      title: "World History",
      department: "History",
      credits: 3,
      instructor: "Prof. Howard Zinn",
      schedule: "Tue, Thu 11:00 AM - 12:30 PM",
      location: "Humanities Building, Room 310",
      availableSeats: 18,
      totalSeats: 35,
      description:
        "Survey of world history from ancient civilizations to the modern era.",
      year: 2,
      semester: 1,
      prerequisites: "None",
    },
    {
      id: 9,
      code: "HIST101",
      title: "World History",
      department: "History",
      credits: 3,
      instructor: "Prof. Howard Zinn",
      schedule: "Tue, Thu 11:00 AM - 12:30 PM",
      location: "Humanities Building, Room 310",
      availableSeats: 18,
      totalSeats: 35,
      description:
        "Survey of world history from ancient civilizations to the modern era.",
      year: 2,
      semester: 1,
      prerequisites: "None",
    },
    {
      id: 10,
      code: "CS101",
      title: "Introduction to Computer Science",
      department: "Computer Science",
      credits: 3,
      instructor: "Dr. Alan Turing",
      schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
      location: "Science Building, Room 301",
      availableSeats: 15,
      totalSeats: 30,
      description:
        "An introductory course to the fundamental principles of computing and programming.",
      year: 2,
      semester: 2,
      prerequisites: "None",
    },
    {
      id: 11,
      code: "CS 112",
      title: "Fundamentals of programming - C++",
      department: "Computer Science",
      credits: 4,
      instructor: "Dr. Katherine Johnson",
      schedule: "Tue, Thu 9:00 AM - 11:00 AM",
      location: "Science Building, Room 301",
      availableSeats: 8,
      totalSeats: 25,
      description:
        "Introduction to differential and integral calculus of functions of one variable.",
      year: 2,
      semester: 2,
      prerequisites: "MATH101",
    },
    {
      id: 12,
      code: "GE-US",
      title: "Understanding the Self",
      department: "English",
      credits: 3,
      instructor: "Prof. Jane Austen",
      schedule: "Mon, Wed 1:00 PM - 2:30 PM",
      location: "Humanities Building, Room 210",
      availableSeats: 20,
      totalSeats: 30,
      description:
        "Development of writing skills through the study and practice of academic writing.",
      year: 2,
      semester: 2,
      prerequisites: "ENG101",
    },
    {
      id: 13,
      code: "CS101",
      title: "Introduction to Computer Science",
      department: "Computer Science",
      credits: 3,
      instructor: "Dr. Alan Turing",
      schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
      location: "Science Building, Room 301",
      availableSeats: 15,
      totalSeats: 30,
      description:
        "An introductory course to the fundamental principles of computing and programming.",
      year: 3,
      semester: 1,
      prerequisites: "None",
    },
    {
      id: 14,
      code: "CS 112",
      title: "Fundamentals of programming - C++",
      department: "Computer Science",
      credits: 4,
      instructor: "Dr. Katherine Johnson",
      schedule: "Tue, Thu 9:00 AM - 11:00 AM",
      location: "Science Building, Room 301",
      availableSeats: 8,
      totalSeats: 25,
      description:
        "Introduction to differential and integral calculus of functions of one variable.",
      year: 3,
      semester: 1,
      prerequisites: "MATH101",
    },
    {
      id: 15,
      code: "GE-US",
      title: "Understanding the Self",
      department: "English",
      credits: 3,
      instructor: "Prof. Jane Austen",
      schedule: "Mon, Wed 1:00 PM - 2:30 PM",
      location: "Humanities Building, Room 210",
      availableSeats: 20,
      totalSeats: 30,
      description:
        "Development of writing skills through the study and practice of academic writing.",
      year: 3,
      semester: 1,
      prerequisites: "ENG101",
    },
    {
      id: 16,
      code: "GE-MMW",
      title: "Mathematics in the Modern World",
      department: "Mathematics",
      credits: 4,
      instructor: "Dr. Richard Feynman",
      schedule: "Tue, Thu 1:00 PM - 3:00 PM",
      location: "Science Building, Room 201",
      availableSeats: 12,
      totalSeats: 24,
      description:
        "An introduction to classical mechanics, thermodynamics, and wave phenomena.",
      year: 3,
      semester: 2,
      prerequisites: "None",
    },
    {
      id: 17,
      code: "BIO110",
      title: "General Biology",
      department: "Biology",
      credits: 4,
      instructor: "Dr. Rosalind Franklin",
      schedule: "Mon, Wed, Fri 9:00 AM - 10:30 AM",
      location: "Life Sciences Building, Room 105",
      availableSeats: 5,
      totalSeats: 30,
      description:
        "Introduction to the principles of biology, including cell structure and function.",
      year: 3,
      semester: 2,
      prerequisites: "None",
    },
    {
      id: 18,
      code: "HIST101",
      title: "World History",
      department: "History",
      credits: 3,
      instructor: "Prof. Howard Zinn",
      schedule: "Tue, Thu 11:00 AM - 12:30 PM",
      location: "Humanities Building, Room 310",
      availableSeats: 18,
      totalSeats: 35,
      description:
        "Survey of world history from ancient civilizations to the modern era.",
      year: 3,
      semester: 2,
      prerequisites: "None",
    },
    {
      id: 30,
      code: "CS 331",
      title: "Practicum (162 hours)",
      department: "OJT",
      credits: 3,
      instructor: "N/A",
      schedule: "Tue, Thu 11:00 AM - 12:30 PM",
      location: "Company locaton",
      availableSeats: 18,
      totalSeats: 35,
      description: "Student Summer internship",
      year: 3,
      semester: "Summer",
      prerequisites: "None",
    },
    {
      id: 19,
      code: "HIST101",
      title: "World History",
      department: "History",
      credits: 3,
      instructor: "Prof. Howard Zinn",
      schedule: "Tue, Thu 11:00 AM - 12:30 PM",
      location: "Humanities Building, Room 310",
      availableSeats: 18,
      totalSeats: 35,
      description:
        "Survey of world history from ancient civilizations to the modern era.",
      year: 4,
      semester: 1,
      prerequisites: "None",
    },
    {
      id: 20,
      code: "HIST101",
      title: "World History",
      department: "History",
      credits: 3,
      instructor: "Prof. Howard Zinn",
      schedule: "Tue, Thu 11:00 AM - 12:30 PM",
      location: "Humanities Building, Room 310",
      availableSeats: 18,
      totalSeats: 35,
      description:
        "Survey of world history from ancient civilizations to the modern era.",
      year: 4,
      semester: 1,
      prerequisites: "None",
    },
    {
      id: 21,
      code: "HIST101",
      title: "World History",
      department: "History",
      credits: 3,
      instructor: "Prof. Howard Zinn",
      schedule: "Tue, Thu 11:00 AM - 12:30 PM",
      location: "Humanities Building, Room 310",
      availableSeats: 18,
      totalSeats: 35,
      description:
        "Survey of world history from ancient civilizations to the modern era.",
      year: 4,
      semester: 1,
      prerequisites: "None",
    },
    {
      id: 22,
      code: "CS101",
      title: "Introduction to Computer Science",
      department: "Computer Science",
      credits: 3,
      instructor: "Dr. Alan Turing",
      schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
      location: "Science Building, Room 301",
      availableSeats: 15,
      totalSeats: 30,
      description:
        "An introductory course to the fundamental principles of computing and programming.",
      year: 4,
      semester: 2,
      prerequisites: "None",
    },
    {
      id: 23,
      code: "CS 112",
      title: "Fundamentals of programming - C++",
      department: "Computer Science",
      credits: 4,
      instructor: "Dr. Katherine Johnson",
      schedule: "Tue, Thu 9:00 AM - 11:00 AM",
      location: "Science Building, Room 301",
      availableSeats: 8,
      totalSeats: 25,
      description:
        "Introduction to differential and integral calculus of functions of one variable.",
      year: 4,
      semester: 2,
      prerequisites: "MATH101",
    },
    {
      id: 24,
      code: "GE-US",
      title: "Understanding the Self",
      department: "English",
      credits: 3,
      instructor: "Prof. Jane Austen",
      schedule: "Mon, Wed 1:00 PM - 2:30 PM",
      location: "Humanities Building, Room 210",
      availableSeats: 20,
      totalSeats: 30,
      description:
        "Development of writing skills through the study and practice of academic writing.",
      year: 4,
      semester: 2,
      prerequisites: "ENG101",
    },
  ];

  // Filter courses based on search term, year, and semester
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear =
      selectedYear === "all" || course.year.toString() === selectedYear;
    const matchesSemester =
      selectedSemester === "all" ||
      course.semester.toString() === selectedSemester;

    return matchesSearch && matchesYear && matchesSemester;
  });

  // Get unique years and semesters for filter dropdowns
  const years = [
    "all",
    ...new Set(courses.map((course) => course.year.toString())),
  ];
  const semesters = [
    "all",
    ...new Set(courses.map((course) => course.semester.toString())),
  ];

  // Group courses by year and semester
  const groupedCourses = filteredCourses.reduce((acc, course) => {
    const key = `${course.year}-${course.semester}`;
    if (!acc[key]) {
      acc[key] = {
        year: course.year,
        semester: course.semester.toString(),
        title: `Year ${course.year} - Semester ${course.semester}`,
        courses: [],
      };
    }
    acc[key].courses.push(course);
    return acc;
  }, {} as Record<string, { year: number; semester: string; title: string; courses: typeof courses }>);

  // Sort by year and semester
  const sortedGroups = Object.values(groupedCourses).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return Number(a.semester) - Number(b.semester);
  });

  const handleEnrollment = (course: any) => {
    console.log(`Enrolling in course: ${course.code} - ${course.title}`);
    setEnrollmentSuccess(true);
    setTimeout(() => {
      setEnrollmentSuccess(false);
    }, 3000);
  };

  const toggleCourseSelection = (groupKey: string, courseId: number) => {
    setSelectedCourses((prev) => {
      const currentSelections = prev[groupKey] || [];
      if (currentSelections.includes(courseId)) {
        return {
          ...prev,
          [groupKey]: currentSelections.filter((id) => id !== courseId),
        };
      } else {
        return {
          ...prev,
          [groupKey]: [...currentSelections, courseId],
        };
      }
    });
  };

  const toggleSelectAll = (groupKey: string, courseIds: number[]) => {
    setSelectedCourses((prev) => {
      const currentSelections = prev[groupKey] || [];
      // If all are selected, unselect all. Otherwise, select all.
      if (currentSelections.length === courseIds.length) {
        return {
          ...prev,
          [groupKey]: [],
        };
      } else {
        return {
          ...prev,
          [groupKey]: [...courseIds],
        };
      }
    });
  };

  const handleBulkEnrollment = (groupKey: string) => {
    const coursesToEnroll = (selectedCourses[groupKey] || [])
      .map((id) =>
        groupedCourses[groupKey].courses.find((course) => course.id === id)
      )
      .filter(Boolean);

    console.log(
      `Enrolling in ${coursesToEnroll.length} courses:`,
      coursesToEnroll
    );
    setEnrollmentSuccess(true);

    // Reset selection for this group after enrollment
    setSelectedCourses((prev) => ({
      ...prev,
      [groupKey]: [],
    }));

    setTimeout(() => {
      setEnrollmentSuccess(false);
    }, 3000);
  };

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
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year === "all" ? "All Years" : `Year ${year}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester === "all"
                    ? "All Semesters"
                    : `Semester ${semester}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {enrollmentSuccess && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">
            Your enrollment request has been submitted.
          </span>
        </div>
      )}

      <div className="space-y-8">
        {sortedGroups.map((group) => {
          const groupKey = `${group.year}-${group.semester}`;
          const currentPage = paginationState[groupKey] || 1;
          const totalPages = Math.ceil(group.courses.length / coursesPerPage);

          // Get paginated courses for this group
          const startIndex = (currentPage - 1) * coursesPerPage;
          const paginatedCourses = group.courses.slice(
            startIndex,
            startIndex + coursesPerPage
          );

          return (
            <div key={groupKey} className="rounded-md border">
              <div className="bg-blue-50 p-4 border-b">
                <h3 className="text-lg font-semibold text-blue-800">
                  {group.title}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left font-medium p-3 w-10">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded cursor-pointer border-gray-300"
                            checked={
                              (selectedCourses[groupKey] || []).length ===
                                group.courses.length && group.courses.length > 0
                            }
                            onChange={() =>
                              toggleSelectAll(
                                groupKey,
                                paginatedCourses.map((c) => c.id)
                              )
                            }
                          />
                        </div>
                      </th>
                      <th className="text-left font-medium p-3">Course Code</th>
                      <th className="text-left font-medium p-3">
                        Course Description
                      </th>
                      <th className="text-left font-medium p-3">Units</th>
                      <th className="text-left font-medium p-3">
                        Prerequisites
                      </th>
                      <th className="text-right font-medium p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCourses.map((course) => (
                      <tr key={course.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            className="rounded cursor-pointer border-gray-300"
                            checked={(selectedCourses[groupKey] || []).includes(
                              course.id
                            )}
                            onChange={() =>
                              toggleCourseSelection(groupKey, course.id)
                            }
                          />
                        </td>
                        <td className="p-3 font-medium">{course.code}</td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {course.instructor} • {course.schedule}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">{course.credits}</td>
                        <td className="p-3">{course.prerequisites}</td>
                        <td className="p-3 text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>
                                  {course.code}: {course.title}
                                </DialogTitle>
                                <DialogDescription>
                                  Course details and enrollment information
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <h4 className="font-medium">Description</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {course.description}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium">Department</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {course.department}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Credits</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {course.credits}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Instructor</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {course.instructor}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Location</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {course.location}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium">Schedule</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {course.schedule}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium">
                                    Available Seats
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {course.availableSeats} out of{" "}
                                    {course.totalSeats}
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Confirm Enrollment Button */}
              {(selectedCourses[groupKey] || []).length > 0 && (
                <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">
                      {(selectedCourses[groupKey] || []).length} course(s)
                      selected
                    </span>
                  </div>
                  <Button
                    onClick={() => handleBulkEnrollment(groupKey)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Confirm Enrollment
                  </Button>
                </div>
              )}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPaginationState({
                        ...paginationState,
                        [groupKey]: Math.max(1, currentPage - 1),
                      })
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="mx-4 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPaginationState({
                        ...paginationState,
                        [groupKey]: Math.min(totalPages, currentPage + 1),
                      })
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No courses found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
