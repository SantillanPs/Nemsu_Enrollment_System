"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
  Loader2,
} from "lucide-react";
import StudentDashboardLoading from "./loading";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const isVerified = session?.user?.isVerified;
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Mock data for student dashboard
  const enrollmentRequests = [
    {
      id: 1,
      course: "Introduction to Computer Science",
      status: "pending",
      date: "2023-08-15",
    },
    { id: 2, course: "Calculus I", status: "approved", date: "2023-08-10" },
    {
      id: 3,
      course: "English Composition",
      status: "rejected",
      date: "2023-08-05",
    },
  ];

  const upcomingDeadlines = [
    { id: 1, title: "Fall Semester Enrollment", date: "2023-09-01" },
    { id: 2, title: "Tuition Payment Deadline", date: "2023-08-25" },
    { id: 3, title: "Course Add/Drop Period Ends", date: "2023-09-15" },
  ];

  const announcements = [
    {
      id: 1,
      title: "New Course Offerings",
      content: "Check out the new courses available for the Fall semester!",
      date: "2023-08-10",
    },
    {
      id: 2,
      title: "Library Hours Extended",
      content:
        "The university library will now be open until midnight on weekdays.",
      date: "2023-08-08",
    },
  ];

  // Show loading state while data is being fetched
  if (isLoading || status === "loading") {
    return <StudentDashboardLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Verification Status Card */}
      {isVerified ? (
        <Card className="border-green-200 bg-green-50 mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">
                  Verified Student Account
                </h3>
                <p className="text-sm text-green-700">
                  Your account is verified. You can enroll in courses and all
                  your documents are automatically verified.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-yellow-200 bg-yellow-50 mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Account Verification Required
                </h3>
                <p className="text-sm text-yellow-700">
                  Your account needs to be verified before you can enroll in
                  courses. Please visit the{" "}
                  <Link
                    href="/student/profile/documents"
                    className="underline font-medium"
                  >
                    Documents page
                  </Link>{" "}
                  to upload your required documents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              For Fall 2023 Semester
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Credits
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Out of 120 required</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPA</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.7</div>
            <p className="text-xs text-muted-foreground">Current cumulative</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Enrollment Requests</CardTitle>
            <CardDescription>
              Track the status of your course enrollment requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollmentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <p className="font-medium">{request.course}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested on {request.date}
                    </p>
                  </div>
                  <Badge
                    className={
                      request.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : request.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </Badge>
                </div>
              ))}
              <div className="text-center pt-2">
                <Link href="/student/enrollments">
                  <Button variant="outline">View All Enrollments</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Important dates to remember</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center border-b pb-4"
                >
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{deadline.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {deadline.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Latest updates from the university</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {announcement.date}
                  </p>
                </div>
                <p className="mt-2 text-sm">{announcement.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
