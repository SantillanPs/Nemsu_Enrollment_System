"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { hasRoleAccess } from "@/lib/utils/role-check";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  CalendarDays,
  BookOpen,
  Users,
  ClipboardList,
  Plus,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, InfoIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define types
interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  capacity: number;
  year: number;
  semester: string;
  status: string;
  facultyId: string | null;
  faculty?: any;
  sections?: any[];
  enrollments?: any[];
  prerequisites?: any[];
  createdAt?: string;
  updatedAt?: string;
}

// Course Selection Dialog Component
interface CourseSelectionDialogProps {
  courses: Course[];
  selectedCourseIds: string[];
  onSelectionChange: (courseIds: string[]) => void;
}

function CourseSelectionDialog({
  courses,
  selectedCourseIds,
  onSelectionChange,
}: CourseSelectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");
  const [dialogSelectedIds, setDialogSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter courses based on search query
  const filteredDialogCourses = useMemo(() => {
    if (!dialogSearchQuery.trim()) {
      return courses;
    } else {
      const query = dialogSearchQuery.toLowerCase().trim();
      return courses.filter(
        (course) =>
          course.code.toLowerCase().includes(query) ||
          course.name.toLowerCase().includes(query)
      );
    }
  }, [dialogSearchQuery, courses]);

  // Initialize dialog selection state when opened
  useEffect(() => {
    if (open) {
      setDialogSelectedIds(selectedCourseIds);
    }
  }, [open, selectedCourseIds]);

  // Handle selection changes
  const handleToggleCourse = (courseId: string) => {
    setDialogSelectedIds((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    setDialogSelectedIds(filteredDialogCourses.map((c) => c.id));
  };

  // Handle clear all
  const handleClearAll = () => {
    setDialogSelectedIds([]);
  };

  // Save selection and close dialog
  const handleSave = () => {
    onSelectionChange(dialogSelectedIds);
    setOpen(false);
  };

  // Group courses by year and semester for better organization
  const groupedCourses = useMemo(() => {
    const groups: Record<string, Course[]> = {};

    filteredDialogCourses.forEach((course) => {
      const key = `Year ${course.year} - ${course.semester}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(course);
    });

    return groups;
  }, [filteredDialogCourses]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal h-10 px-3 py-2 bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-300"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            {selectedCourseIds.length === 0 ? (
              <span className="text-muted-foreground">Select courses...</span>
            ) : (
              <span className="text-gray-700">
                {selectedCourseIds.length} course
                {selectedCourseIds.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </span>
          <Plus className="h-4 w-4 text-blue-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <DialogTitle className="text-xl font-semibold text-white mb-1">
            Select Courses
          </DialogTitle>
          <DialogDescription className="text-blue-100 opacity-90">
            Choose the courses you want to include in your schedule
          </DialogDescription>
        </div>

        <div className="p-6 space-y-5 overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by course code or name..."
                className="pl-10 py-2 text-sm bg-gray-50 border-gray-200 rounded-md w-full focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={dialogSearchQuery}
                onChange={(e) => setDialogSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs px-2 py-1 h-8",
                  viewMode === "grid"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600"
                )}
                onClick={() => setViewMode("grid")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                Grid
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs px-2 py-1 h-8",
                  viewMode === "list"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600"
                )}
                onClick={() => setViewMode("list")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <line x1="8" x2="21" y1="6" y2="6" />
                  <line x1="8" x2="21" y1="12" y2="12" />
                  <line x1="8" x2="21" y1="18" y2="18" />
                  <line x1="3" x2="3.01" y1="6" y2="6" />
                  <line x1="3" x2="3.01" y1="12" y2="12" />
                  <line x1="3" x2="3.01" y1="18" y2="18" />
                </svg>
                List
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={handleClearAll}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
            <div className="max-h-[50vh] overflow-y-auto">
              {Object.keys(groupedCourses).length > 0 ? (
                Object.entries(groupedCourses).map(([group, groupCourses]) => (
                  <div key={group} className="border-b last:border-b-0">
                    <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700 sticky top-0 z-10">
                      {group}
                    </div>
                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
                        {groupCourses.map((course) => (
                          <div
                            key={course.id}
                            className={cn(
                              "flex flex-col rounded-md border p-3 cursor-pointer transition-all",
                              dialogSelectedIds.includes(course.id)
                                ? "bg-blue-50 border-blue-300 shadow-sm"
                                : "hover:border-blue-200 hover:bg-gray-50"
                            )}
                            onClick={() => handleToggleCourse(course.id)}
                          >
                            <div className="flex items-start mb-2">
                              <Checkbox
                                id={`dialog-course-${course.id}`}
                                checked={dialogSelectedIds.includes(course.id)}
                                onCheckedChange={() =>
                                  handleToggleCourse(course.id)
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1 mr-3"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900">
                                  {course.code}
                                </div>
                                <div className="text-sm text-gray-700 line-clamp-2 mt-0.5">
                                  {course.name}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-2 text-xs text-gray-500">
                              <span>
                                {course.credits}{" "}
                                {course.credits === 1 ? "unit" : "units"}
                              </span>
                              {course.capacity && (
                                <span>Capacity: {course.capacity}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {groupCourses.map((course) => (
                          <div
                            key={course.id}
                            className={cn(
                              "flex items-center p-3 cursor-pointer transition-colors",
                              dialogSelectedIds.includes(course.id)
                                ? "bg-blue-50 hover:bg-blue-100"
                                : "hover:bg-gray-50"
                            )}
                            onClick={() => handleToggleCourse(course.id)}
                          >
                            <Checkbox
                              id={`dialog-course-${course.id}`}
                              checked={dialogSelectedIds.includes(course.id)}
                              onCheckedChange={() =>
                                handleToggleCourse(course.id)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="mr-3"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {course.code}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {course.name}
                              </div>
                            </div>
                            <Badge variant="outline" className="ml-2 bg-white">
                              {course.credits}{" "}
                              {course.credits === 1 ? "unit" : "units"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium">
                    No courses match your search
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">
                {dialogSelectedIds.length}
              </span>{" "}
              of {filteredDialogCourses.length} courses selected
            </div>
            {dialogSelectedIds.length > 0 && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {dialogSelectedIds.length} course
                {dialogSelectedIds.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        </div>

        <div className="border-t p-4 flex justify-end gap-2 bg-gray-50">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={dialogSelectedIds.length === 0}
          >
            {dialogSelectedIds.length > 0 ? (
              <>Save Selection ({dialogSelectedIds.length})</>
            ) : (
              "Select Courses"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  sectionNumber: number;
}

// Define form schema
const formSchema = z.object({
  courseIds: z.array(z.string()).min(1, "Select at least one course"),
  days: z.array(z.string()).min(1, "Select at least one day"),
  hoursPerClass: z.coerce.number().min(1).max(5),
});

export default function CourseSchedulingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<TimeSlot[]>([]);
  const [hasFinishedPeriods, setHasFinishedPeriods] = useState(false);
  const [finishedPeriods, setFinishedPeriods] = useState<any[]>([]);
  const [checkingPeriods, setCheckingPeriods] = useState(true);

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseIds: [],
      days: [],
      hoursPerClass: 1.5,
    },
  });

  // Available days options
  const daysOptions = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
  ];

  // Check if there are finished enrollment periods
  const checkFinishedEnrollmentPeriods = async () => {
    try {
      setCheckingPeriods(true);
      const response = await fetch("/api/enrollment-periods/finished");
      if (!response.ok) {
        throw new Error("Failed to check enrollment periods");
      }
      const data = await response.json();
      setHasFinishedPeriods(data.hasFinishedPeriods);
      setFinishedPeriods(data.finishedPeriods || []);
    } catch (error) {
      console.error("Error checking enrollment periods:", error);
      toast({
        title: "Error",
        description: "Failed to check enrollment periods status.",
        variant: "destructive",
      });
      setHasFinishedPeriods(false);
    } finally {
      setCheckingPeriods(false);
    }
  };

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch courses with their sections
        const response = await fetch("/api/courses?includeSections=true");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();

        // Check if data is an array (direct courses array) or has a courses property
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data.courses && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          console.error("Unexpected API response format:", data);
          setCourses([]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    checkFinishedEnrollmentPeriods();
  }, [toast]);

  // Redirect if not an admin
  useEffect(() => {
    if (
      status === "authenticated" &&
      !hasRoleAccess(session?.user?.role || "", "ADMIN")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  // Filter active courses
  const activeCourses = useMemo(() => {
    return courses ? courses.filter((course) => course.status === "OPEN") : [];
  }, [courses]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!hasFinishedPeriods) {
      toast({
        title: "Not Available",
        description:
          "Course scheduling can only be used after an enrollment period has finished.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      // Generate schedule
      const schedule = generateSchedule(
        values.courseIds,
        values.days,
        values.hoursPerClass
      );
      setGeneratedSchedule(schedule);

      toast({
        title: "Schedule Generated",
        description: `Successfully created schedule for ${values.courseIds.length} courses.`,
      });
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to generate schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Save generated schedule to database
  const saveSchedule = async () => {
    if (generatedSchedule.length === 0) {
      toast({
        title: "No Schedule",
        description: "Please generate a schedule first.",
        variant: "destructive",
      });
      return;
    }

    if (!hasFinishedPeriods) {
      toast({
        title: "Not Available",
        description:
          "Course scheduling can only be used after an enrollment period has finished.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Format schedule for API
      const scheduleData = generatedSchedule.map((slot) => ({
        courseId: slot.courseId,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        sectionNumber: slot.sectionNumber,
      }));

      const response = await fetch("/api/course-scheduling", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schedules: scheduleData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save schedule");
      }

      const result = await response.json();

      // Count updated vs created sections
      const updatedCount = result.results.filter((r: any) => r.updated).length;
      const createdCount = result.results.length - updatedCount;

      toast({
        title: "Schedule Saved",
        description: `Successfully saved schedules: ${updatedCount} sections updated, ${createdCount} sections created.`,
      });

      // Refresh courses after saving
      const coursesResponse = await fetch("/api/courses?includeSections=true");
      if (coursesResponse.ok) {
        const data = await coursesResponse.json();
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data.courses && Array.isArray(data.courses)) {
          setCourses(data.courses);
        }
      }

      // Clear the generated schedule after saving
      setGeneratedSchedule([]);
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Generate non-conflicting schedule
  const generateSchedule = (
    courseIds: string[],
    days: string[],
    hoursPerClass: number
  ): TimeSlot[] => {
    const schedule: TimeSlot[] = [];
    const selectedCourses = courses.filter((course) =>
      courseIds.includes(course.id)
    );

    // Start times (8:00 AM to 5:00 PM in 30-minute increments)
    const startTimes = [
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
    ];

    // Calculate how many 30-minute slots we need based on hours per class
    const slotsNeeded = Math.ceil(hoursPerClass * 2);

    // Create a map to track time slots for each day
    const dayTimeSlots: Record<string, number[]> = {};

    // Initialize time slots for each day
    days.forEach((day) => {
      dayTimeSlots[day] = Array(startTimes.length).fill(0);
    });

    // Function to check if a time slot is available
    const isSlotAvailable = (
      day: string,
      startIndex: number,
      endIndex: number
    ): boolean => {
      // Check if any of the slots in the range are already occupied
      for (let i = startIndex; i <= endIndex; i++) {
        if (dayTimeSlots[day][i] === 1) {
          return false;
        }
      }
      return true;
    };

    // Function to mark a time slot as occupied
    const markSlotOccupied = (
      day: string,
      startIndex: number,
      endIndex: number
    ) => {
      for (let i = startIndex; i <= endIndex; i++) {
        dayTimeSlots[day][i] = 1;
      }
    };

    // Assign each course to days and times
    selectedCourses.forEach((course) => {
      // Check if the course has sections
      if (course.sections && course.sections.length > 0) {
        // For each existing section
        course.sections.forEach((_, index) => {
          // For each day
          days.forEach((day) => {
            // Try each possible starting time slot to find a suitable slot
            for (
              let startIndex = 0;
              startIndex <= startTimes.length - slotsNeeded;
              startIndex++
            ) {
              const endIndex = startIndex + slotsNeeded - 1;

              // Check if this slot range is available
              if (isSlotAvailable(day, startIndex, endIndex)) {
                // Mark these slots as occupied
                markSlotOccupied(day, startIndex, endIndex);

                const startTime = startTimes[startIndex];
                const endTime = startTimes[endIndex];

                // Calculate end time (add 30 minutes to the last slot)
                const endTimeParts = endTime.split(":");
                let endHour = parseInt(endTimeParts[0]);
                let endMinute = parseInt(endTimeParts[1]) + 30;

                if (endMinute >= 60) {
                  endHour += 1;
                  endMinute -= 60;
                }

                const formattedEndTime = `${endHour
                  .toString()
                  .padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;

                // Add to schedule
                schedule.push({
                  day: formatDayName(day),
                  startTime: formatTime(startTime),
                  endTime: formatTime(formattedEndTime),
                  courseId: course.id,
                  courseName: course.name,
                  courseCode: course.code,
                  sectionNumber: index + 1, // Use section index + 1 as section number
                });

                break; // Found a slot, move to next day
              }
            }

            // If no slot was assigned, we'll skip this day for this section
          });
        });
      } else {
        // If the course has no sections, create a schedule for the course itself
        days.forEach((day) => {
          // Try each possible starting time slot to find a suitable slot
          for (
            let startIndex = 0;
            startIndex <= startTimes.length - slotsNeeded;
            startIndex++
          ) {
            const endIndex = startIndex + slotsNeeded - 1;

            // Check if this slot range is available
            if (isSlotAvailable(day, startIndex, endIndex)) {
              // Mark these slots as occupied
              markSlotOccupied(day, startIndex, endIndex);

              const startTime = startTimes[startIndex];
              const endTime = startTimes[endIndex];

              // Calculate end time (add 30 minutes to the last slot)
              const endTimeParts = endTime.split(":");
              let endHour = parseInt(endTimeParts[0]);
              let endMinute = parseInt(endTimeParts[1]) + 30;

              if (endMinute >= 60) {
                endHour += 1;
                endMinute -= 60;
              }

              const formattedEndTime = `${endHour
                .toString()
                .padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;

              // Add to schedule
              schedule.push({
                day: formatDayName(day),
                startTime: formatTime(startTime),
                endTime: formatTime(formattedEndTime),
                courseId: course.id,
                courseName: course.name,
                courseCode: course.code,
                sectionNumber: 1, // Default section number
              });

              break; // Found a slot, move to next day
            }
          }

          // If no slot was assigned, we'll skip this day for this course
        });
      }
    });

    return schedule;
  };

  // Format time from 24h to 12h format
  const formatTime = (time: string): string => {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };

  // Format day name to be properly capitalized
  const formatDayName = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  if (status === "loading" || loading || checkingPeriods) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-full">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Course Scheduling
            </h1>
            <p className="text-muted-foreground">
              Create non-conflicting schedules for multiple courses
            </p>
          </div>
        </div>

        {hasFinishedPeriods && finishedPeriods.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-md border border-blue-100">
            <div className="flex items-center gap-1.5 text-sm font-medium text-blue-700">
              <InfoIcon className="h-4 w-4" />
              <span>
                Scheduling for: {finishedPeriods[0].name}
                {finishedPeriods[0].semester &&
                  ` (${finishedPeriods[0].semester})`}
              </span>
            </div>
          </div>
        )}
      </div>

      {!hasFinishedPeriods && (
        <Alert
          variant="destructive"
          className="border border-red-200 bg-red-50"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">
            Course Scheduling Not Available
          </AlertTitle>
          <AlertDescription className="text-sm">
            Course scheduling can only be used after an enrollment period has
            finished. Please wait for an enrollment period to complete before
            scheduling courses.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <CalendarDays className="h-5 w-5" />
              Schedule Settings
            </CardTitle>
            <CardDescription>
              Select courses and scheduling preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="courseIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        Select Courses
                      </FormLabel>
                      <div>
                        {activeCourses.length > 0 ? (
                          <>
                            <CourseSelectionDialog
                              courses={activeCourses}
                              selectedCourseIds={field.value}
                              onSelectionChange={field.onChange}
                            />
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                              <span>
                                Selected:{" "}
                                <span className="font-medium text-blue-600">
                                  {field.value.length}
                                </span>{" "}
                                of {activeCourses.length} courses
                              </span>
                              {field.value.length > 0 && (
                                <span className="text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {field.value.length}{" "}
                                  {field.value.length === 1
                                    ? "course"
                                    : "courses"}{" "}
                                  selected
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-md">
                            <BookOpen className="h-10 w-10 text-gray-300 mb-2" />
                            <p className="text-gray-500 font-medium">
                              No active courses available
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Courses will appear here when they are active
                            </p>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-4" />

                <FormField
                  control={form.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        Select Days
                      </FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {daysOptions.map((day) => (
                          <div
                            key={day.id}
                            className={cn(
                              "flex flex-col items-center justify-center p-2 rounded-md border cursor-pointer transition-all",
                              field.value.includes(day.id)
                                ? "bg-blue-50 border-blue-200 shadow-sm"
                                : "bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/50"
                            )}
                            onClick={() => {
                              if (field.value.includes(day.id)) {
                                field.onChange(
                                  field.value.filter((d) => d !== day.id)
                                );
                              } else {
                                field.onChange([...field.value, day.id]);
                              }
                            }}
                          >
                            <span className="text-xs font-medium mb-1">
                              {day.label.substring(0, 3)}
                            </span>
                            <Checkbox
                              id={`day-${day.id}`}
                              checked={field.value.includes(day.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, day.id]);
                                } else {
                                  field.onChange(
                                    field.value.filter((d) => d !== day.id)
                                  );
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hoursPerClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Hours Per Class
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseFloat(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white border-gray-200">
                            <SelectValue placeholder="Select hours per class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="1.5">1.5 hours</SelectItem>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="2.5">2.5 hours</SelectItem>
                          <SelectItem value="3">3 hours</SelectItem>
                          <SelectItem value="3.5">3.5 hours</SelectItem>
                          <SelectItem value="4">4 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        Duration of each class session
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={generating || !hasFinishedPeriods}
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Schedule...
                    </>
                  ) : (
                    <>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Generate Schedule
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Users className="h-5 w-5" />
                  Generated Schedule
                </CardTitle>
              </div>
              {generatedSchedule.length > 0 && (
                <Button
                  onClick={saveSchedule}
                  variant="outline"
                  size="sm"
                  className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                  disabled={saving || !hasFinishedPeriods}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save Schedule</>
                  )}
                </Button>
              )}
            </div>
            <CardDescription>
              Non-conflicting schedule for selected courses
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {generatedSchedule.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[100px] font-semibold">
                        Day
                      </TableHead>
                      <TableHead className="w-[180px] font-semibold">
                        Time
                      </TableHead>
                      <TableHead className="font-semibold">Course</TableHead>
                      <TableHead className="w-[80px] text-center font-semibold">
                        Section
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedSchedule.map((slot, index) => {
                      // Generate a consistent color based on the course code
                      const courseHash = slot.courseCode
                        .split("")
                        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
                      const colorIndex = (courseHash % 5) + 1; // 5 different colors

                      return (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {slot.day}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <span>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <div
                                className={`w-1 self-stretch rounded-full bg-[hsl(var(--chart-${colorIndex}))]`}
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {slot.courseCode}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-1">
                                  {slot.courseName}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                              {String.fromCharCode(64 + slot.sectionNumber)}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No Schedule Generated
                </h3>
                <p className="text-gray-500 mt-2 max-w-md">
                  Select courses, days, and hours per class, then click
                  "Generate Schedule" to create a non-conflicting schedule.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 border-blue-200 text-blue-600 hover:bg-blue-50"
                  disabled={!hasFinishedPeriods}
                  onClick={() => {
                    // Scroll to the form
                    document
                      .querySelector("form")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Configure Schedule
                </Button>
              </div>
            )}
          </CardContent>
          {generatedSchedule.length > 0 && (
            <CardFooter className="bg-gray-50 border-t px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">
                    {generatedSchedule.length}
                  </span>{" "}
                  time slots generated
                </div>
                <Button
                  onClick={saveSchedule}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={saving || !hasFinishedPeriods}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save Schedule to Database</>
                  )}
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
