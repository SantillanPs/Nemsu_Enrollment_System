"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Loading from "./loading";

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  capacity: number;
  semester: string;
  year: number;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  faculty: {
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  } | null;
  prerequisites: {
    id: string;
    code: string;
    name: string;
  }[];
}

export default function AvailableCourses() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCourses, setEnrollingCourses] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<
    Record<string, string[]>
  >({});
  const [completedCourseIds, setCompletedCourseIds] = useState<string[]>([]);
  const [enrolledCourseMap, setEnrolledCourseMap] = useState<
    Record<string, string>
  >({});
  const [enrollmentStatus, setEnrollmentStatus] = useState<{
    isEnrollmentOpen: boolean;
    currentPeriod: any;
    nextPeriod: any;
  }>({
    isEnrollmentOpen: false,
    currentPeriod: null,
    nextPeriod: null,
  });

  const [currentSemester, setCurrentSemester] = useState<{
    semester: string;
    enrollmentPeriodId: string | null;
    isActive: boolean;
  }>({
    semester: "NONE",
    enrollmentPeriodId: null,
    isActive: false,
  });
  const [verificationStatus, setVerificationStatus] = useState<{
    isVerified: boolean;
    pendingDocuments: string[];
    hasAllDocuments: boolean;
    profileMissing?: boolean;
  }>({
    isVerified: false,
    pendingDocuments: [],
    hasAllDocuments: false,
    profileMissing: false,
  });
  const [unitsInfo, setUnitsInfo] = useState<{
    currentEnrolledUnits: number;
    maxUnits: number;
  }>({
    currentEnrolledUnits: 0,
    maxUnits: 18,
  });
  const { toast } = useToast();

  // Check if the user is a super admin
  const isSuperAdmin = session?.user?.role?.toLowerCase() === "super_admin";

  useEffect(() => {
    fetchData();
    fetchEnrollmentStatus();
    fetchVerificationStatus();
    fetchUnitsInfo();
    fetchCurrentSemester();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      console.log("Fetching student verification status...");
      const response = await fetch("/api/student/verification-status");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", response.status, errorData);
        throw new Error(
          errorData.error ||
            `Failed to fetch verification status (${response.status})`
        );
      }

      const data = await response.json();
      console.log("Verification status data:", data);
      setVerificationStatus(data);
    } catch (error) {
      console.error("Error fetching verification status:", error);
      toast({
        title: "Warning",
        description:
          "Unable to verify your account status. Some features may be limited.",
        variant: "destructive",
      });
      // Default to not verified if there's an error
      setVerificationStatus({
        isVerified: false,
        pendingDocuments: [],
        hasAllDocuments: false,
        profileMissing: true,
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCourses(),
        fetchCompletedCourses(),
        fetchEnrolledCourseIds(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh enrollment data without full page reload
  const refreshEnrollmentData = async () => {
    try {
      await fetchEnrolledCourseIds();
    } catch (error) {
      console.error("Error refreshing enrollment data:", error);
    }
  };

  const fetchEnrolledCourseIds = async () => {
    try {
      const response = await fetch("/api/student/enrolled-course-ids");
      if (!response.ok) {
        console.error("Failed to fetch enrolled course IDs");
        return;
      }
      const data = await response.json();
      setEnrolledCourseMap(data);
    } catch (error) {
      console.error("Error fetching enrolled course IDs:", error);
      // Not showing toast as this is not critical
    }
  };

  const fetchCourses = async () => {
    try {
      console.log("Fetching courses...");
      const response = await fetch("/api/courses");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from /api/courses:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to fetch courses");
        } catch (parseError) {
          throw new Error(
            `Failed to fetch courses: ${response.status} ${response.statusText}`
          );
        }
      }

      const data = await response.json();
      console.log("Courses API response received");

      if (!Array.isArray(data)) {
        console.error("Invalid data format:", data);
        throw new Error("Invalid courses data received");
      }

      // Debug courses data
      console.log(`Received ${data.length} courses`);
      if (data.length === 0) {
        console.log("No courses returned from API");
      } else {
        console.log("Sample course:", data[0]);
        console.log(
          "Courses with prerequisites:",
          data.filter(
            (course) => course.prerequisites && course.prerequisites.length > 0
          )
        );
      }

      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch courses. Please try again.",
        variant: "destructive",
      });
      setCourses([]); // Ensure courses is always an array
    }
  };

  const fetchCompletedCourses = async () => {
    try {
      const response = await fetch("/api/student/courses?status=COMPLETED");
      if (!response.ok) {
        return; // Silently fail, not critical
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        // Extract course IDs from completed enrollments
        const completedIds = data
          .filter((enrollment) => enrollment.status === "COMPLETED")
          .map((enrollment) => enrollment.course.id);
        setCompletedCourseIds(completedIds);
      }
    } catch (error) {
      console.error("Error fetching completed courses:", error);
      // Not showing toast as this is not critical
    }
  };

  const fetchEnrollmentStatus = async () => {
    try {
      const response = await fetch("/api/enrollment-status");
      if (!response.ok) {
        throw new Error("Failed to fetch enrollment status");
      }
      const data = await response.json();
      setEnrollmentStatus(data);
    } catch (error) {
      console.error("Error fetching enrollment status:", error);
      // Default to open enrollment if there's an error
      setEnrollmentStatus({
        isEnrollmentOpen: true,
        currentPeriod: null,
        nextPeriod: null,
      });
    }
  };

  const fetchUnitsInfo = async () => {
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile information");
      }
      const data = await response.json();

      if (data.academic) {
        setUnitsInfo({
          currentEnrolledUnits: data.academic.currentEnrolledUnits || 0,
          maxUnits: data.academic.maxUnits || 18,
        });
      }
    } catch (error) {
      console.error("Error fetching units information:", error);
      // Keep default values if there's an error
    }
  };

  const fetchCurrentSemester = async () => {
    try {
      const response = await fetch("/api/current-semester");
      if (!response.ok) {
        throw new Error("Failed to fetch current semester");
      }
      const data = await response.json();
      setCurrentSemester(data);
    } catch (error) {
      console.error("Error fetching current semester:", error);
      // Keep default values if there's an error
    }
  };

  // Filter courses based on search term, year, and semester
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.faculty && course.faculty.profile
        ? `${course.faculty.profile.firstName || ""} ${
            course.faculty.profile.lastName || ""
          }`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : false);

    const matchesYear =
      selectedYear === "all" || course.year.toString() === selectedYear;
    const matchesSemester =
      selectedSemester === "all" || course.semester === selectedSemester;

    return matchesSearch && matchesYear && matchesSemester;
  });

  // Get unique years and semesters for filter dropdowns
  const years = ["all", "1", "2", "3", "4"];
  const semesters = ["all", "FIRST", "SECOND", "SUMMER"];

  // Group courses by year and semester
  const groupedCourses = filteredCourses.reduce((acc, course) => {
    const year = course.year ?? 0;
    const key = `Year ${year} - ${course.semester}`;
    if (!acc[key]) {
      acc[key] = {
        year: year,
        semester: course.semester,
        title: key,
        courses: [],
      };
    }
    acc[key].courses.push(course);
    return acc;
  }, {} as Record<string, { year: number; semester: string; title: string; courses: Course[] }>);

  // Sort by year and semester
  const sortedGroups = Object.values(groupedCourses).sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    const semesterOrder = {
      FIRST: 1,
      SECOND: 2,
      SUMMER: 3,
    };
    return (
      semesterOrder[a.semester as keyof typeof semesterOrder] -
      semesterOrder[b.semester as keyof typeof semesterOrder]
    );
  });

  const handleEnrollment = async (courseId: string) => {
    // Check if already enrolled
    if (enrolledCourseMap[courseId]) {
      toast({
        title: "Already Enrolled",
        description: `You are already enrolled in this course with status: ${enrolledCourseMap[courseId]}`,
      });
      return;
    }

    try {
      setEnrollingCourses((prev) => [...prev, courseId]);

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll");
      }

      toast({
        title: "Success",
        description: "Enrollment request submitted successfully",
      });

      // Update enrolledCourseMap to reflect the new enrollment
      if (data.success && data.enrollments && data.enrollments.length > 0) {
        // Log the enrollment data to understand its structure
        console.log("Enrollment response:", data);

        // Update the enrolled course map
        setEnrolledCourseMap((prev) => ({
          ...prev,
          [courseId]: "PENDING", // Default to PENDING status for new enrollments
        }));

        // Refresh enrollment data and units info to ensure we have the latest status
        setTimeout(() => {
          refreshEnrollmentData();
          fetchUnitsInfo();
        }, 500);
      }
    } catch (error) {
      console.error("Error enrolling:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrollingCourses((prev) => prev.filter((id) => id !== courseId));
    }
  };

  const handleBulkEnrollment = async (groupKey: string) => {
    // Filter out already enrolled courses
    const coursesToEnroll = (selectedCourses[groupKey] || []).filter(
      (courseId) => !enrolledCourseMap[courseId]
    );

    if (coursesToEnroll.length === 0) {
      toast({
        title: "No courses selected",
        description:
          "Please select at least one course to enroll or the selected courses are already enrolled.",
      });
      return;
    }

    try {
      setEnrollingCourses(coursesToEnroll);

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseIds: coursesToEnroll }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll in courses");
      }

      // Show success/error message
      if (data.success) {
        toast({
          title: "Enrollment Successful",
          description:
            data.message ||
            `Successfully enrolled in ${data.enrollments.length} courses.`,
        });

        // If there were partial errors, show them too
        if (data.errors && data.errors.length > 0) {
          toast({
            title: "Some enrollments failed",
            description: `${data.errors.length} course enrollments failed. Check course prerequisites.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Enrollment Failed",
          description: data.message || "Failed to enroll in courses.",
          variant: "destructive",
        });
      }

      // Clear selections for this group
      setSelectedCourses((prev) => ({
        ...prev,
        [groupKey]: [],
      }));

      // Update enrolledCourseMap to reflect the new enrollments
      if (data.success && data.enrollments && data.enrollments.length > 0) {
        // Log the enrollment data to understand its structure
        console.log("Bulk enrollment response:", data);

        // Create a map of courseId -> PENDING for all successfully enrolled courses
        const newEnrollments = coursesToEnroll.reduce((acc, courseId) => {
          acc[courseId] = "PENDING";
          return acc;
        }, {} as Record<string, string>);

        setEnrolledCourseMap((prev) => ({
          ...prev,
          ...newEnrollments,
        }));

        // Refresh enrollment data and units info to ensure we have the latest status
        setTimeout(() => {
          refreshEnrollmentData();
          fetchUnitsInfo();
        }, 500);
      }
    } catch (error) {
      console.error("Error in bulk enrollment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to enroll in courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrollingCourses([]);
    }
  };

  const handleEnrollAll = async () => {
    // Get all available course IDs that are not already enrolled
    const allCourseIds = courses
      .map((course) => course.id)
      .filter((courseId) => !enrolledCourseMap[courseId]);

    if (allCourseIds.length === 0) {
      toast({
        title: "No courses available",
        description:
          "There are no available courses to enroll in or you're already enrolled in all available courses.",
      });
      return;
    }

    try {
      setEnrollingCourses(allCourseIds);

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseIds: allCourseIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll in all courses");
      }

      // Show success/error message
      if (data.success) {
        toast({
          title: "Bulk Enrollment Successful",
          description:
            data.message ||
            `Successfully enrolled in ${data.enrollments.length} courses.`,
        });

        // If there were partial errors, show them too
        if (data.errors && data.errors.length > 0) {
          toast({
            title: "Some enrollments failed",
            description: `${data.errors.length} course enrollments failed. Check course prerequisites.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Enrollment Failed",
          description: data.message || "Failed to enroll in courses.",
          variant: "destructive",
        });
      }

      // Clear all selections
      setSelectedCourses({});

      // Update enrolledCourseMap to reflect the new enrollments
      if (data.success && data.enrollments && data.enrollments.length > 0) {
        // Log the enrollment data to understand its structure
        console.log("Enroll all response:", data);

        // Create a map of courseId -> PENDING for all successfully enrolled courses
        const newEnrollments = allCourseIds.reduce((acc, courseId) => {
          acc[courseId] = "PENDING";
          return acc;
        }, {} as Record<string, string>);

        setEnrolledCourseMap((prev) => ({
          ...prev,
          ...newEnrollments,
        }));

        // Refresh enrollment data and units info to ensure we have the latest status
        setTimeout(() => {
          refreshEnrollmentData();
          fetchUnitsInfo();
        }, 500);
      }
    } catch (error) {
      console.error("Error in enrolling all courses:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to enroll in all courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrollingCourses([]);
    }
  };

  const toggleCourseSelection = (groupKey: string, courseId: string) => {
    // Don't allow selecting already enrolled courses
    if (enrolledCourseMap[courseId]) {
      toast({
        title: "Already Enrolled",
        description: `You are already enrolled in this course with status: ${enrolledCourseMap[courseId]}`,
      });
      return;
    }

    // Don't allow selecting new courses if units are maxed out
    if (unitsInfo.currentEnrolledUnits >= unitsInfo.maxUnits) {
      toast({
        title: "Units Maxed Out",
        description: `You have reached your maximum allowed units (${unitsInfo.maxUnits}). You cannot enroll in more courses.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedCourses((prev) => {
      const currentSelected = prev[groupKey] || [];
      const newSelected = currentSelected.includes(courseId)
        ? currentSelected.filter((id) => id !== courseId)
        : [...currentSelected, courseId];

      return {
        ...prev,
        [groupKey]: newSelected,
      };
    });
  };

  const toggleSelectAll = (groupKey: string, courseIds: string[]) => {
    // Filter out already enrolled courses
    const availableCourseIds = courseIds.filter((id) => !enrolledCourseMap[id]);

    // Don't allow selecting all courses if units are maxed out
    if (
      unitsInfo.currentEnrolledUnits >= unitsInfo.maxUnits &&
      availableCourseIds.length > 0
    ) {
      toast({
        title: "Units Maxed Out",
        description: `You have reached your maximum allowed units (${unitsInfo.maxUnits}). You cannot enroll in more courses.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedCourses((prev) => {
      const currentSelected = prev[groupKey] || [];
      const allSelected = availableCourseIds.every((id) =>
        currentSelected.includes(id)
      );

      return {
        ...prev,
        [groupKey]: allSelected ? [] : availableCourseIds,
      };
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Verification Status Alert - This is critical so we keep it prominent */}
      {!verificationStatus.isVerified && (
        <Alert className="bg-red-50 border-red-200 mb-6">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Account Not Verified</AlertTitle>
          <AlertDescription className="text-red-700">
            {verificationStatus.profileMissing ? (
              <>
                Your profile information is incomplete. Please visit your{" "}
                <a href="/student/profile" className="underline font-medium">
                  Profile page
                </a>{" "}
                to complete your profile setup before enrolling in courses.
              </>
            ) : !verificationStatus.hasAllDocuments ? (
              <>
                You need to upload all required documents before you can enroll
                in courses. Please visit your{" "}
                <a
                  href="/student/profile/documents"
                  className="underline font-medium"
                >
                  Documents page
                </a>{" "}
                to upload the missing documents.
              </>
            ) : verificationStatus.pendingDocuments.length > 0 ? (
              <>
                Your documents are still being reviewed by faculty. You will be
                able to enroll once all documents are verified. Check your{" "}
                <a
                  href="/student/profile/documents"
                  className="underline font-medium"
                >
                  Documents page
                </a>{" "}
                for status updates.
              </>
            ) : (
              <>
                Your account verification is pending. Please contact an
                administrator if you believe this is an error.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Indicators - More subtle and integrated */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Credit Units Indicator */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border rounded-full text-xs font-medium shadow-sm">
          <svg
            className="w-3.5 h-3.5 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span
            className={`${
              unitsInfo.currentEnrolledUnits / unitsInfo.maxUnits > 0.8
                ? "text-red-600 dark:text-red-400"
                : unitsInfo.currentEnrolledUnits / unitsInfo.maxUnits > 0.5
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            {unitsInfo.currentEnrolledUnits}/{unitsInfo.maxUnits} units
          </span>
          {unitsInfo.currentEnrolledUnits >= unitsInfo.maxUnits && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              MAX
            </span>
          )}
        </div>

        {/* Enrollment Status Indicator */}
        {enrollmentStatus.isEnrollmentOpen && enrollmentStatus.currentPeriod ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-green-100 dark:border-green-900/50 rounded-full text-xs font-medium text-green-700 dark:text-green-400 shadow-sm">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span>Enrollment Open</span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-slate-500 dark:text-slate-400">
              Until{" "}
              {new Date(
                enrollmentStatus.currentPeriod.endDate
              ).toLocaleDateString()}
            </span>
          </div>
        ) : enrollmentStatus.nextPeriod ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/50 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400 shadow-sm">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Coming Soon</span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-slate-500 dark:text-slate-400">
              Starts{" "}
              {new Date(
                enrollmentStatus.nextPeriod.startDate
              ).toLocaleDateString()}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/50 rounded-full text-xs font-medium text-red-700 dark:text-red-400 shadow-sm">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Enrollment Closed</span>
          </div>
        )}

        {/* Super Admin or Units Maxed Out Indicator */}
        {isSuperAdmin ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/50 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400 shadow-sm">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Super Admin View</span>
          </div>
        ) : unitsInfo.currentEnrolledUnits >= unitsInfo.maxUnits ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/50 rounded-full text-xs font-medium text-red-700 dark:text-red-400 shadow-sm">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Units Maxed Out</span>
          </div>
        ) : null}
      </div>

      <div className="bg-white dark:bg-slate-900 border rounded-lg shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            Available Courses
          </h1>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-md blur opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
              <Button
                onClick={handleEnrollAll}
                disabled={
                  !enrollmentStatus.isEnrollmentOpen ||
                  !verificationStatus.isVerified ||
                  enrollingCourses.length > 0 ||
                  courses.length === 0 ||
                  unitsInfo.currentEnrolledUnits >= unitsInfo.maxUnits
                }
                className="relative whitespace-nowrap bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
                size="sm"
              >
                {enrollingCourses.length > 0 ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    <span className="text-xs">Enrolling...</span>
                  </>
                ) : unitsInfo.currentEnrolledUnits >= unitsInfo.maxUnits ? (
                  <>
                    <svg
                      className="w-3.5 h-3.5 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs">Units Maxed</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs">Enroll All</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Input
              type="text"
              placeholder="Search by name, code, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px] h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year} className="text-sm">
                    {year === "all" ? "All Years" : `Year ${year}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedSemester}
              onValueChange={setSelectedSemester}
            >
              <SelectTrigger className="w-[140px] h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem
                    key={semester}
                    value={semester}
                    className="text-sm"
                  >
                    {semester === "all"
                      ? "All Semesters"
                      : semester === "FIRST"
                      ? "First Semester"
                      : semester === "SECOND"
                      ? "Second Semester"
                      : "Summer"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchTerm ||
              selectedYear !== "all" ||
              selectedSemester !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedYear("all");
                  setSelectedSemester("all");
                }}
                className="h-9 px-2 text-xs text-slate-500 hover:text-slate-700"
              >
                <svg
                  className="w-3.5 h-3.5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="mb-4 text-gray-400">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Courses Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            There are no courses available for enrollment at this time. This
            could be because:
          </p>
          <ul className="text-gray-500 dark:text-gray-400 list-disc list-inside text-left mt-2">
            <li>No courses match your current year and semester</li>
            <li>
              You've already enrolled in all available courses from previous
              years
            </li>
            <li>No enrollment period is currently active</li>
            <li>All available courses are already at capacity</li>
          </ul>
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            Try adjusting the filters above or check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedGroups.map((group) => {
            const groupKey = group.title;
            const selectedInGroup = selectedCourses[groupKey] || [];
            const allCoursesInGroup = group.courses.map((course) => course.id);
            const allSelected =
              allCoursesInGroup.length > 0 &&
              allCoursesInGroup.every((id) => selectedInGroup.includes(id));

            return (
              <div
                key={group.title}
                id={`course-group-${groupKey}`}
                className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm"
              >
                <div className="bg-slate-50 dark:bg-slate-800/30 border-b px-4 py-3">
                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-medium text-slate-800 dark:text-slate-200">
                            {group.title}
                          </h2>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {group.courses.length}{" "}
                            {group.courses.length === 1 ? "course" : "courses"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {group.semester === "First Semester" ||
                          group.semester === "FIRST"
                            ? "First Semester"
                            : group.semester === "Second Semester" ||
                              group.semester === "SECOND"
                            ? "Second Semester"
                            : group.semester === "Summer" ||
                              group.semester === "SUMMER"
                            ? "Summer Term"
                            : group.semester}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1">
                        <Checkbox
                          id={`select-all-${groupKey}`}
                          checked={allSelected}
                          onCheckedChange={() =>
                            toggleSelectAll(groupKey, allCoursesInGroup)
                          }
                          className="h-3.5 w-3.5"
                        />
                        <label
                          htmlFor={`select-all-${groupKey}`}
                          className="text-xs cursor-pointer"
                        >
                          Select All
                        </label>
                      </div>

                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border",
                          !enrollmentStatus.isEnrollmentOpen ||
                            !verificationStatus.isVerified ||
                            selectedInGroup.length === 0 ||
                            enrollingCourses.length > 0 ||
                            unitsInfo.currentEnrolledUnits >= unitsInfo.maxUnits
                            ? "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                            : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                        )}
                        onClick={() => {
                          if (
                            enrollmentStatus.isEnrollmentOpen &&
                            verificationStatus.isVerified &&
                            selectedInGroup.length > 0 &&
                            enrollingCourses.length === 0 &&
                            unitsInfo.currentEnrolledUnits < unitsInfo.maxUnits
                          ) {
                            handleBulkEnrollment(groupKey);
                          }
                        }}
                        disabled={
                          !enrollmentStatus.isEnrollmentOpen ||
                          !verificationStatus.isVerified ||
                          selectedInGroup.length === 0 ||
                          enrollingCourses.length > 0 ||
                          unitsInfo.currentEnrolledUnits >= unitsInfo.maxUnits
                        }
                      >
                        {enrollingCourses.length > 0 &&
                        selectedInGroup.some((id) =>
                          enrollingCourses.includes(id)
                        ) ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Enrolling...</span>
                          </>
                        ) : unitsInfo.currentEnrolledUnits >=
                          unitsInfo.maxUnits ? (
                          <>
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Units Maxed</span>
                          </>
                        ) : selectedInGroup.length === 0 ? (
                          <>
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Select Courses</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Enroll ({selectedInGroup.length})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.courses.map((course) => {
                      const isSelected = selectedInGroup.includes(course.id);
                      const isEnrolling = enrollingCourses.includes(course.id);

                      return (
                        <Card
                          key={course.id}
                          id={`course-card-${course.id}`}
                          className={cn(
                            "flex flex-col overflow-hidden transition-all duration-200 hover:shadow-sm group border-slate-200 dark:border-slate-700",
                            isSelected &&
                              "ring-1 ring-blue-500 border-blue-200 dark:border-blue-800",
                            enrolledCourseMap[course.id] && "opacity-80"
                          )}
                        >
                          {/* Card top accent color based on status - more subtle */}
                          <div
                            className={cn(
                              "h-0.5 w-full",
                              course.status === "OPEN"
                                ? "bg-green-500"
                                : course.status === "CLOSED"
                                ? "bg-red-500"
                                : "bg-gray-500"
                            )}
                          />

                          <CardHeader className="p-3 relative">
                            {/* Checkbox positioned at top-right - more subtle */}
                            <div className="absolute top-3 right-3">
                              <Checkbox
                                id={`course-${course.id}`}
                                checked={isSelected}
                                onCheckedChange={() =>
                                  toggleCourseSelection(groupKey, course.id)
                                }
                                disabled={!!enrolledCourseMap[course.id]}
                                className="h-4 w-4 transition-transform group-hover:scale-110"
                              />
                            </div>

                            <div className="flex-1 pr-6">
                              {/* Course code and status badges - more compact */}
                              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                                  {course.code}
                                </span>

                                {/* Course status indicator - more subtle */}
                                {course.status === "OPEN" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-100 dark:border-green-800/50">
                                    <span className="h-1 w-1 rounded-full bg-green-500"></span>
                                    OPEN
                                  </span>
                                ) : course.status === "CLOSED" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-100 dark:border-red-800/50">
                                    <span className="h-1 w-1 rounded-full bg-red-500"></span>
                                    CLOSED
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-100 dark:border-gray-800/50">
                                    <span className="h-1 w-1 rounded-full bg-gray-500"></span>
                                    {course.status}
                                  </span>
                                )}

                                {/* Credits indicator - more subtle */}
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border border-slate-100 dark:border-slate-800/50 ml-auto">
                                  {course.credits}{" "}
                                  {course.credits === 1 ? "credit" : "credits"}
                                </span>
                              </div>

                              {/* Course title - cleaner typography */}
                              <CardTitle>
                                <label
                                  htmlFor={`course-${course.id}`}
                                  className="text-base font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                                >
                                  {course.name}
                                </label>
                              </CardTitle>

                              {/* Course description - more compact */}
                              <CardDescription className="mt-1">
                                <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                                  {course.description}
                                </p>
                              </CardDescription>

                              {/* Instructor info - more subtle */}
                              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <svg
                                  className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-slate-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                <span className="truncate">
                                  {course.faculty
                                    ? `${
                                        course.faculty.profile?.firstName || ""
                                      } ${
                                        course.faculty.profile?.lastName || ""
                                      }`
                                    : "No instructor assigned"}
                                </span>
                              </div>
                            </div>
                          </CardHeader>

                          {course.prerequisites.length > 0 && (
                            <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="w-3.5 h-3.5 text-slate-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                  </svg>
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Prerequisites
                                  </span>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    {course.prerequisites.length}
                                  </span>
                                </div>

                                {/* Show completion status - more subtle */}
                                {course.prerequisites.every((p) =>
                                  completedCourseIds.includes(p.id)
                                ) ? (
                                  <div className="inline-flex items-center gap-1 text-green-600 dark:text-green-500 text-[10px] font-medium">
                                    <span className="h-1 w-1 rounded-full bg-green-500"></span>
                                    <span>All met</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-500 text-[10px] font-medium">
                                    <span className="h-1 w-1 rounded-full bg-amber-500"></span>
                                    <span>Required</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {course.prerequisites.map((prerequisite) => {
                                  const isCompleted =
                                    completedCourseIds.includes(
                                      prerequisite.id
                                    );

                                  return (
                                    <TooltipProvider key={prerequisite.id}>
                                      <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                          <button
                                            type="button"
                                            className={cn(
                                              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors",
                                              isCompleted
                                                ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30 dark:hover:bg-green-900/30"
                                                : "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30 dark:hover:bg-amber-900/30"
                                            )}
                                            onClick={() => {
                                              // Find the group that contains this prerequisite course
                                              const groupKey = Object.keys(
                                                groupedCourses
                                              ).find((key) =>
                                                groupedCourses[
                                                  key
                                                ].courses.some(
                                                  (c) =>
                                                    c.id === prerequisite.id
                                                )
                                              );

                                              if (groupKey) {
                                                // Scroll to the group
                                                const element =
                                                  document.getElementById(
                                                    `course-group-${groupKey}`
                                                  );
                                                if (element) {
                                                  element.scrollIntoView({
                                                    behavior: "smooth",
                                                    block: "start",
                                                  });

                                                  // Highlight the course card
                                                  const courseCard =
                                                    document.getElementById(
                                                      `course-card-${prerequisite.id}`
                                                    );
                                                  if (courseCard) {
                                                    courseCard.classList.add(
                                                      "ring-1",
                                                      "ring-blue-500"
                                                    );
                                                    setTimeout(() => {
                                                      courseCard.classList.remove(
                                                        "ring-1",
                                                        "ring-blue-500"
                                                      );
                                                    }, 2000);
                                                  }
                                                }
                                              }
                                            }}
                                          >
                                            {isCompleted ? (
                                              <span className="h-1 w-1 rounded-full bg-green-500"></span>
                                            ) : (
                                              <span className="h-1 w-1 rounded-full bg-amber-500"></span>
                                            )}
                                            <span className="truncate max-w-[80px]">
                                              {prerequisite.code}
                                            </span>
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          className="p-2 max-w-[200px]"
                                        >
                                          <div className="space-y-1">
                                            <p className="text-xs font-medium">
                                              {prerequisite.name}
                                            </p>
                                            <p className="text-[10px] text-slate-500">
                                              {isCompleted
                                                ? "✓ You have completed this prerequisite"
                                                : "⚠ Required before enrollment"}
                                            </p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <CardFooter className="mt-auto p-3 border-t border-slate-100 dark:border-slate-800">
                            {enrolledCourseMap[course.id] ? (
                              <div className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-400 text-xs font-medium shadow-sm">
                                <svg
                                  className="w-3.5 h-3.5 flex-shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="truncate">
                                  Enrolled ({enrolledCourseMap[course.id]})
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className={cn(
                                  "w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border shadow-sm",
                                  !enrollmentStatus.isEnrollmentOpen ||
                                    !verificationStatus.isVerified ||
                                    unitsInfo.currentEnrolledUnits >=
                                      unitsInfo.maxUnits
                                    ? "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                                    : course.prerequisites.length > 0 &&
                                      !course.prerequisites.every((p) =>
                                        completedCourseIds.includes(p.id)
                                      )
                                    ? "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30 hover:from-amber-100 hover:to-amber-200 dark:hover:from-amber-900/30 dark:hover:to-amber-900/40 hover:shadow-md"
                                    : "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/30 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-900/40 hover:shadow-md"
                                )}
                                onClick={() => handleEnrollment(course.id)}
                                disabled={
                                  !enrollmentStatus.isEnrollmentOpen ||
                                  !verificationStatus.isVerified ||
                                  isEnrolling ||
                                  unitsInfo.currentEnrolledUnits >=
                                    unitsInfo.maxUnits ||
                                  (course.prerequisites.length > 0 &&
                                    !course.prerequisites.every((p) =>
                                      completedCourseIds.includes(p.id)
                                    ))
                                }
                              >
                                {isEnrolling ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
                                    <span>Enrolling...</span>
                                  </>
                                ) : !verificationStatus.isVerified ? (
                                  <>
                                    <svg
                                      className="w-3.5 h-3.5 flex-shrink-0"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                      />
                                    </svg>
                                    <span>Not Verified</span>
                                  </>
                                ) : unitsInfo.currentEnrolledUnits >=
                                  unitsInfo.maxUnits ? (
                                  <>
                                    <svg
                                      className="w-3.5 h-3.5 flex-shrink-0"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span>Units Maxed</span>
                                  </>
                                ) : course.prerequisites.length > 0 &&
                                  !course.prerequisites.every((p) =>
                                    completedCourseIds.includes(p.id)
                                  ) ? (
                                  <>
                                    <svg
                                      className="w-3.5 h-3.5 flex-shrink-0"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                      />
                                    </svg>
                                    <span>Prerequisites Needed</span>
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      className="w-3.5 h-3.5 flex-shrink-0"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                      />
                                    </svg>
                                    <span>Enroll in Course</span>
                                  </>
                                )}
                              </button>
                            )}
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
