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
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Info as InfoIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
      {/* Super Admin Notice */}
      {isSuperAdmin && (
        <Alert className="bg-amber-50 border-amber-200 mb-6">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Super Admin View</AlertTitle>
          <AlertDescription className="text-amber-700">
            You are viewing this page as a Super Admin. You can see all courses,
            including those with status "CLOSED" which are hidden from regular
            students. Courses with status "CLOSED" are marked with a red badge.
          </AlertDescription>
        </Alert>
      )}

      {/* Verification Status Alert */}
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

      {/* Enrollment Period Alerts */}
      {!enrollmentStatus.isEnrollmentOpen && (
        <Alert
          className={
            enrollmentStatus.nextPeriod
              ? "bg-amber-50 border-amber-200 mb-6"
              : "bg-red-50 border-red-200 mb-6"
          }
        >
          <AlertCircle
            className={
              enrollmentStatus.nextPeriod
                ? "h-4 w-4 text-amber-600"
                : "h-4 w-4 text-red-600"
            }
          />
          <AlertTitle
            className={
              enrollmentStatus.nextPeriod ? "text-amber-800" : "text-red-800"
            }
          >
            {enrollmentStatus.nextPeriod
              ? "Enrollment Period Coming Soon"
              : "Enrollment is Currently Closed"}
          </AlertTitle>
          <AlertDescription
            className={
              enrollmentStatus.nextPeriod ? "text-amber-700" : "text-red-700"
            }
          >
            {enrollmentStatus.nextPeriod ? (
              <>
                The next enrollment period ({enrollmentStatus.nextPeriod.name})
                will start on{" "}
                {new Date(
                  enrollmentStatus.nextPeriod.startDate
                ).toLocaleDateString()}{" "}
                at{" "}
                {new Date(
                  enrollmentStatus.nextPeriod.startDate
                ).toLocaleTimeString()}
                .
              </>
            ) : (
              "There are no active enrollment periods at this time. Please check back later or contact the registrar's office for more information."
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Semester Information */}
      {currentSemester.semester !== "NONE" && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Filtered Courses</AlertTitle>
          <AlertDescription className="text-blue-700">
            You are viewing courses for{" "}
            {currentSemester.semester === "FIRST"
              ? "First Semester"
              : currentSemester.semester === "SECOND"
              ? "Second Semester"
              : "Summer"}{" "}
            {session?.user && "that match your current year"}
          </AlertDescription>
        </Alert>
      )}

      {/* Units Information Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Credit Units</CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">Current Enrolled Units</div>
            <div className="text-sm font-medium">
              {unitsInfo.currentEnrolledUnits} / {unitsInfo.maxUnits} units
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                unitsInfo.currentEnrolledUnits / unitsInfo.maxUnits > 0.8
                  ? "bg-red-500"
                  : unitsInfo.currentEnrolledUnits / unitsInfo.maxUnits > 0.5
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (unitsInfo.currentEnrolledUnits / unitsInfo.maxUnits) * 100
                )}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            You can enroll in courses up to your maximum allowed units (
            {unitsInfo.maxUnits}).
          </p>
        </div>
      </Card>

      {enrollmentStatus.isEnrollmentOpen &&
        enrollmentStatus.currentPeriod &&
        verificationStatus.isVerified && (
          <Alert className="bg-green-50 border-green-200 mb-6">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">
              Enrollment is Open
            </AlertTitle>
            <AlertDescription className="text-green-700">
              The current enrollment period (
              {enrollmentStatus.currentPeriod.name}) is active until{" "}
              {new Date(
                enrollmentStatus.currentPeriod.endDate
              ).toLocaleDateString()}{" "}
              at{" "}
              {new Date(
                enrollmentStatus.currentPeriod.endDate
              ).toLocaleTimeString()}
              .
            </AlertDescription>
          </Alert>
        )}

      <div className="bg-white dark:bg-slate-900 border rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Available Courses
          </h1>

          <Button
            onClick={handleEnrollAll}
            disabled={
              !enrollmentStatus.isEnrollmentOpen ||
              !verificationStatus.isVerified ||
              enrollingCourses.length > 0 ||
              courses.length === 0
            }
            className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {enrollingCourses.length > 0 ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enrolling in All Courses...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
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
                Enroll in All Available Courses
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
          <div className="flex flex-1 gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                type="text"
                placeholder="Search courses by name, code, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-900"
              />
            </div>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year === "all" ? "All Years" : `Year ${year}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedSemester}
              onValueChange={setSelectedSemester}
            >
              <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester === "all" ? "All Semesters" : semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm"
              >
                <div className="bg-slate-50 dark:bg-slate-800/50 border-b px-6 py-4">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span className="text-slate-900 dark:text-slate-100">
                          {group.title}
                        </span>
                        <Badge variant="outline" className="ml-2">
                          {group.courses.length}{" "}
                          {group.courses.length === 1 ? "course" : "courses"}
                        </Badge>
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {group.semester === "FIRST"
                          ? "First Semester"
                          : group.semester === "SECOND"
                          ? "Second Semester"
                          : "Summer Term"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center bg-white dark:bg-slate-800 border rounded-md px-3 py-1.5">
                        <Checkbox
                          id={`select-all-${groupKey}`}
                          checked={allSelected}
                          onCheckedChange={() =>
                            toggleSelectAll(groupKey, allCoursesInGroup)
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor={`select-all-${groupKey}`}
                          className="text-sm cursor-pointer font-medium"
                        >
                          Select All Courses
                        </label>
                      </div>
                      <Button
                        size="sm"
                        className={cn(
                          "h-9",
                          selectedInGroup.length === 0 && "opacity-70"
                        )}
                        onClick={() => handleBulkEnrollment(groupKey)}
                        disabled={
                          !enrollmentStatus.isEnrollmentOpen ||
                          !verificationStatus.isVerified ||
                          selectedInGroup.length === 0 ||
                          enrollingCourses.length > 0
                        }
                      >
                        {enrollingCourses.length > 0 &&
                        selectedInGroup.some((id) =>
                          enrollingCourses.includes(id)
                        ) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 mr-1.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Enroll Selected ({selectedInGroup.length})
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.courses.map((course) => {
                      const isSelected = selectedInGroup.includes(course.id);
                      const isEnrolling = enrollingCourses.includes(course.id);

                      return (
                        <Card
                          key={course.id}
                          className={cn(
                            "flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md",
                            isSelected && "ring-2 ring-primary ring-offset-2"
                          )}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id={`course-${course.id}`}
                                checked={isSelected}
                                onCheckedChange={() =>
                                  toggleCourseSelection(groupKey, course.id)
                                }
                                disabled={!!enrolledCourseMap[course.id]}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                        {course.code}
                                      </Badge>

                                      {/* Course status badge */}
                                      {course.status === "OPEN" ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
                                          OPEN
                                        </Badge>
                                      ) : course.status === "CLOSED" ? (
                                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300">
                                          CLOSED{" "}
                                          {isSuperAdmin &&
                                            "(Hidden from students)"}
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300">
                                          {course.status}
                                        </Badge>
                                      )}
                                    </div>
                                    <CardTitle>
                                      <label
                                        htmlFor={`course-${course.id}`}
                                        className="text-lg cursor-pointer hover:text-primary"
                                      >
                                        {course.name}
                                      </label>
                                    </CardTitle>
                                  </div>
                                  <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                                    {course.credits}{" "}
                                    {course.credits === 1
                                      ? "credit"
                                      : "credits"}
                                  </Badge>
                                </div>
                                <CardDescription>
                                  <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                                    {course.description}
                                  </p>
                                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                    <svg
                                      className="w-4 h-4 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                    <span>
                                      {course.faculty
                                        ? `${
                                            course.faculty.profile?.firstName ||
                                            ""
                                          } ${
                                            course.faculty.profile?.lastName ||
                                            ""
                                          }`
                                        : "No instructor assigned"}
                                    </span>
                                  </div>
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>

                          {course.prerequisites.length > 0 && (
                            <div className="px-6 py-3 border-t border-dashed bg-slate-50/50 dark:bg-slate-900/20">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">
                                    Prerequisites
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-normal bg-white dark:bg-slate-800"
                                  >
                                    {course.prerequisites.length}{" "}
                                    {course.prerequisites.length === 1
                                      ? "course"
                                      : "courses"}
                                  </Badge>
                                </div>

                                {/* Show completion status */}
                                <div className="ml-auto">
                                  {course.prerequisites.every((p) =>
                                    completedCourseIds.includes(p.id)
                                  ) ? (
                                    <div className="flex items-center text-green-600 dark:text-green-500 text-xs font-medium">
                                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                                      All prerequisites met
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-amber-600 dark:text-amber-500 text-xs font-medium">
                                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                                      Prerequisites needed
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-2">
                                {course.prerequisites.map((prerequisite) => {
                                  const isCompleted =
                                    completedCourseIds.includes(
                                      prerequisite.id
                                    );
                                  return (
                                    <div
                                      key={prerequisite.id}
                                      className={cn(
                                        "flex items-center px-2.5 py-1 rounded-md text-xs border",
                                        isCompleted
                                          ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                                          : "border-slate-200 bg-white text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                      )}
                                    >
                                      <span className="font-medium">
                                        {prerequisite.code}
                                      </span>
                                      {isCompleted && (
                                        <svg
                                          className="ml-1.5 w-3.5 h-3.5 text-green-500"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <CardFooter className="mt-auto pt-3 pb-4 px-6 flex flex-col gap-3">
                            {course.prerequisites.length > 0 && (
                              <div className="w-full">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full text-xs h-8 border-dashed"
                                    >
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
                                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      View prerequisite details
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2 text-xl">
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                          {course.code}
                                        </Badge>
                                        Prerequisites
                                      </DialogTitle>
                                      <DialogDescription className="pt-2 text-base">
                                        The following courses must be completed
                                        before enrolling in{" "}
                                        <span className="font-medium">
                                          {course.name}
                                        </span>
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3 mt-4">
                                      {course.prerequisites.map(
                                        (prerequisite) => {
                                          const isCompleted =
                                            completedCourseIds.includes(
                                              prerequisite.id
                                            );
                                          return (
                                            <div
                                              key={prerequisite.id}
                                              className={cn(
                                                "border rounded-lg p-4 transition-all",
                                                isCompleted
                                                  ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800"
                                                  : "border-slate-200 dark:border-slate-700"
                                              )}
                                            >
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                                      {prerequisite.code}
                                                    </Badge>
                                                    {isCompleted ? (
                                                      <span className="inline-flex items-center text-xs font-medium text-green-600">
                                                        <svg
                                                          className="w-3.5 h-3.5 mr-1"
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
                                                        Completed
                                                      </span>
                                                    ) : (
                                                      <span className="inline-flex items-center text-xs font-medium text-amber-600">
                                                        <svg
                                                          className="w-3.5 h-3.5 mr-1"
                                                          fill="none"
                                                          viewBox="0 0 24 24"
                                                          stroke="currentColor"
                                                        >
                                                          <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                          />
                                                        </svg>
                                                        Required
                                                      </span>
                                                    )}
                                                  </div>
                                                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                                    {prerequisite.name}
                                                  </h4>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                    <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                      You must complete all prerequisites before
                                      you can enroll in this course.
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}

                            {enrolledCourseMap[course.id] ? (
                              <Button
                                className="w-full font-medium bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                disabled={true}
                              >
                                <svg
                                  className="w-4 h-4 mr-2"
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
                                {`Already Enrolled (${
                                  enrolledCourseMap[course.id]
                                })`}
                              </Button>
                            ) : (
                              <Button
                                className={cn(
                                  "w-full font-medium",
                                  course.prerequisites.length > 0 &&
                                    !course.prerequisites.every((p) =>
                                      completedCourseIds.includes(p.id)
                                    ) &&
                                    "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                )}
                                onClick={() => handleEnrollment(course.id)}
                                disabled={
                                  !enrollmentStatus.isEnrollmentOpen ||
                                  !verificationStatus.isVerified ||
                                  isEnrolling ||
                                  (course.prerequisites.length > 0 &&
                                    !course.prerequisites.every((p) =>
                                      completedCourseIds.includes(p.id)
                                    ))
                                }
                              >
                                {isEnrolling ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enrolling...
                                  </>
                                ) : !verificationStatus.isVerified ? (
                                  "Account Not Verified"
                                ) : course.prerequisites.length > 0 &&
                                  !course.prerequisites.every((p) =>
                                    completedCourseIds.includes(p.id)
                                  ) ? (
                                  "Prerequisites Required"
                                ) : (
                                  "Enroll in Course"
                                )}
                              </Button>
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
