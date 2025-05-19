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
import { Label } from "@/components/ui/label";
import { Loader2, Calendar } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, InfoIcon } from "lucide-react";

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
        console.log("API Response:", data);

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

  // Debug courses data
  useEffect(() => {
    if (courses && courses.length > 0) {
      console.log(
        `Found ${courses.length} courses, ${activeCourses.length} active`
      );
      // Log a sample course to check its structure
      console.log("Sample course:", courses[0]);
    } else {
      console.log("No courses available or courses array is empty");
    }
  }, [courses, activeCourses]);

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
        course.sections.forEach((section, index) => {
          // For each day
          days.forEach((day) => {
            // Find a suitable time slot
            let assigned = false;

            // Try each possible starting time slot
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

                assigned = true;
                break; // Found a slot, move to next day
              }
            }

            if (!assigned) {
              console.warn(
                `Could not find available time slot for ${course.code} Section ${section.sectionCode} on ${day}`
              );
            }
          });
        });
      } else {
        // If the course has no sections, create a schedule for the course itself
        days.forEach((day) => {
          // Find a suitable time slot
          let assigned = false;

          // Try each possible starting time slot
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

              assigned = true;
              break; // Found a slot, move to next day
            }
          }

          if (!assigned) {
            console.warn(
              `Could not find available time slot for ${course.code} on ${day}`
            );
          }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Course Scheduling
          </h1>
          <p className="text-muted-foreground">
            Create non-conflicting schedules for multiple courses
          </p>
        </div>
      </div>

      {!hasFinishedPeriods && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Course Scheduling Not Available</AlertTitle>
          <AlertDescription>
            Course scheduling can only be used after an enrollment period has
            finished. Please wait for an enrollment period to complete before
            scheduling courses.
          </AlertDescription>
        </Alert>
      )}

      {hasFinishedPeriods && finishedPeriods.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">
            Scheduling Available
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            You can now schedule courses for the semester following the
            completed enrollment period: {finishedPeriods[0].name}
            {finishedPeriods[0].semester && ` (${finishedPeriods[0].semester})`}
            .
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Schedule Settings</CardTitle>
            <CardDescription>
              Select courses and scheduling preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      <FormLabel>Select Courses</FormLabel>
                      <div className="space-y-3">
                        {activeCourses.length > 0 ? (
                          <>
                            <div className="flex justify-between mb-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  field.onChange(activeCourses.map((c) => c.id))
                                }
                              >
                                Select All
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.onChange([])}
                              >
                                Clear All
                              </Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                              {activeCourses.map((course) => (
                                <div
                                  key={course.id}
                                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md border border-gray-100 cursor-pointer"
                                  onClick={() => {
                                    if (field.value.includes(course.id)) {
                                      field.onChange(
                                        field.value.filter(
                                          (id) => id !== course.id
                                        )
                                      );
                                    } else {
                                      field.onChange([
                                        ...field.value,
                                        course.id,
                                      ]);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    id={`course-${course.id}`}
                                    checked={field.value.includes(course.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([
                                          ...field.value,
                                          course.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          field.value.filter(
                                            (id) => id !== course.id
                                          )
                                        );
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {course.code}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {course.name}
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {course.credits} credits
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Selected: {field.value.length} of{" "}
                              {activeCourses.length} courses
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground border rounded-md">
                            No active courses available
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Days</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {daysOptions.map((day) => (
                          <div
                            key={day.id}
                            className="flex items-center space-x-2"
                          >
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
                            />
                            <Label
                              htmlFor={`day-${day.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {day.label}
                            </Label>
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
                      <FormLabel>Hours Per Class</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseFloat(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                      <FormDescription>
                        Duration of each class session
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={generating || !hasFinishedPeriods}
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>Generate Schedule</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Generated Schedule</CardTitle>
            <CardDescription>
              Non-conflicting schedule for selected courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedSchedule.length > 0 ? (
              <>
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={saveSchedule}
                    variant="outline"
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Section</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedSchedule.map((slot, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {slot.day}
                        </TableCell>
                        <TableCell>
                          {slot.startTime} - {slot.endTime}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{slot.courseCode}</div>
                          <div className="text-sm text-muted-foreground">
                            {slot.courseName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {String.fromCharCode(64 + slot.sectionNumber)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Schedule Generated</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Select courses, days, and hours per class, then click
                  "Generate Schedule" to create a non-conflicting schedule.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
